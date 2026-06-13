import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PAGE_SIZE = 12;

const ProductList = ({ category, sortBy }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [category, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (category) queryParams.append("category", category);
        queryParams.append("page", page);
        queryParams.append("page_size", PAGE_SIZE);
        if (sortBy) queryParams.append("ordering", sortBy);

        const response = await fetch(`https://manitech.cloud/api/products/products/?${queryParams.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const nextProducts = Array.isArray(data) ? data : data.results || [];

        setProducts(nextProducts);
        setTotalProducts(Array.isArray(data) ? nextProducts.length : data.count || 0);
      } catch {
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, page, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 text-lg font-semibold">Coming Soon</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const getImageUrl = (product) => {
    if (!product) return null;
    // Prioritize direct URL if the database field is raw
    if (typeof product.image === 'string' && product.image.startsWith('http')) return product.image;
    // Repair mangled Django media URLs containing external links
    const url = product.image_url || product.image;
    if (url && url.includes('/media/http')) {
      const extracted = url.substring(url.indexOf('/media/http') + 7);
      return decodeURIComponent(extracted).replace(/^(https?):\/([^\/])/, '$1://$2');
    }
    return url;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const renderProduct = (product) => (
    <motion.div key={product.id} variants={itemVariants}>
      <Link
        to={`/products/${product.slug}`}
        className="block h-full group flex flex-col rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden"
      >
      {/* Badges */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
        {product.stock < 5 && product.stock > 0 && (
          <span className="rounded-full bg-red-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-full bg-slate-800/90 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      <div className="relative flex aspect-[4/5] items-center justify-center rounded-2xl bg-slate-50 p-6 overflow-hidden mb-6 transition-colors duration-500 group-hover:bg-blue-50/50">
        {getImageUrl(product) ? (
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
          />
        ) : (
          <span className="text-5xl font-bold text-slate-200">{product.id}</span>
        )}
      </div>
      
      <div className="flex flex-col flex-grow">
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2 opacity-80">
          {product.category?.name || "Product"}
        </span>
        <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2 transition-colors duration-300 group-hover:text-blue-600 line-clamp-2">
          {product.name}
        </h2>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {product.description || "No description available"}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
          <p className="text-xl font-extrabold text-slate-900">
            &#8377;{parseFloat(product.price).toFixed(2)}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${product.stock > 0 ? 'bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-200' : 'bg-slate-100 text-slate-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );

  const renderPagination = () => (
    totalPages > 1 && (
      <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
    )
  );

  return (
    <div className="space-y-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {products.map(renderProduct)}
      </motion.div>
      {renderPagination()}
    </div>
  );
};

export default ProductList;
