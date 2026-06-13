import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/admin", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { label: "Products", path: "/admin/products", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label: "Categories", path: "/admin/categories", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
    { label: "Orders", path: "/admin/orders", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { label: "Customers", path: "/admin/users", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden selection:bg-blue-500/30 font-sans text-slate-300">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-[#0a0a0a] border-r border-white/5 z-20 relative flex-shrink-0"
      >
        {/* Logo */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-fuchsia-500/30">M</div>
                <span className="font-bold text-sm tracking-wide text-white">MKM Workspace</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white mx-auto"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {sidebarOpen && <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Menu</div>}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive(item.path)
                  ? "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isActive(item.path) && (
                <motion.div layoutId="activeNavIndicator" className="absolute left-0 w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
              <span className={`${isActive(item.path) ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"} transition-colors`}>
                {item.icon}
              </span>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, w: 0 }} className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">Exit to Store</motion.span>}
            </AnimatePresence>
          </Link>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-xl px-8 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400 font-medium tracking-wide">
              MKM / <span className="text-white capitalize">{location.pathname.split('/').pop() || 'Overview'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20 cursor-pointer hover:ring-white/40 transition-all shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
