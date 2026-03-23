import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import '../style/OnlineDeliveryTracking.css';

const OnlineDeliveryTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setTrackingData(null);

    // Mocking tracking data for now - real API would go here
    setTimeout(() => {
      setLoading(false);
      if (orderId.length < 5) {
        setError("Invalid Order ID. Please check and try again.");
      } else {
        setTrackingData({
          id: orderId,
          status: "In Transit",
          estimatedDelivery: "March 28, 2026",
          steps: [
            { label: "Order Placed", date: "March 22, 10:30 AM", completed: true },
            { label: "Printing & Quality Check", date: "March 23, 02:15 PM", completed: true },
            { label: "Handed over to Courier", date: "March 24, 09:00 AM", completed: true },
            { label: "In Transit", date: "Current", completed: false },
            { label: "Out for Delivery", date: "Expected March 28", completed: false },
          ]
        });
      }
    }, 1200);
  };

  return (
    <div className="tracking-page">
      <Helmet>
        <title>Track Your Order | Agneya Kochi</title>
      </Helmet>

      <div className="tracking-hero">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="drop-anim"
        >
          Track Your package
        </motion.h1>
        <p>Enter your order reference number to see real-time updates.</p>
      </div>

      <div className="search-container glass-card luxury-border">
        <form onSubmit={handleTrack} className="tracking-form">
          <input 
            type="text" 
            placeholder="Order ID / Consignment No."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Track Now"}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}

        {trackingData && (
          <motion.div 
            className="tracking-result glass-card luxury-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="result-header">
              <div className="tracking-id">
                <span>Order Reference</span>
                <h3>#{trackingData.id}</h3>
              </div>
              <div className="delivery-est">
                <span>Estimated Arrival</span>
                <h3>{trackingData.estimatedDelivery}</h3>
              </div>
            </div>

            <div className="status-timeline">
              {trackingData.steps.map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.label === trackingData.status ? 'active' : ''}`}>
                  <div className="step-point"></div>
                  <div className="step-content">
                    <h4>{step.label}</h4>
                    <p>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnlineDeliveryTracking;

