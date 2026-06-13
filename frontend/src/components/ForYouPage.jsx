import React, { useState, useEffect } from "react";
import ProductList from "./ProductList";

const ForYouPage = () => {
  const [viewedCategories, setViewedCategories] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve the user's viewing history from local storage
    const viewed = JSON.parse(localStorage.getItem("viewedCategories") || "[]");
    if (viewed.length > 0) {
      setViewedCategories(viewed.join(","));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            ✨ AI Personalized Matches
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">
            For You
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-base text-slate-600">
            Products tailored specifically to your viewing history and preferences.
          </p>
        </div>

        <ProductList category={viewedCategories} />
      </section>
    </main>
  );
};

export default ForYouPage;