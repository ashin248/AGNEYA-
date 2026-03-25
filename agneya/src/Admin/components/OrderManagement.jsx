
// src/admin/components/OrderManagement.jsx
import React, { useState, useEffect } from "react";
import API, { getImageUrl } from "../../shared/utils/api";
import { generateInvoice } from "../../shared/utils/invoiceGenerator";
import "../style/OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtering & Stats
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); 
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingCustom: 0
  });

  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectedCustomOrders, setSelectedCustomOrders] = useState(new Set());

  const [bulkStatusNormal, setBulkStatusNormal] = useState("processing");
  const [bulkStatusCustom, setBulkStatusCustom] = useState("processing");

  useEffect(() => {
    loadAllOrders();
    const pollInterval = setInterval(loadAllOrders, 60000); 
    return () => clearInterval(pollInterval);
  }, []);

  const calculateStats = (normal, custom) => {
    const today = new Date().toLocaleDateString();
    
    const todayNormal = normal.filter(o => o.createdAt && new Date(o.createdAt).toLocaleDateString() === today);
    const todayCustom = custom.filter(o => o.createdAt && new Date(o.createdAt).toLocaleDateString() === today);
    
    const revenue = todayNormal.reduce((sum, o) => sum + (o.amount || 0), 0) + 
                    todayCustom.reduce((sum, o) => sum + (o.amount || 0), 0);

    const pending = custom.filter(o => o.status === "pending").length;

    setStats({
      todayOrders: todayNormal.length + todayCustom.length,
      todayRevenue: revenue,
      pendingCustom: pending
    });

    // New Order Alert Logic
    const totalCount = normal.length + custom.length;
    const lastKnownCount = parseInt(localStorage.getItem("admin_last_order_count") || "0");
    if (totalCount > lastKnownCount && lastKnownCount > 0) {
      setNewOrderAlert(true);
      playNotificationSound();
    }
    localStorage.setItem("admin_last_order_count", totalCount.toString());
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.warn("Audio alert failed", e); }
  };

  const loadAllOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const [resNormal, resCustom] = await Promise.all([
        API.get("/api/orders/all"),
        API.get("/api/custom-orders/admin"),
      ]);

      let normalOrdersData = Array.isArray(resNormal?.data?.orders) ? resNormal.data.orders : (resNormal.data || []);
      let customOrdersData = Array.isArray(resCustom?.data?.customOrders) ? resCustom.data.customOrders : (resCustom.data || []);

      setOrders(normalOrdersData);
      setCustomOrders(customOrdersData);
      calculateStats(normalOrdersData, customOrdersData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load orders. Please check your internet or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterLogic = (order, isCustom = false) => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isCustom ? order.userId?.email : (order.userId?.email || order.userId?.name))?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        if (orderDate.toISOString().split('T')[0] !== now.toISOString().split('T')[0]) return false;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (orderDate < weekAgo) return false;
      }
    }

    return true;
  };

  const filteredOrders = orders.filter(o => filterLogic(o, false));
  const filteredCustomOrders = customOrders.filter(o => filterLogic(o, true));

  const toggleSelect = (id, isCustom = false) => {
    if (isCustom) {
      setSelectedCustomOrders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    } else {
      setSelectedOrders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    }
  };

  const selectAll = (isCustom = false) => {
    if (isCustom) {
      if (selectedCustomOrders.size === customOrders.length) {
        setSelectedCustomOrders(new Set());
      } else {
        setSelectedCustomOrders(new Set(customOrders.map((o) => o._id)));
      }
    } else {
      if (selectedOrders.size === orders.length) {
        setSelectedOrders(new Set());
      } else {
        setSelectedOrders(new Set(orders.map((o) => o._id)));
      }
    }
  };

  const updateStatus = async (orderId, newStatus, isCustom = false) => {
    try {
      const endpoint = isCustom
        ? `/api/custom-orders/${orderId}/status`
        : `/api/orders/${orderId}/status`;

      await API.put(endpoint, { status: newStatus });
      loadAllOrders(); // refresh
    } catch (err) {
      alert(
        `Failed to update status: ${
          err.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  const handleBulkUpdate = async (isCustom = false) => {
    const selected = isCustom ? selectedCustomOrders : selectedOrders;
    if (selected.size === 0) {
      alert("Please select at least one order");
      return;
    }

    const status = isCustom ? bulkStatusCustom : bulkStatusNormal;

    if (
      !window.confirm(
        `Update ${selected.size} selected orders to "${status}"?`
      )
    ) {
      return;
    }

    try {
      const promises = Array.from(selected).map((id) =>
        API.put(
          isCustom ? `/api/custom-orders/${id}/status` : `/api/orders/${id}/status`,
          { status }
        )
      );

      await Promise.all(promises);
      alert("Bulk status updated successfully!");

      if (isCustom) setSelectedCustomOrders(new Set());
      else setSelectedOrders(new Set());

      loadAllOrders();
    } catch (err) {
      alert(
        `Bulk update failed: ${err.response?.data?.message || "Error"}`
      );
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
        <button onClick={loadAllOrders} style={{ marginLeft: "1rem" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      {newOrderAlert && (
        <div className="new-order-banner animate-slide-down">
          <div className="banner-content">
            <span className="bell-icon">🔔</span>
            <span>New orders received! Refreshing your list...</span>
          </div>
          <button className="close-alert" onClick={() => setNewOrderAlert(false)}>×</button>
        </div>
      )}

      <div className="admin-header-info">
        <h2 className="text-grape">Order Management</h2>
        <p className="text-dim">Monitor and fulfill your business orders</p>
      </div>

      {/* Summary Cards */}
      <div className="order-stats-grid">
        <div className="order-stat-card glass-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h4>Today's Total</h4>
            <div className="val">{stats.todayOrders} Orders</div>
          </div>
        </div>
        <div className="order-stat-card glass-card">
          <div className="stat-icon revenue">₹</div>
          <div className="stat-info">
            <h4>Today's Revenue</h4>
            <div className="val">₹{stats.todayRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="order-stat-card glass-card">
          <div className="stat-icon custom">🎨</div>
          <div className="stat-info">
            <h4>Pending Custom</h4>
            <div className="val">{stats.pendingCustom} Designs</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="order-filter-bar glass-card">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search by Order ID or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="ready">Online Products</option>
            <option value="custom">Custom Orders</option>
          </select>
        </div>
      </div>

      {/* Ready Orders Section */}
      {(typeFilter === "all" || typeFilter === "ready") && (
        <section>
          <div className="bulk-actions">
            <h3>Online Products ({selectedOrders.size} selected)</h3>
            <select
              value={bulkStatusNormal}
              onChange={(e) => setBulkStatusNormal(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => handleBulkUpdate(false)}
              disabled={selectedOrders.size === 0 || loading}
              className="bulk-btn"
            >
              Update Selected
            </button>
          </div>

          <table className="order-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.size === filteredOrders.length && filteredOrders.length > 0
                    }
                    onChange={() => selectAll(false)}
                    disabled={filteredOrders.length === 0}
                  />
                </th>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Download</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(o._id)}
                        onChange={() => toggleSelect(o._id)}
                      />
                    </td>
                    <td className="id-cell">{o._id?.slice(-8)}</td>
                    <td>
                      <div className="user-info">
                        <span className="name">{o.userId?.fullName || o.userId?.name || "Guest"}</span>
                        <span className="email">{o.userId?.email || "—"}</span>
                      </div>
                    </td>
                    <td>{o.productId?.name || "Ready Product"}</td>
                    <td className="price-cell">₹{(o.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${o.paymentStatus?.toLowerCase() || "pending"}`}>
                        {o.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${o.status || "pending"}`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="invoice-btn"
                        onClick={() => generateInvoice(o, false)}
                        title="Download Invoice"
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </button>
                    </td>
                    <td>
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="empty-state">No matching orders found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Custom Orders Section */}
      {(typeFilter === "all" || typeFilter === "custom") && (
        <section style={{ marginTop: "3rem" }}>
          <div className="bulk-actions">
            <h3>Custom Designs ({selectedCustomOrders.size} selected)</h3>
            <select
              value={bulkStatusCustom}
              onChange={(e) => setBulkStatusCustom(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in production">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => handleBulkUpdate(true)}
              disabled={selectedCustomOrders.size === 0 || loading}
              className="bulk-btn"
            >
              Update Selected
            </button>
          </div>

          <table className="order-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomOrders.size === filteredCustomOrders.length &&
                      filteredCustomOrders.length > 0
                    }
                    onChange={() => selectAll(true)}
                    disabled={filteredCustomOrders.length === 0}
                  />
                </th>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Design Preview</th>
                <th>Final Design</th>
                <th>Invoice</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomOrders.length > 0 ? (
                filteredCustomOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCustomOrders.has(o._id)}
                        onChange={() => toggleSelect(o._id, true)}
                      />
                    </td>
                    <td className="id-cell">{o._id?.slice(-8)}</td>
                    <td>
                      <div className="user-info">
                        <span className="name">{o.userId?.fullName || "Guest"}</span>
                        <span className="email">{o.userId?.email || "—"}</span>
                      </div>
                    </td>
                    <td className="price-cell">₹{(o.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${o.paymentStatus?.toLowerCase() || "pending"}`}>
                        {o.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      {o.designImage ? (
                        <div className="preview-box">
                          <img src={getImageUrl(o.designImage)} alt="preview" />
                        </div>
                      ) : "No design"}
                    </td>
                    <td>
                      {o.designImage && (
                        <a 
                          href={getImageUrl(o.designImage)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="download-link"
                          download={`design-${o._id}.png`}
                        >
                          <i className="bi bi-download"></i> High-Res
                        </a>
                      )}
                    </td>
                    <td>
                      <button 
                        className="invoice-btn"
                        onClick={() => generateInvoice(o, true)}
                        title="Download Invoice"
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </button>
                    </td>
                    <td>
                      <span className={`status-badge ${o.status || "pending"}`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => updateStatus(o._id, e.target.value, true)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="in production">In Production</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="empty-state">No matching custom orders found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default OrderManagement;


