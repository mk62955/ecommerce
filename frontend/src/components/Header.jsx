import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    label: "For You",
    path: "/for-you",
    icon: (
      <path
        d="M12 21s-7-4.35-7-10.2A4.55 4.55 0 0 1 12 7a4.55 4.55 0 0 1 7 3.8C19 16.65 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Fashion",
    path: "/fashion",
    icon: (
      <path
        d="M8 4h8l2 4-3 2v10H9V10L6 8l2-4Zm2 0a2 2 0 0 0 4 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Electronics",
    path: "/electronics",
    icon: (
      <path
        d="M6 5h12v10H6V5Zm4 14h4m-6 0h8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Home",
    path: "/home-products",
    icon: (
      <path
        d="m4 11 8-7 8 7v9h-5v-5H9v5H4v-9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Appliances",
    path: "/appliances",
    icon: (
      <path
        d="M7 3h10v18H7V3Zm3 4h4m-4 10h4m-2-7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    loadUser();
    window.addEventListener("auth-changed", loadUser);

    return () => window.removeEventListener("auth-changed", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl text-slate-800 shadow-sm border-b border-slate-200/50 transition-all duration-300"
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/30">
            MKM
          </span>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">MKM Store</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-blue-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="size-5 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {link.icon}
              </svg>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/cart"
            className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-blue-600"
            aria-label="Shopping cart"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Cart
          </Link>

          {user && (
            <>
              {user.is_admin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-yellow-600"
                  aria-label="Admin Panel"
                >
                  <span className="transition-transform duration-300 hover:rotate-90">⚙️</span>
                  Admin
                </Link>
              )}

            <Link
              to="/profile"
              className="max-w-48 truncate rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              title="View Profile"
            >
              {user.first_name || user.email}
            </Link>
            </>
          )}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white shadow-md shadow-slate-900/20 transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transform hover:-translate-y-0.5"
            >
              Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:hidden"
        >
          {isMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-6"
              aria-hidden="true"
            >
              <path
                d="M6 18 18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-6"
              aria-hidden="true"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full overflow-hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 shadow-2xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 pb-6 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5 text-slate-400"
                  aria-hidden="true"
                >
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            ))}

            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600 mt-2 border-t border-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="size-5 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cart
            </Link>

            {user && user.is_admin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-yellow-50 hover:text-yellow-700"
              >
                <span>⚙️</span>
                Admin Panel
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-center text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600 border border-slate-200"
              >
                Signed in as {user.first_name || user.email}
              </Link>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 rounded-xl bg-white border border-slate-200 px-4 py-4 text-center text-base font-bold text-red-600 transition-colors hover:bg-red-50 focus:outline-none"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-blue-600/30 focus:outline-none"
              >
                Log in
              </Link>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
