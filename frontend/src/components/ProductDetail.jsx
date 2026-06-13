import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi } from "../api/client";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(null);

  const isLoggedIn = !!localStorage.getItem("access");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProductBySlug(slug);
        setProduct(data);
        setError(null);
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes("token not valid")) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
          window.location.reload();
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // AI/Personalization: Track viewed categories
  useEffect(() => {
    if (product && product.category) {
      const viewed = JSON.parse(localStorage.getItem("viewedCategories") || "[]");
      if (!viewed.includes(product.category.id)) {
        viewed.unshift(product.category.id);
        if (viewed.length > 5) viewed.pop(); // Keep track of their top 5 most recent interests
        localStorage.setItem("viewedCategories", JSON.stringify(viewed));
      }
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setAdding(true);
      await productsApi.addToCart(product.id, quantity);
      setSuccess("Added to cart successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setQuantity(1);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("token not valid")) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        navigate("/login");
        return;
      }
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const getImageUrl = (product) => {
    if (!product) return null;
    if (typeof product.image === 'string' && product.image.startsWith('http')) {
      return product.image;
    }
    const url = product.image_url || product.image;
    if (url && url.includes('/media/http')) {
      const extracted = url.substring(url.indexOf('/media/http') + 7);
      return decodeURIComponent(extracted).replace(/^(https?):\/([^\/])/, '$1://$2');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Loading product...</div>
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

  if (!product) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-500">Product not found</div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Product Image */}
          <div className="group relative flex items-center justify-center rounded-[2.5rem] bg-white border border-slate-100 p-12 lg:p-20 aspect-square overflow-hidden shadow-2xl shadow-slate-200/50 transition-all duration-500 hover:shadow-blue-100/50 sticky top-24">
          {getImageUrl(product) ? (
              <img 
                src={getImageUrl(product)} 
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
              />
            ) : (
              <div className="text-6xl font-bold text-slate-300">{product.id}</div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col pt-4 lg:pt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
              {product.category.name}
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              {product.description || "No description available"}
            </p>

            {/* Price and Stock */}
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-200">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                  ₹{parseFloat(product.price).toFixed(2)}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
                  product.stock > 0
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                    Quantity
                  </label>
                  <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-xl font-medium"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 text-center text-lg font-semibold bg-transparent border-none focus:ring-0 text-slate-900"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-xl font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {success && (
              <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium flex items-center gap-3 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                {success} 
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium flex items-center gap-3 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </div>
            )}

            {/* Add to Cart Button */}
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="mt-8 w-full bg-slate-900 hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-blue-600/30 flex justify-center items-center gap-3 text-lg"
              >
                {adding ? "Adding to Cart..." : isLoggedIn ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> Add to Cart</>
                ) : "Login to Add to Cart"}
              </button>
            )}

            {!product.is_available && (
              <button
                disabled
                className="mt-8 w-full bg-slate-200 text-slate-500 font-bold py-4 px-8 rounded-2xl cursor-not-allowed text-lg"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
