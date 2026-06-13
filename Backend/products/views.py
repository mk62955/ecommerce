from rest_framework import generics, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Q
import uuid

from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
)


class CategoryListView(generics.ListAPIView):
    """Get all product categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 48


class ProductListView(generics.ListAPIView):
    """Get all products with filtering and search"""
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            categories = category.split(',')
            if all(c.isdigit() for c in categories):
                queryset = queryset.filter(category__id__in=categories)
            else:
                queryset = queryset.filter(category__slug__in=categories)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Get product details by slug"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class CartView(generics.RetrieveUpdateAPIView):
    """Get or update user's cart"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemCreateView(generics.CreateAPIView):
    """Add item to cart"""
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise ValidationError({'product_id': 'Product not found'})
        
        if quantity < 1:
            raise ValidationError({'quantity': 'Quantity must be at least 1'})
        
        if quantity > product.stock:
            raise ValidationError({
                'quantity': f'Only {product.stock} items available'
            })
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )
        
        if not created:
            # Update quantity if item already exists
            new_quantity = cart_item.quantity + int(quantity)
            if new_quantity > product.stock:
                raise ValidationError({
                    'quantity': f'Only {product.stock} items available'
                })
            cart_item.quantity = new_quantity
            cart_item.save()
        else:
            cart_item.quantity = int(quantity)
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemUpdateView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is None:
            raise ValidationError({'quantity': 'Quantity is required'})
        
        if quantity < 1:
            raise ValidationError({'quantity': 'Quantity must be at least 1'})
        
        if quantity > cart_item.product.stock:
            raise ValidationError({
                'quantity': f'Only {cart_item.product.stock} items available'
            })
        
        cart_item.quantity = int(quantity)
        cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemDeleteView(generics.DestroyAPIView):
    """Remove item from cart"""
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


class OrderListView(generics.ListAPIView):
    """Get user's orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCreateView(generics.CreateAPIView):
    """Create order from cart"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise ValidationError({'cart': 'Cart is empty'})
        
        cart_items = cart.items.all()
        if not cart_items.exists():
            raise ValidationError({'cart': 'Cart is empty'})
        
        # Validate required fields
        required_fields = [
            'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_zip', 'shipping_country'
        ]
        for field in required_fields:
            if not request.data.get(field):
                raise ValidationError({field: 'This field is required'})
        
        # Calculate total
        total_amount = cart.get_total()
        
        # Create order
        order = Order.objects.create(
            user=user,
            order_number=f"ORD-{uuid.uuid4().hex[:12].upper()}",
            total_amount=total_amount,
            shipping_address=request.data.get('shipping_address'),
            shipping_city=request.data.get('shipping_city'),
            shipping_state=request.data.get('shipping_state'),
            shipping_zip=request.data.get('shipping_zip'),
            shipping_country=request.data.get('shipping_country'),
        )
        
        # Create order items from cart items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        # Clear cart
        cart_items.delete()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
