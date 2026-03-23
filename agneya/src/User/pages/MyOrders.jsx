import React, { useState, useEffect, useCallback } from "react";
import API from "../../shared/utils/api";  
import "../style/MyOrders.css";

const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", icon: "📝" },
  { key: "Printing", label: "Printing", icon: "⚙️" },
  { key: "Shipped", label: "Shipped", icon: "🚚" },
  { key: "Delivered", label: "Delivered", icon: "✅" },
];

/**
 * MyOrders Component
 * Displays regular and custom orders with progress tracking and cancellation.
 */
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError("Please login to view your orders");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.get("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.response?.data?.message || "Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId, type = "normal") => {
    if (!window.confirm("Do you really want to cancel this order?")) return;

    try {
      const url =
        type === "normal"
          ? `/api/orders/cancel/${orderId}`
          : `/api/custom-orders/${orderId}/cancel`;

      await API.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh orders after cancellation
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed. Please try again.");
    }
  };

  const getStatusIndex = (status) => {
    return STATUS_STEPS.findIndex((step) => step.key === status?.toLowerCase());
  };

  if (loading) return <div className="loading">Loading your orders...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (orders.length === 0 && customOrders.length === 0)
    return <div className="no-orders">You have no orders yet.</div>;

  const OrderCard = ({ order }) => {
    // Determine current status index
    const status = order.orderStatus || order.status || "Pending";
    const currentIdx = getStatusIndex(status);
    
    // Check if cancelable (only if Pending and not paid yet, or according to business logic)
    const isCancelable = ["Pending"].includes(status) && order.paymentStatus !== 'Paid';

    // Get the first item for preview
    const mainItem = order.items?.[0] || {};
    const productData = mainItem.productId || {};
    
    return (
      <div className="order-card">
        <div className="order-header">
          <div>
            <strong>Order #{order._id?.slice(-8)}</strong>
            <div className="order-date">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A"}
            </div>
          </div>
          <div className="status-badges">
            <div className={`status-badge payment-${order.paymentStatus?.toLowerCase() || "pending"}`}>
              {order.paymentStatus?.toUpperCase() || "PENDING"}
            </div>
            <div className={`status-badge ${status.toLowerCase()}`}>
              {status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="order-progress">
          {STATUS_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`progress-step ${idx <= currentIdx ? "active" : ""} ${
                idx === currentIdx ? "current" : ""
              }`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Order Details (Items) */}
        <div className="order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <img
                src={item.customDesignUrl || item.productId?.imageUrl || "/placeholder-product.jpg"}
                alt={item.name}
                className="product-thumb"
                onError={(e) => (e.target.src = "/placeholder-fallback.jpg")}
              />
              <div className="item-info">
                <div className="item-name">{item.name || item.productId?.name}</div>
                <div className="item-meta">Qty: {item.quantity} | ₹{item.price}</div>
              </div>
            </div>
          ))}
          <div className="order-total">
             <span>Total Amount:</span>
             <strong>₹{order.amount || 0}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          {isCancelable && (
            <button className="btn-cancel" onClick={() => cancelOrder(order._id)}>
              Cancel Order
            </button>
          )}
          {status === "Shipped" && order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-track"
            >
              Track Order
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="my-orders-page">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}

export default MyOrders;