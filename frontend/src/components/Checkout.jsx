import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/client";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isLoggedIn = !!localStorage.getItem("access");

  const [formData, setFormData] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zip: "",
    shipping_country: "",
  });

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (
      !formData.shipping_address ||
      !formData.shipping_city ||
      !formData.shipping_state ||
      !formData.shipping_zip ||
      !formData.shipping_country
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const order = await productsApi.createOrder(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/order-confirmation/${order.order_number}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            Order created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Shipping Address</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="New York"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  State/Province *
                </label>
                <input
                  type="text"
                  name="shipping_state"
                  value={formData.shipping_state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="NY"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Zip/Postal Code *
                </label>
                <input
                  type="text"
                  name="shipping_zip"
                  value={formData.shipping_zip}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="10001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="shipping_country"
                  value={formData.shipping_country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Checkout;
