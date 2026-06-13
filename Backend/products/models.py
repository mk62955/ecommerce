from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import User


class Category(models.Model):
    """Product category model"""
    name = models.CharField(
        max_length=100,
        unique=True
    )
    
    slug = models.SlugField(
        unique=True
    )
    
    description = models.TextField(
        blank=True,
        null=True
    )
    
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        help_text="Short description for category"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Product model with category, price, and inventory"""
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    
    name = models.CharField(
        max_length=255
    )
    
    slug = models.SlugField(
        unique=True
    )
    
    description = models.TextField(
        blank=True
    )
    
    image = models.ImageField(
        upload_to='products/',
        blank=True,
        null=True,
        help_text="Product image (will be stored in media folder)"
    )
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    
    stock = models.PositiveIntegerField(
        default=0
    )
    
    is_available = models.BooleanField(
        default=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.name


class Cart(models.Model):
    """Shopping cart for users"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    def __str__(self):
        return f"Cart of {self.user.email}"
    
    def get_total(self):
        """Calculate total cart value"""
        return sum(
            item.get_subtotal() for item in self.items.all()
        )
    
    def get_total_items(self):
        """Get total number of items in cart"""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Individual items in shopping cart"""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    
    added_at = models.DateTimeField(
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def get_subtotal(self):
        """Calculate subtotal for this cart item"""
        return self.product.price * self.quantity


class Order(models.Model):
    """Customer orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    
    order_number = models.CharField(
        max_length=50,
        unique=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    
    # Shipping information
    shipping_address = models.TextField()
    
    shipping_city = models.CharField(
        max_length=100
    )
    
    shipping_state = models.CharField(
        max_length=100
    )
    
    shipping_zip = models.CharField(
        max_length=20
    )
    
    shipping_country = models.CharField(
        max_length=100
    )
    
    # Order timestamps
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    # Optional tracking
    tracking_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    """Individual items in an order"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )
    
    quantity = models.PositiveIntegerField()
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price at the time of order"
    )
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.name} in Order {self.order.order_number}"
    
    def get_subtotal(self):
        """Calculate subtotal for this order item"""
        return self.price * self.quantity
