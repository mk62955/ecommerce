import React, { useEffect, useState } from "react";
import { productsApi } from "../api/client";
import { Link, useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = !!localStorage.getItem("access");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getOrders();
        setOrders(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Loading orders...</div>
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

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600 mb-6">You haven't placed any orders yet</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/order/${order.order_number}`}
                className="block bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Order Number</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {order.order_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Date</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Items</p>
                    <p className="font-semibold text-slate-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default OrderHistory;
