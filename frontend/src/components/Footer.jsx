import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#242528] font-sans text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                MKM
              </span>
              <span className="text-lg font-bold tracking-wide text-white">MKM Store</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop destination for fashion, electronics, home appliances, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-white font-semibold mb-4">Quick Links</h2>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/for-you" className="hover:text-blue-400 transition">For You</Link>
              <Link to="/fashion" className="hover:text-blue-400 transition">Fashion</Link>
              <Link to="/electronics" className="hover:text-blue-400 transition">Electronics</Link>
              <Link to="/home-products" className="hover:text-blue-400 transition">Home & Living</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-white font-semibold mb-4">Support</h2>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/cart" className="hover:text-blue-400 transition">Cart</Link>
              <Link to="/orders" className="hover:text-blue-400 transition">Order History</Link>
              <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
              <Link to="/register" className="hover:text-blue-400 transition">Register</Link>
            </div>
          </div>
        </div>

        <hr className="my-8 border-slate-700" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} MKM Store. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
