from django.contrib import admin
from .models import Category, Product, Cart, CartItem, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_available', 'created_at')
    list_filter = ('category', 'is_available', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Product Information', {
            'fields': ('category', 'name', 'slug', 'description', 'image')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'stock', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('added_at', 'updated_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_total_items', 'get_total', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CartItemInline]
    
    def get_total_items(self, obj):
        return obj.get_total_items()
    get_total_items.short_description = 'Total Items'
    
    def get_total(self, obj):
        return f"${obj.get_total()}"
    get_total.short_description = 'Total Price'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('get_subtotal',)
    
    def get_subtotal(self, obj):
        return f"${obj.get_subtotal()}"
    get_subtotal.short_description = 'Subtotal'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__email', 'tracking_number')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status')
        }),
        ('Shipping Details', {
            'fields': ('shipping_address', 'shipping_city', 'shipping_state', 'shipping_zip', 'shipping_country')
        }),
        ('Tracking', {
            'fields': ('tracking_number',),
            'classes': ('collapse',)
        }),
        ('Amount', {
            'fields': ('total_amount',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
