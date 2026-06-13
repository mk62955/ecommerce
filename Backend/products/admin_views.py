from rest_framework import generics, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Product, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'is_verified', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'defaultpassword123')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin CRUD operations for users"""
    queryset = User.objects.all().order_by('-id')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['id', 'email']

class AdminProductViewSet(viewsets.ModelViewSet):
    """Admin CRUD operations for products"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name', 'stock']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """Admin CRUD operations for categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    lookup_field = 'slug'


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin view orders"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status', 'total_amount']
    ordering = ['-created_at']
    lookup_field = 'order_number'

    @action(detail=True, methods=['patch'])
    def update_status(self, request, order_number=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_payment_status(self, request, order_number=None):
        """Update payment status"""
        order = self.get_object()
        new_status = request.data.get('payment_status')
        
        if new_status not in dict(Order.PAYMENT_STATUS_CHOICES):
            return Response(
                {'error': 'Invalid payment status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.payment_status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)


class AdminDashboardStatsView(generics.RetrieveAPIView):
    """Get admin dashboard statistics"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        # Total statistics
        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(
            payment_status='completed'
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        # Recent orders (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_orders = Order.objects.filter(
            created_at__gte=seven_days_ago
        ).count()

        # Order status breakdown
        order_status_breakdown = Order.objects.values('status').annotate(
            count=Count('id')
        )

        # Low stock products
        low_stock_products = Product.objects.filter(
            stock__lt=10
        ).values('id', 'name', 'stock', 'price').order_by('stock')[:5]

        # Top selling products
        top_products = OrderItem.objects.values(
            'product__id', 'product__name', 'product__price'
        ).annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]

        return Response({
            'total_products': total_products,
            'total_categories': total_categories,
            'total_orders': total_orders,
            'total_revenue': str(total_revenue),
            'recent_orders': recent_orders,
            'order_status_breakdown': list(order_status_breakdown),
            'low_stock_products': list(low_stock_products),
            'top_selling_products': list(top_products),
        })
