import { useEffect, useState } from "react";
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

  // Track viewed categories for personalization
  useEffect(() => {
    if (product && product.category) {
      const viewed = JSON.parse(localStorage.getItem("viewedCategories") || "[]");
      if (!viewed.includes(product.category.id)) {
        viewed.unshift(product.category.id);
        if (viewed.length > 5) viewed.pop();
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

  const getImageUrl = (item) => {
    if (!item) return null;
    if (typeof item.image === "string" && item.image.startsWith("http")) {
      return item.image;
    }

    const url = item.image_url || item.image;
    if (url && url.includes("/media/http")) {
      const extracted = url.substring(url.indexOf("/media/http") + 7);
      return decodeURIComponent(extracted).replace(/^(https?):\/([^/])/, "$1://$2");
    }

    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Product not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50 transition-all duration-500 hover:shadow-blue-100/50 sm:p-12 lg:p-20">
            {getImageUrl(product) ? (
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="text-6xl font-bold text-slate-300">{product.id}</div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col pt-4 lg:pt-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">
              {product.category.name}
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {product.description || "No description available"}
            </p>

            {/* Price and Stock */}
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-6 border-b border-slate-200 pb-8">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900">
                  &#8377;{parseFloat(product.price).toFixed(2)}
                </span>
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-bold tracking-wide ${
                    product.stock > 0
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="pt-2">
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-slate-900">
                    Quantity
                  </label>
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value, 10) || 1)))
                      }
                      className="w-16 border-none bg-transparent text-center text-lg font-semibold text-slate-900 focus:ring-0"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {success && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 font-medium text-green-700 shadow-sm">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700 shadow-sm">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Add to Cart Button */}
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:bg-blue-600 hover:shadow-blue-600/30 active:scale-[0.98] disabled:bg-slate-400"
              >
                {adding ? (
                  "Adding to Cart..."
                ) : isLoggedIn ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </>
                ) : (
                  "Login to Add to Cart"
                )}
              </button>
            )}

            {!product.is_available && (
              <button
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-2xl bg-slate-200 px-8 py-4 text-lg font-bold text-slate-500"
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
