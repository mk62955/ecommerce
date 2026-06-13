import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    is_available: true,
    image: null,
    image_url: "",
    imagePreview: null,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://manitech.cloud/api/products/admin/products/?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "https://manitech.cloud/api/products/admin/categories/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
      setCategoriesError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoriesError("Could not load categories. Please check admin login and API server.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search]);

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

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `https://manitech.cloud/api/products/admin/products/${slug}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (response.ok) {
        setProducts(products.filter((p) => p.slug !== slug));
      } else {
        setError("Failed to delete product");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    const currentImage = getImageUrl(product);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category.id,
      is_available: product.is_available,
      image: null,
      image_url: currentImage && currentImage.startsWith('http') ? currentImage : "",
      imagePreview: currentImage || null,
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      is_available: true,
      image: null,
      image_url: "",
      imagePreview: null,
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_url: "", // clear url if file is selected
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      
      // Generate a slug from the product name and limit to 50 characters
      let generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      data.append("slug", generatedSlug.substring(0, 50).replace(/-+$/, ''));
      
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category_id", formData.category);
      data.append("is_available", formData.is_available);

      if (formData.image) {
        data.append("image", formData.image);
      } else if (formData.image_url) {
        data.append("image", formData.image_url);
      }

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `https://manitech.cloud/api/products/admin/products/${editingProduct.slug}/`
        : "https://manitech.cloud/api/products/admin/products/";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: data,
      });

      if (response.ok) {
        fetchProducts();
        setShowForm(false);
        alert(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          const errorMessages = Object.entries(errData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
          setError(errData.detail || errorMessages || "Failed to save product");
        } else {
          const errorText = await response.text();
          console.error("Server Error:", errorText);
          setError(`Server Error ${response.status}: Please check the browser console for details.`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">Products Management</h2>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 border-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111] rounded-2xl p-2 border border-white/5 flex items-center px-4 focus-within:border-white/20 transition-colors">
        <svg className="w-5 h-5 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-white py-2 outline-none text-sm placeholder-slate-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm animate-pulse">Loading products...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">No products found</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase bg-white/5 text-slate-500 font-medium">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 px-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/5">
                      {getImageUrl(product) ? <img src={getImageUrl(product)} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-600">IMG</span>}
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{product.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    {product.category.name}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-300">
                    ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        product.stock > 10
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : product.stock > 0
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product.slug)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Products</p>
          <p className="text-4xl font-bold text-white mt-2">{products.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">In Stock</p>
          <p className="text-4xl font-bold text-green-400 mt-2">
            {products.filter((p) => p.stock > 0).length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Out of Stock</p>
          <p className="text-4xl font-bold text-red-400 mt-2">
            {products.filter((p) => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categoriesError && (
                    <p className="mt-2 text-sm text-red-300">{categoriesError}</p>
                  )}
                  {!categoriesError && categories.length === 0 && (
                    <p className="mt-2 text-sm text-amber-300">
                      Add a category first, then select it here.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Image (Upload file OR Enter URL)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <hr className="flex-1 border-slate-600" />
                      <span className="text-slate-400 text-xs uppercase font-bold">OR URL</span>
                      <hr className="flex-1 border-slate-600" />
                    </div>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData(prev => ({ ...prev, imagePreview: e.target.value, image: null }));
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {formData.imagePreview && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="max-w-xs h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="is_available" className="text-slate-300 text-sm">
                  Product is available
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/30 border-none disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
