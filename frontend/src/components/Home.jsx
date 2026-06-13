import React, { useState, useEffect } from "react";
import ProductList from "./ProductList";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api/client";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/categories/`);
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl mb-16"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-900 opacity-90 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')] bg-cover bg-center opacity-30"></div>
          </div>
          <div className="relative px-8 py-20 sm:px-16 sm:py-32 lg:py-40 flex flex-col items-center text-center">
            <span className="inline-block py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest mb-6 border border-white/20 uppercase">
              Premium Collection
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
              Discover the <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Extraordinary</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mb-10 drop-shadow-md">
              Shop the latest trends in fashion, electronics, and home essentials with premium quality and unmatched style.
            </p>
            <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="bg-white text-slate-900 hover:bg-slate-50 font-bold py-4 px-10 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1">
              Explore Now
            </button>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 border-y border-slate-200 py-8"
        >
          <div className="flex items-center justify-center gap-3 text-slate-600"><span className="text-2xl">🚚</span><span className="font-semibold text-sm">Free Shipping</span></div>
          <div className="flex items-center justify-center gap-3 text-slate-600"><span className="text-2xl">🛡️</span><span className="font-semibold text-sm">Secure Payment</span></div>
          <div className="flex items-center justify-center gap-3 text-slate-600"><span className="text-2xl">↩️</span><span className="font-semibold text-sm">30-Day Returns</span></div>
          <div className="flex items-center justify-center gap-3 text-slate-600"><span className="text-2xl">💬</span><span className="font-semibold text-sm">24/7 Support</span></div>
        </motion.div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort by Latest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>

        <ProductList category={selectedCategory} sortBy={sortBy} />
      </section>
    </main>
  );
};

export default Home;
