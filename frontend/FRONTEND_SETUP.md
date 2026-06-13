# Frontend Setup - Products & Shopping Cart

## New Components Created

### 1. **ProductList.jsx**
Displays a grid of products with filtering by category.

**Features:**
- Fetches products from `/api/products/products/`
- Filters by category
- Shows product name, price, and stock status
- Links to product detail page

**Props:**
- `category` (string) - Filter products by category slug

### 2. **ProductDetail.jsx**
Full product page with details and add-to-cart functionality.

**Features:**
- Fetches single product by slug
- Shows product image placeholder, description, price, and stock
- Quantity selector with + and - buttons
- "Add to Cart" button (requires login)
- Stock availability check
- Success/error messages

**Route:** `/products/:slug`

### 3. **Cart.jsx**
Shopping cart view showing all items.

**Features:**
- Displays all items in user's cart
- Update quantity for each item
- Remove items from cart
- Shows cart total and item count
- Cart summary sidebar
- Checkout button
- Requires authentication

**Route:** `/cart`

**Methods:**
- Get cart items
- Update item quantity
- Remove items

### 4. **Checkout.jsx**
Checkout page to enter shipping information and place order.

**Features:**
- Form for shipping details (address, city, state, zip, country)
- Form validation
- Creates order from cart
- Clears cart after order creation
- Redirects to confirmation page

**Route:** `/checkout`

**Required Fields:**
- shipping_address
- shipping_city
- shipping_state
- shipping_zip
- shipping_country

### 5. **OrderConfirmation.jsx**
Order confirmation and details page.

**Features:**
- Shows order number and date
- Displays order status and payment status
- Lists all items in order with prices
- Shows shipping address
- Links to order history and continue shopping

**Routes:**
- `/order-confirmation/:orderNumber`
- `/order/:orderNumber`

### 6. **OrderHistory.jsx**
View all user's past orders.

**Features:**
- Lists all orders by user
- Shows order number, date, item count, status, and total
- Click order to view details
- Links to continue shopping if no orders

**Route:** `/orders`

## API Client Updates

**File:** `src/api/client.js`

### New Methods:

```javascript
// Categories
productsApi.getCategories()

// Products
productsApi.getProducts(params)        // params: {category, min_price, max_price}
productsApi.getProductBySlug(slug)

// Cart
productsApi.getCart()
productsApi.addToCart(productId, quantity)
productsApi.updateCartItem(cartItemId, quantity)
productsApi.removeFromCart(cartItemId)

// Orders
productsApi.getOrders()
productsApi.getOrderByNumber(orderNumber)
productsApi.createOrder(shippingData)
```

**Authentication:**
- Automatically includes JWT token from `localStorage.access`
- All cart and order endpoints require authentication

## Updated Components

### Header.jsx
**Added:**
- Cart icon link in desktop navigation
- Cart link in mobile menu
- Links to `/cart` page

### CategoryPage.jsx
**Updated:**
- Now uses `ProductList` component
- Dynamically fetches products from API instead of hardcoded data
- Maintains category headers and descriptions

### App.jsx
**Added Routes:**
- `/products/:slug` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/order-confirmation/:orderNumber` - Order confirmation
- `/orders` - Order history
- `/order/:orderNumber` - Order detail view

## User Flow

1. **Browse Products**
   - Visit category pages (e.g., `/fashion`, `/electronics`)
   - Products fetched from backend API
   - Click on product card to view details

2. **View Product Details**
   - See full product information
   - Select quantity
   - Add to cart (requires login)

3. **Shopping Cart**
   - View all items in cart
   - Update quantities
   - Remove items
   - View total
   - Proceed to checkout

4. **Checkout**
   - Enter shipping information
   - Place order (creates Order in backend)
   - Cart is automatically cleared

5. **Order Confirmation**
   - View order details
   - See order number and status
   - Link to order history

6. **Order History**
   - View all past orders
   - Click to view order details
   - Track order status

## Authentication Flow

**Protected Routes:**
- `/cart` - Requires login, redirects to `/login` if not authenticated
- `/checkout` - Requires login, redirects to `/login` if not authenticated
- `/orders` - Requires login, redirects to `/login` if not authenticated
- `/order/:orderNumber` - Requires login and owns order

**Add to Cart:**
- Redirects to `/login` if not authenticated
- Shows "Login to Add to Cart" button

## Styling

All components use **Tailwind CSS** classes matching existing design:
- Dark header: `bg-[#242528]`
- Primary button: `bg-blue-600`
- Secondary button: `border border-slate-300`
- Status badges: Color-coded (green=in-stock, red=out-of-stock)

## Environment Variables

**Frontend .env file should include:**
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Default: `http://127.0.0.1:8000`

## Key Features

✅ **Product Browsing** - Browse by category with API filtering
✅ **Search & Filter** - Filter by category and price range
✅ **Shopping Cart** - Full cart management with quantity control
✅ **Checkout** - Shipping information form
✅ **Order Management** - View order history and details
✅ **Authentication** - All user data protected
✅ **Stock Management** - Shows availability and prevents overselling
✅ **Responsive Design** - Mobile and desktop friendly

## Error Handling

All components include:
- Error state display
- Loading states with spinners
- User-friendly error messages from backend
- Automatic token refresh handling

## Next Steps

1. Ensure Django backend is running
2. Create categories via Django admin
3. Create sample products
4. Test user signup/login
5. Add products to cart
6. Complete checkout flow
7. View order history
