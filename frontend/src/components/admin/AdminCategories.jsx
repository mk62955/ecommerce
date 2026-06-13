import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../api/client";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subtitle: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/products/admin/categories/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/admin/categories/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setFormData({
          name: "",
          description: "",
          subtitle: "",
        });
        setShowForm(false);
      } else {
        setError("Failed to create category");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Delete this category?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/admin/categories/${slug}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (response.ok) {
        setCategories(categories.filter((c) => c.slug !== slug));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 tracking-tight">Categories Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-fuchsia-500/30 border-none"
        >
          {showForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Category Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-4 shadow-lg"
        >
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-fuchsia-500 transition-colors text-sm"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-fuchsia-500 transition-colors text-sm"
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-fuchsia-500 transition-colors text-sm resize-none custom-scrollbar"
              placeholder="Full description"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold py-2.5 rounded-full transition-all shadow-lg shadow-fuchsia-500/20 mt-2"
          >
            Create Category
          </button>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-white">
            Loading categories...
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-400">
            Error: {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center text-slate-400">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-[#111] rounded-2xl border-t-4 border-t-fuchsia-500 border-x border-b border-white/5 p-6 hover:border-white/10 transition-colors shadow-lg group relative flex flex-col"
            >
              <h3 className="text-white font-bold text-xl mb-1">
                {category.name}
              </h3>
              <p className="text-fuchsia-400 text-xs font-mono mb-4">{category.slug}</p>
              {category.subtitle && (
                <p className="text-slate-300 text-sm mb-4">
                  {category.subtitle}
                </p>
              )}
              {category.description && (
                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                  {category.description}
                </p>
              )}
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.slug)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
