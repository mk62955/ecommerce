import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/client";

const paymentOptions = [
  {
    id: "upi",
    label: "UPI",
    description: "Pay using your UPI ID or QR app.",
  },
  {
    id: "card",
    label: "Card",
    description: "Use debit or credit card details.",
  },
  {
    id: "cash",
    label: "Cash on Delivery",
    description: "Pay when your order is delivered.",
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const isLoggedIn = !!localStorage.getItem("access");

  const [formData, setFormData] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zip: "",
    shipping_country: "India",
    upi_id: "",
    card_holder_name: "",
    card_number: "",
    card_expiry: "",
    card_cvv: "",
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

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

    if (
      !formData.shipping_address ||
      !formData.shipping_city ||
      !formData.shipping_state ||
      !formData.shipping_zip ||
      !formData.shipping_country
    ) {
      setError("Please fill in all shipping address fields.");
      return;
    }

    if (paymentMethod === "upi" && !formData.upi_id) {
      setError("Please enter your UPI ID for testing.");
      return;
    }

    if (paymentMethod === "card") {
      if (!formData.card_holder_name || !formData.card_number || !formData.card_expiry || !formData.card_cvv) {
        setError("Please complete the card details for testing.");
        return;
      }
    }

    try {
      setLoading(true);
      const order = await productsApi.createOrder({
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip: formData.shipping_zip,
        shipping_country: formData.shipping_country,
        payment_method: paymentMethod,
      });
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

  const renderPaymentFields = () => {
    if (paymentMethod === "upi") {
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900">
            UPI ID *
          </label>
          <input
            type="text"
            name="upi_id"
            value={formData.upi_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="yourname@upi"
          />
        </div>
      );
    }

    if (paymentMethod === "card") {
      return (
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">
              Cardholder Name *
            </label>
            <input
              type="text"
              name="card_holder_name"
              value={formData.card_holder_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Rahul Sharma"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">
              Card Number *
            </label>
            <input
              type="text"
              name="card_number"
              value={formData.card_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                Expiry *
              </label>
              <input
                type="text"
                name="card_expiry"
                value={formData.card_expiry}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                CVV *
              </label>
              <input
                type="password"
                name="card_cvv"
                value={formData.card_cvv}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Cash on delivery selected. You will pay in cash when the order is delivered.
      </div>
    );
  };

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <p className="font-semibold">Test mode only</p>
          <p className="mt-1 text-sm leading-relaxed">
            This payment section is for testing and demo purposes only. No real payment will be processed and it should not be used for actual purchasing.
          </p>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-slate-900">Checkout</h1>

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
            Order created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-800">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">Shipping Address</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-900">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Flat No. 502, Sunrise Residency, MG Road"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-900">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-900">
                    State / Union Territory *
                  </label>
                  <input
                    type="text"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-900">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="shipping_zip"
                    value={formData.shipping_zip}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="400001"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-900">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="shipping_country"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="India"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Payment Method</h2>
            <p className="mb-5 text-sm text-slate-600">
              Select a payment option for this test checkout flow.
            </p>

            <div className="grid gap-4">
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    paymentMethod === option.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={paymentMethod === option.id}
                    onChange={() => setPaymentMethod(option.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{option.label}</div>
                      <div className="mt-1 text-sm text-slate-600">{option.description}</div>
                    </div>
                    <div
                      className={`mt-1 h-5 w-5 rounded-full border-2 ${
                        paymentMethod === option.id
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6">{renderPaymentFields()}</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Checkout;
