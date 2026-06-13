import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";

const CategoryPage = ({ category }) => {
  const categorySlug = category === "home-products" ? "home" : category;
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://manitech.cloud/api/products/categories/");
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data = await response.json();
        const categories = Array.isArray(data) ? data : data.results || [];
        const matchedCategory = categories.find((c) => c.slug === categorySlug);

        if (matchedCategory) {
          setCategoryData(matchedCategory);
        } else {
          setError(`Category "${categorySlug}" not found.`);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch category info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryInfo();
  }, [categorySlug]);

  if (loading) {
    return (
      <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500">Loading category...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-slate-600 mt-2">{error}</p>
        </div>
      </main>
    );
  }

  if (!categoryData) {
    return null; // Or a "Not Found" component
  }

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            MKM Store
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {categoryData.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            {categoryData.subtitle || categoryData.description}
          </p>
        </div>

        <div className="mb-8 flex justify-end">
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

        <ProductList category={categoryData.id} sortBy={sortBy} />
      </section>
    </main>
  );
};

export default CategoryPage;
