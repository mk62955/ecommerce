import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { motion } from "framer-motion";

const Registration = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Real-time password validation requirements
  const reqs = [
    { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
    { id: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { id: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { id: "number", label: "One number", test: (v) => /[0-9]/.test(v) },
    { id: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const strengthCount = reqs.filter(r => r.test(password)).length;
  const strengthPercentage = (strengthCount / reqs.length) * 100;
  let strengthColor = "bg-slate-200";
  if (strengthCount > 0 && strengthCount <= 2) strengthColor = "bg-red-500";
  else if (strengthCount <= 4) strengthColor = "bg-yellow-500";
  else if (strengthCount === 5) strengthColor = "bg-green-500";

  const EyeIcon = ({ show }) => (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      )}
    </svg>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await apiRequest("/register/", {
        method: "POST",
        body: JSON.stringify({
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: formData.get("email"),
          password,
        }),
      });

      navigate("/login", {
        state: {
          message:
            data.message || "Registration successful. Please login now.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
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
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-emerald-900/80 mix-blend-multiply z-10" />
          <img
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Premium electronics and smart devices"
          />
          <div className="absolute bottom-12 left-12 z-20 text-white pr-12">
            <h2 className="text-4xl font-bold mb-4">Join MKM Store</h2>
            <p className="text-lg text-slate-200">Create an account to track orders, save items to your wishlist, and check out faster.</p>
          </div>
        </div>

        <div className="flex h-full w-full items-center bg-white px-8 py-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Create an account
              </h1>
              <p className="mt-3 text-base text-slate-500">
                Register with your email to start shopping.
              </p>
            </div>

            {error && (
              <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </p>
            )}

            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder=" "
                    className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                  <label
                    htmlFor="first_name"
                    className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    First name
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder=" "
                    className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                  <label
                    htmlFor="last_name"
                    className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Last name
                  </label>
                </div>
              </div>

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

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none">
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${Math.max(5, strengthPercentage)}%` }}></div>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      {reqs.map((req) => (
                        <li key={req.id} className={`flex items-center gap-1.5 ${req.test(password) ? "text-green-600 font-medium" : "text-slate-400"}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {req.test(password) ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="3" />}
                          </svg>
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl border border-slate-300 bg-transparent px-4 pt-6 pb-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <label
                  htmlFor="confirm-password"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-slate-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600"
                >
                  Confirm password
                </label>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none">
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (password && strengthCount < 5) || (confirmPassword && password !== confirmPassword)}
                className="mt-4 w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-blue-600 hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {isSubmitting ? "Creating account..." : "Create an account"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="ml-1 font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
              >
                Login here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Registration;
