import React, { useEffect, useState } from "react";
import { productsApi } from "../../api/client";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://manitech.cloud/api/products/admin/stats/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400">Error: {error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">Dashboard Overview</h2>
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/30 border-none">
          Download Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 border-none shadow-lg shadow-blue-500/20 rounded-2xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Products</p>
          <p className="text-3xl font-bold text-white">{stats.total_products}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-white bg-white/20 backdrop-blur-sm w-fit px-2 py-1 rounded-md">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            +12% this month
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 border-none shadow-lg shadow-purple-500/20 rounded-2xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Categories</p>
          <p className="text-3xl font-bold text-white">{stats.total_categories}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-white bg-white/20 backdrop-blur-sm w-fit px-2 py-1 rounded-md">
            Stable
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-lg shadow-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-white">{stats.total_orders}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-white bg-white/20 backdrop-blur-sm w-fit px-2 py-1 rounded-md">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            +24% this week
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-orange-500 to-rose-600 border-none shadow-lg shadow-orange-500/20 rounded-2xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-white">₹{parseFloat(stats.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-white bg-white/20 backdrop-blur-sm w-fit px-2 py-1 rounded-md">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            +8.2% vs last month
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#111] rounded-2xl p-6 border-t-4 border-t-blue-500 border-x border-b border-white/5 shadow-lg">
          <h3 className="text-white font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
                <div>
                  <p className="text-white font-medium text-sm">Orders Last 7 Days</p>
                  <p className="text-slate-500 text-xs">New orders this week</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.recent_orders}</p>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-[#111] rounded-2xl p-6 border-t-4 border-t-purple-500 border-x border-b border-white/5 shadow-lg">
          <h3 className="text-white font-semibold mb-6">Order Status</h3>
          <div className="space-y-5">
            {stats.order_status_breakdown.map((item) => (
              <div key={item.status} className="flex items-center gap-4">
                <span className="text-slate-400 text-sm capitalize w-20">{item.status}</span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / (stats.total_orders || 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${item.status === 'delivered' ? 'bg-emerald-500' : item.status === 'shipped' ? 'bg-blue-500' : item.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}
                    />
                  </div>
                  <span className="text-slate-300 font-medium text-sm w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-[#111] rounded-2xl border-t-4 border-t-red-500 border-x border-b border-white/5 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Low Stock Alerts
          </h3>
        </div>
        {stats.low_stock_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-white/5 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Stock Level</th>
                  <th className="py-3 px-6">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-300">{product.name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        product.stock < 5
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6">₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">All products have sufficient stock!</div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-[#111] rounded-2xl border-t-4 border-t-orange-500 border-x border-b border-white/5 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="text-orange-500">🔥</span>
            Top Selling Products
          </h3>
        </div>
        {stats.top_selling_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-white/5 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Total Sold</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_selling_products.map((product) => (
                  <tr key={product['product__id']} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-300">{product['product__name']}</td>
                    <td className="py-4 px-6">₹{parseFloat(product['product__price']).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {product.total_sold} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">No sales yet</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
