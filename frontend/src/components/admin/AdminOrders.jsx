import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let url = "http://127.0.0.1:8000/api/products/admin/orders/";
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data.results || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/admin/orders/${orderNumber}/update_status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(
          orders.map((o) =>
            o.order_number === orderNumber ? updatedOrder : o
          )
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Orders Management</h2>

      {/* Filter */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-64 bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-white">Loading orders...</div>
        ) : error ? (
          <div className="text-center text-red-400">Error: {error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-slate-400">No orders found</div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-sm">Order Number</p>
                  <p className="text-white font-bold">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Customer</p>
                  <p className="text-white">{order.user_email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Amount</p>
                  <p className="text-white font-bold">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Items</p>
                  <p className="text-white">{order.items.length}</p>
                </div>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Order Status</p>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order.order_number, e.target.value)
                    }
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium ${
                      order.status === "delivered"
                        ? "bg-green-900 text-green-200"
                        : order.status === "shipped"
                        ? "bg-blue-900 text-blue-200"
                        : order.status === "pending"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Payment Status</p>
                  <div className={`px-3 py-2 rounded-lg font-medium text-sm ${
                    order.payment_status === "completed"
                      ? "bg-green-900 text-green-200"
                      : order.payment_status === "pending"
                      ? "bg-yellow-900 text-yellow-200"
                      : "bg-red-900 text-red-200"
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Items Ordered:</p>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white">
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="text-slate-400">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-slate-400 text-sm">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <p className="text-4xl font-bold text-white mt-2">{orders.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-4xl font-bold text-yellow-400 mt-2">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Shipped</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">
            {orders.filter((o) => o.status === "shipped").length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Delivered</p>
          <p className="text-4xl font-bold text-green-400 mt-2">
            {orders.filter((o) => o.status === "delivered").length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
