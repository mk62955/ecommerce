# Products App - Setup and Documentation

## Overview

The products app includes models for managing an e-commerce store with categories, products, shopping cart, and orders functionality.

## Models

### 1. Category
Manages product categories that match your frontend categories (Fashion, Electronics, Home, Appliances, For You).

**Fields:**
- `name` - Category name (unique)
- `slug` - URL-friendly version (unique)
- `description` - Detailed description
- `subtitle` - Short description for display
- `created_at`, `updated_at` - Timestamps

### 2. Product
Represents individual products available for sale.

**Fields:**
- `category` - Foreign key to Category
- `name` - Product name
- `slug` - URL-friendly name (unique)
- `description` - Detailed product description
- `price` - Product price (DecimalField)
- `stock` - Number of items available
- `is_available` - Boolean to mark product as available/unavailable
- `created_at`, `updated_at` - Timestamps

### 3. Cart
Represents a shopping cart for each user (one-to-one relationship).

**Fields:**
- `user` - One-to-one relationship with User
- `created_at`, `updated_at` - Timestamps

**Methods:**
- `get_total()` - Returns total cart value
- `get_total_items()` - Returns total number of items

### 4. CartItem
Individual items in a user's shopping cart.

**Fields:**
- `cart` - Foreign key to Cart
- `product` - Foreign key to Product
- `quantity` - Number of items
- `added_at`, `updated_at` - Timestamps

**Constraints:**
- Unique together: (cart, product) - prevents duplicate products in same cart

**Methods:**
- `get_subtotal()` - Returns price × quantity

### 5. Order
Represents a completed order/purchase.

**Fields:**
- `user` - Foreign key to User
- `order_number` - Unique order identifier (auto-generated)
- `status` - Order status (pending, confirmed, shipped, delivered, cancelled)
- `payment_status` - Payment status (pending, completed, failed)
- `total_amount` - Total order value
- `shipping_address` - Full shipping address
- `shipping_city` - City
- `shipping_state` - State/Province
- `shipping_zip` - Postal code
- `shipping_country` - Country
- `tracking_number` - Optional shipping tracking number
- `created_at`, `updated_at` - Timestamps

### 6. OrderItem
Individual items within an order.

**Fields:**
- `order` - Foreign key to Order
- `product` - Foreign key to Product (can be null if product is deleted)
- `quantity` - Number of items ordered
- `price` - Price at time of order

**Methods:**
- `get_subtotal()` - Returns price × quantity

## Setup Instructions

### 1. Create Database Migrations
```bash
cd Backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Create Initial Categories
You can create categories through Django admin or via API:

```python
# Django shell (python manage.py shell)
from products.models import Category

categories = [
    {
        'name': 'For You',
        'slug': 'for-you',
        'subtitle': 'Fresh picks selected from popular products and daily deals.'
    },
    {
        'name': 'Fashion',
        'slug': 'fashion',
        'subtitle': 'Trending outfits, everyday essentials, and seasonal styles.'
    },
    {
        'name': 'Electronics',
        'slug': 'electronics',
        'subtitle': 'Smart gadgets and accessories for work, home, and entertainment.'
    },
    {
        'name': 'Home',
        'slug': 'home-products',
        'subtitle': 'Comfortable, practical items to make your space feel complete.'
    },
    {
        'name': 'Appliances',
        'slug': 'appliances',
        'subtitle': 'Useful appliances for the kitchen, laundry, and daily routines.'
    }
]

for cat in categories:
    Category.objects.create(**cat)
```

### 3. Create Sample Products
```python
from products.models import Product, Category

fashion = Category.objects.get(slug='fashion')
Product.objects.create(
    category=fashion,
    name='Denim Jacket',
    slug='denim-jacket',
    description='Classic denim jacket for all seasons',
    price=79.99,
    stock=50,
    is_available=True
)
```

## API Endpoints

### Categories
- `GET /api/products/categories/` - List all categories
  - Query params: `search=`, `ordering=`

### Products
- `GET /api/products/products/` - List all available products
  - Query params: `search=`, `category=`, `min_price=`, `max_price=`, `ordering=`
- `GET /api/products/products/{slug}/` - Get product details

### Shopping Cart
- `GET /api/products/cart/` - Get user's cart (requires authentication)
- `POST /api/products/cart/items/` - Add item to cart
  ```json
  {
    "product_id": 1,
    "quantity": 2
  }
  ```
- `PUT /api/products/cart/items/{id}/update/` - Update cart item quantity
  ```json
  {
    "quantity": 3
  }
  ```
- `DELETE /api/products/cart/items/{id}/` - Remove item from cart

### Orders
- `GET /api/products/orders/` - List user's orders (requires authentication)
  - Query params: `ordering=`
- `GET /api/products/orders/{order_number}/` - Get order details
- `POST /api/products/orders/create/` - Create order from cart (requires authentication)
  ```json
  {
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_zip": "10001",
    "shipping_country": "USA"
  }
  ```

## Django Admin

Access all models through Django admin at `/admin/`:
- Categories - Create, edit, and delete categories
- Products - Manage inventory, pricing, and availability
- Carts - View and manage user shopping carts
- Orders - Track orders, update status, and payment

## Key Features

1. **Stock Management** - Products track available inventory
2. **Cart Management** - Users can add/remove/update quantities
3. **Order Tracking** - Track orders with status and payment tracking
4. **Category Organization** - Organize products into categories
5. **Price Snapshot** - OrderItems store price at time of purchase
6. **Search & Filter** - Search products by name/description and filter by category/price

## Security Features

- Cart and Order endpoints require authentication
- Users can only view their own cart and orders
- Product listings are public (AllowAny)
- Quantity validation prevents overbooking

## Next Steps

1. Run migrations to create database tables
2. Create categories in Django admin or via API
3. Add sample products
4. Test API endpoints with Postman or similar tools
5. Connect frontend components to these API endpoints
