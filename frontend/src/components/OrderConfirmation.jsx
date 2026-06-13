import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productsApi } from "../api/client";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getOrderByNumber(orderNumber);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Loading order...</div>
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

  if (!order) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Order not found</div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl text-green-600 mb-4">✓</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600">Thank you for your purchase</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Details</h2>

          <div className="space-y-4 pb-6 border-b border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-600">Order Number</span>
              <span className="font-semibold text-slate-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date</span>
              <span className="font-semibold text-slate-900">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <span className="font-semibold text-blue-600 capitalize">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Status</span>
              <span className={`font-semibold capitalize ${
                order.payment_status === 'completed'
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-900">
                  ₹{parseFloat(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-slate-200">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Shipping Address</h3>
          <div className="text-slate-600 space-y-1">
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
          >
            View All Orders
          </Link>
          <Link
            to="/"
            className="block w-full border border-slate-300 hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-lg text-center transition"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
};

export default OrderConfirmation;
