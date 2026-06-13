const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd ? "" : "http://127.0.0.1:8000";

const ACCOUNTS_BASE_URL = `${API_BASE_URL}/accounts`;
const PRODUCTS_BASE_URL = `${API_BASE_URL}/api/products`;

const getErrorMessage = (data) => {
  if (!data) return "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  if (data.message) return data.message;
  if (data.non_field_errors) return data.non_field_errors.join(" ");

  const firstError = Object.values(data).flat().find(Boolean);
  return firstError || "Something went wrong. Please try again.";
};

const makeRequest = async (url, options = {}) => {
  let response;

  try {
    const token = localStorage.getItem("access");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Backend is not reachable. Please check your network connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
};

// Accounts API
export const apiRequest = async (path, options = {}) => {
  return makeRequest(`${ACCOUNTS_BASE_URL}${path}`, options);
};

// Products API
export const productsApi = {
  // Categories
  getCategories: () => 
    makeRequest(`${PRODUCTS_BASE_URL}/categories/`),

  // Products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${PRODUCTS_BASE_URL}/products/${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  getProductBySlug: (slug) =>
    makeRequest(`${PRODUCTS_BASE_URL}/products/${slug}/`),

  // Cart
  getCart: () =>
    makeRequest(`${PRODUCTS_BASE_URL}/cart/`),

  addToCart: (productId, quantity = 1) =>
    makeRequest(`${PRODUCTS_BASE_URL}/cart/items/`, {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateCartItem: (cartItemId, quantity) =>
    makeRequest(`${PRODUCTS_BASE_URL}/cart/items/${cartItemId}/update/`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (cartItemId) =>
    makeRequest(`${PRODUCTS_BASE_URL}/cart/items/${cartItemId}/`, {
      method: "DELETE",
    }),

  // Orders
  getOrders: () =>
    makeRequest(`${PRODUCTS_BASE_URL}/orders/`),

  getOrderByNumber: (orderNumber) =>
    makeRequest(`${PRODUCTS_BASE_URL}/orders/${orderNumber}/`),

  createOrder: (shippingData) =>
    makeRequest(`${PRODUCTS_BASE_URL}/orders/create/`, {
      method: "POST",
      body: JSON.stringify(shippingData),
    }),
};
