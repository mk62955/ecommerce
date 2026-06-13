from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .image_utils import optimize_product_image


def unique_slug(model, value, instance=None):
    base_slug = slugify(value) or "item"
    slug = base_slug
    counter = 2
    queryset = model.objects.all()

    if instance:
        queryset = queryset.exclude(pk=instance.pk)

    while queryset.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'subtitle']
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def validate(self, attrs):
        if not attrs.get('slug') and attrs.get('name'):
            attrs['slug'] = unique_slug(Category, attrs['name'], self.instance)
        elif attrs.get('slug'):
            attrs['slug'] = unique_slug(Category, attrs['slug'], self.instance)
        return attrs


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        source='category'
    )
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'stock', 'is_available', 'image', 'image_url', 'category', 'category_id', 'created_at']
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def validate(self, attrs):
        if not attrs.get('slug') and attrs.get('name'):
            attrs['slug'] = unique_slug(Product, attrs['name'], self.instance)
        elif attrs.get('slug'):
            attrs['slug'] = unique_slug(Product, attrs['slug'], self.instance)

        if attrs.get('image'):
            attrs['image'] = optimize_product_image(attrs['image'])

        return attrs
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            image_url = obj.image.url
            if request:
                return request.build_absolute_uri(image_url)
            return image_url
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        source='product'
    )
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'total_items', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()
    
    def get_total_items(self, obj):
        return obj.get_total_items()


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'status', 'payment_status',
            'total_amount', 'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_zip', 'shipping_country', 'items', 'tracking_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']
