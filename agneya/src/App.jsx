



// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";


import HomePage from './User/User';

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages - User
import Login from "./User/pages/login";
import OnlineShopping from "./User/pages/OnlineShopping";
import ProductCustomize from "./User/pages/ProductCustomize";
import Purchase from "./User/pages/Purchase";
import OnlinePayment from "./User/pages/OnlinePayment";
import MyOrders from "./User/pages/MyOrders";

// Pages - User Components
import About from "./User/components/About";
import Contact from "./User/components/Contact";

// Pages - Admin
import AdminLogin from "./Admin/pages/adminLogin";
import Admin from "./Admin/admin";
import OrderManagement from "./Admin/components/OrderManagement";
import ReadyProductUpload from "./Admin/components/ReadyProductUpload";
import CustomBaseUpload from "./Admin/components/CustomBaseUpload";
import SalesAnalytics from "./Admin/components/SalesAnalytics";
import CustomerInsights from "./Admin/components/CustomerInsights";


// Protected Route for logged-in users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};



import { HelmetProvider } from "react-helmet-async";
import Profile from "./User/pages/Profile";

function App() {
  return (
    <HelmetProvider>
      <Routes>
        {/* ====================== USER ROUTES ====================== */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<OnlineShopping />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected User Routes */}
          <Route
            path="/customize"
            element={
              <ProtectedRoute>
                <ProductCustomize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <Purchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/online-payment"
          element={
            <ProtectedRoute>
              <OnlinePayment />
            </ProtectedRoute>
          }
        />
         <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ====================== ADMIN ROUTES ====================== */}
      {/* Admin Login (outside layout because it has no sidebar) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Dashboard with Sidebar Layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Admin />}>
          <Route index element={<OrderManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="ready-upload" element={<ReadyProductUpload />} />
          <Route path="custom-base" element={<CustomBaseUpload />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="customers" element={<CustomerInsights />} />

        </Route>
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "100px" }}>404 - Page Not Found</h2>} />
    </Routes>
    </HelmetProvider>
  );
}

export default App;