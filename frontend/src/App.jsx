import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import CategoryPage from "./components/CategoryPage";
import ProductDetail from "./components/ProductDetail";
import ForYouPage from "./components/ForYouPage";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderHistory from "./components/OrderHistory";
import Registration from "./components/accounts/Registration";
import Login from "./components/accounts/Login";
import VerifyEmail from "./components/accounts/VerifyEmail";
import ForgotPassword from "./components/accounts/ForgotPassword";
import ResetPassword from "./components/accounts/ResetPassword";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Profile from "./components/accounts/Profile";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProducts from "./components/admin/AdminProducts";
import AdminCategories from "./components/admin/AdminCategories";
import AdminOrders from "./components/admin/AdminOrders";
import AdminUsers from "./components/admin/AdminUsers";

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route path="" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/for-you" element={<PublicLayout><ForYouPage /></PublicLayout>} />
        <Route path="/fashion" element={<PublicLayout><CategoryPage category="fashion" /></PublicLayout>} />
        <Route path="/electronics" element={<PublicLayout><CategoryPage category="electronics" /></PublicLayout>} />
        <Route path="/home-products" element={<PublicLayout><CategoryPage category="home-products" /></PublicLayout>} />
        <Route path="/appliances" element={<PublicLayout><CategoryPage category="appliances" /></PublicLayout>} />
        <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/order-confirmation/:orderNumber" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
        <Route path="/orders" element={<PublicLayout><OrderHistory /></PublicLayout>} />
        <Route path="/order/:orderNumber" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Registration /></PublicLayout>} />
        <Route path="/verify-email/:uid/:token" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;