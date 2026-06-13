import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const data = await apiRequest("/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(data.message || "Password reset link sent to your email.");
    } catch (err) {
      console.error("Network/Fetch Error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid md:grid-cols-2"
      >
        <div className="relative hidden md:block bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-slate-900/80 mix-blend-multiply z-10" />
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Premium shopping experience"
          />
          <div className="absolute bottom-12 left-12 z-20 text-white pr-12">
            <h2 className="text-4xl font-bold mb-4">Account Recovery</h2>
            <p className="text-lg text-slate-200">Don't worry, it happens to the best of us. Let's get you securely back into your account.</p>
          </div>
        </div>

        <div className="flex h-full w-full items-center bg-white px-8 py-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Forgot Password?
              </h1>
              <p className="mt-3 text-base text-slate-500">
                Enter your email address and we'll send you a link to securely reset your password.
              </p>
            </div>
            
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <label htmlFor="email" className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600">
                  Email Address
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-blue-600 hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium">
              <Link to="/login" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default ForgotPassword;