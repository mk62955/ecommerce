import React, { useEffect, useState } from "react";
import { productsApi } from "../api/client";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const isLoggedIn = !!localStorage.getItem("access");

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getCart();
        setCart(data);
        setError(null);
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes("token not valid")) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
          window.location.href = "/login";
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isLoggedIn]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      await productsApi.updateCartItem(itemId, newQuantity);

      // Update local state
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("token not valid")) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
        return;
      }
      setError(err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      await productsApi.removeFromCart(itemId);

      // Update local state
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("token not valid")) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
        return;
      }
      setError(err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-2xl">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Shopping Cart</h1>
            <p className="text-slate-600 mb-6">Please log in to view your cart</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Log In
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const getImageUrl = (product) => {
    if (!product) return null;
    if (typeof product.image === 'string' && product.image.startsWith('http')) {
      return product.image;
    }
    const url = product.image_url || product.image;
    if (url && url.includes('/media/http')) {
      const extracted = url.substring(url.indexOf('/media/http') + 7);
      return decodeURIComponent(extracted).replace(/^(https?):\/([^\/])/, '$1://$2');
    }
    return url;
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <main className="bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-10">Shopping Cart</h1>

        {isEmpty ? (
          <div className="text-center py-20 bg-white rounded-4xl border border-slate-100 shadow-sm">
            <div className="text-6xl mb-6">🛍️</div>
            <p className="text-xl text-slate-600 mb-8 font-medium">Your cart is empty</p>
            <Link
              to="/"
              className="inline-block bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-3 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold overflow-hidden flex-shrink-0 p-3 transition-colors duration-300 group-hover:bg-blue-50/50">
                  {getImageUrl(item.product) ? (
                      <img 
                        src={getImageUrl(item.product)} 
                        alt={item.product.name}
                        className="w-full h-full object-contain rounded-xl mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      item.product.id
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-center">
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm font-medium text-slate-500 mt-2 bg-slate-50 w-fit px-2 py-1 rounded-md">
                      ₹{parseFloat(item.product.price).toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating[item.id]}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        disabled={updating[item.id]}
                        className="w-10 text-center font-semibold bg-transparent border-none focus:ring-0 text-slate-900 p-0 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating[item.id]}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-extrabold text-slate-900">
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </p>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating[item.id]}
                      className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-slate-100">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-extrabold text-slate-900">₹{parseFloat(cart.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Items</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{cart.total_items}</span>
                </div>
              </div>

              <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <p className="text-sm text-blue-800 text-center font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Shipping and taxes calculated at checkout
                </p>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl text-center transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 transform hover:-translate-y-1 text-lg"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/"
                className="block w-full mt-4 bg-white border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-900 font-bold py-3.5 px-4 rounded-2xl text-center transition-colors duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Cart;
