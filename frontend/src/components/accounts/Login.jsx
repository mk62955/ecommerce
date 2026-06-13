import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState(location.state?.message || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const data = await apiRequest("/login/", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-900/80 mix-blend-multiply z-10" />
          <img
            src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2070"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Premium laptops and tech gadgets"
          />
          <div className="absolute bottom-12 left-12 z-20 text-white pr-12">
            <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
            <p className="text-lg text-slate-200">Sign in to access your premium shopping experience and exclusive offers.</p>
          </div>
        </div>

        <div className="flex h-full w-full items-center bg-white px-8 py-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Login to your account
              </h1>
              <p className="mt-3 text-base text-slate-500">
                Enter your email and password to continue.
              </p>
            </div>

            {message && (
              <p className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                {message}
              </p>
            )}

            {error && (
              <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </p>
            )}

            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600"
                >
                  Password
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="size-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-600">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-blue-600 hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              Do not have an account?{" "}
              <Link
                to="/register"
                className="ml-1 font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
              >
                Register here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
