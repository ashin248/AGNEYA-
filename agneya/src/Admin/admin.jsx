// admin.jsx (updated with visible tabs)

import React, { useState } from "react";
import "./style/admin.css";
import "../index.css";

// Components
import OrderManagement from "./components/OrderManagement";
import ReadyProductUpload from "./components/ReadyProductUpload";
import CustomBaseUpload from "./components/CustomBaseUpload";
import SalesAnalytics from "./components/SalesAnalytics";
import { Outlet, NavLink, useLocation } from "react-router-dom";



const Admin = () => {
  const location = useLocation();

  const tabs = [
    { id: "orders", label: "Orders", path: "/admin/orders" },
    { id: "analytics", label: "Sales Analytics", path: "/admin/analytics" },
    { id: "customers", label: "Customer Insights", path: "/admin/customers" },
    { id: "ready-upload", label: "Ready Products", path: "/admin/ready-upload" },
    { id: "custom-base", label: "Custom Bases", path: "/admin/custom-base" },

  ];

  return (
    <div className="admin-dashboard-content">
      <div className="admin-header-info">
        <h1 className="text-grape">Admin Dashboard</h1>
        <p className="text-dim">Manage orders, products, and analytics</p>
      </div>

      {/* Tab Navigation (Using NavLink for active styling) */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
            end={tab.path === "/admin"}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Content Area Rendering the sub-route */}
      <div className="admin-main-view">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;