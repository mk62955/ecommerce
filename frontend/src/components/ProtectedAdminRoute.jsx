import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const token = localStorage.getItem("access");
        const userJson = localStorage.getItem("user");

        if (!token || !userJson) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userJson);
        
        // Check if user is admin from stored user object
        if (user.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-white text-lg">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
