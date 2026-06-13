from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    CartView,
    CartItemCreateView,
    CartItemDeleteView,
    CartItemUpdateView,
    OrderListView,
    OrderDetailView,
    OrderCreateView,
)
from .admin_views import (
    AdminProductViewSet,
    AdminCategoryViewSet,
    AdminOrderViewSet,
    AdminDashboardStatsView,
    AdminUserViewSet,
)

router = DefaultRouter()
router.register(r'admin/products', AdminProductViewSet, basename='admin-product')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    # Admin routes
    path('', include(router.urls)),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    
    # Public category endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    
    # Product endpoints
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemCreateView.as_view(), name='cart-item-create'),
    path('cart/items/<int:pk>/', CartItemDeleteView.as_view(), name='cart-item-delete'),
    path('cart/items/<int:pk>/update/', CartItemUpdateView.as_view(), name='cart-item-update'),
    
    # Order endpoints
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
]
