
// src/admin/components/OrderManagement.jsx
import React, { useState, useEffect } from "react";
import API from "../../shared/utils/api";
import "../style/OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectedCustomOrders, setSelectedCustomOrders] = useState(new Set());

  const [bulkStatusNormal, setBulkStatusNormal] = useState("processing");
  const [bulkStatusCustom, setBulkStatusCustom] = useState("processing");

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const [resNormal, resCustom] = await Promise.all([
        API.get("/api/orders/admin/all"),
        API.get("/api/custom-orders/admin"),
      ]);

      // ────────────────────────────────────────────────
      // Safe extraction — try most common patterns
      // ────────────────────────────────────────────────

      let normalOrdersData = [];

      if (Array.isArray(resNormal?.data)) {
        normalOrdersData = resNormal.data;
      } else if (Array.isArray(resNormal?.data?.orders)) {
        normalOrdersData = resNormal.data.orders;
      } else if (Array.isArray(resNormal?.data?.data)) {
        normalOrdersData = resNormal.data.data;
      } else if (Array.isArray(resNormal?.data?.results)) {
        normalOrdersData = resNormal.data.results;
      }

      let customOrdersData = [];

      if (Array.isArray(resCustom?.data)) {
        customOrdersData = resCustom.data;
      } else if (Array.isArray(resCustom?.data?.orders)) {
        customOrdersData = resCustom.data.orders;
      } else if (Array.isArray(resCustom?.data?.customOrders)) {
        customOrdersData = resCustom.data.customOrders;
      }

      setOrders(normalOrdersData);
      setCustomOrders(customOrdersData);

      // Optional: debug in development
      // console.log("Normal orders:", normalOrdersData);
      // console.log("Custom orders:", customOrdersData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load orders. Please check your internet or try again later."
      );
      // Prevent map crash even on error
      setOrders([]);
      setCustomOrders([]);
    } finally {
      setLoading(false);
    }
  };

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
      <h1>Order Management</h1>

      {/* Ready Orders Section */}
      <section>
        <div className="bulk-actions">
          <h3>Ready Orders ({selectedOrders.size} selected)</h3>
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
            Apply to Selected
          </button>
        </div>

        <h2>Ready Product Orders</h2>

        <table className="order-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.size === orders.length && orders.length > 0
                  }
                  onChange={() => selectAll(false)}
                  disabled={orders.length === 0}
                />
              </th>
              <th>ID</th>
              <th>User</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(o._id)}
                      onChange={() => toggleSelect(o._id)}
                    />
                  </td>
                  <td>{o._id?.slice(-8) || "—"}</td>
                  <td>{o.userId?.email || o.userId?.name || "—"}</td>
                  <td>{o.productId?.name || "—"}</td>
                  <td>₹{(o.amount || 0).toLocaleString("en-IN") || "—"}</td>
                  <td className={`status-${o.status || "unknown"}`}>
                    {o.status || "unknown"}
                  </td>
                  <td>
                    <select
                      value={o.status || "pending"}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      disabled={loading}
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
              <tr>
                <td colSpan={7} className="empty-state">
                  No ready product orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Custom Orders Section */}
      <section style={{ marginTop: "3rem" }}>
        <div className="bulk-actions">
          <h3>Custom Orders ({selectedCustomOrders.size} selected)</h3>
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
            Apply to Selected
          </button>
        </div>

        <h2>Custom Orders</h2>

        <table className="order-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedCustomOrders.size === customOrders.length &&
                    customOrders.length > 0
                  }
                  onChange={() => selectAll(true)}
                  disabled={customOrders.length === 0}
                />
              </th>
              <th>ID</th>
              <th>User</th>
              <th>Design Preview</th>
              <th>Base Product</th>
              <th>Status</th>
              <th>Expected Delivery</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(customOrders) && customOrders.length > 0 ? (
              customOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCustomOrders.has(o._id)}
                      onChange={() => toggleSelect(o._id, true)}
                    />
                  </td>
                  <td>{o._id?.slice(-8) || "—"}</td>
                  <td>{o.userId?.email || o.userId?.name || "—"}</td>
                  <td>
                    {o.designImage ? (
                      <img
                        src={o.designImage}
                        alt="design preview"
                        width="60"
                        style={{ borderRadius: "4px" }}
                      />
                    ) : (
                      "No preview"
                    )}
                  </td>
                  <td>{o.baseProductId?.name || "—"}</td>
                  <td>{o.status || "—"}</td>
                  <td>
                    {o.expectedDelivery
                      ? new Date(o.expectedDelivery).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  No custom orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default OrderManagement;


