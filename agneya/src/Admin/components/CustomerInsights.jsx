// src/Admin/components/CustomerInsights.jsx
import React, { useState, useEffect } from "react";
import API from "../../shared/utils/api";
import "../style/CustomerInsights.css";

const CustomerInsights = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await API.get("/api/admin/customers/stats");
        setCustomers(response.data?.data || []);
      } catch (err) {
        console.error("Customer Stats Error:", err);
        setError("Failed to load customer insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading) return <div className="analytics-loading">Analyzing customer data...</div>;
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="customer-insights animate-fade-in">
      <div className="analytics-header">
        <h1>Customer Insights</h1>
        <p className="subtitle">Understand your audience and their buying behavior</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card glass-card luxury-border">
          <h3>Top Customers</h3>
          <div className="table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="cust-info">
                        <span className="cust-name">{c.fullName || 'Guest'}</span>
                        <span className="cust-email">{c.email}</span>
                      </div>
                    </td>
                    <td>{c.orderCount}</td>
                    <td className="text-grape">₹{c.totalSpent?.toLocaleString()}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-4">No customer data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stats-sidebar">
          <div className="mini-stat glass-card luxury-border">
            <h4>Total Registered Users</h4>
            <div className="val">248</div>
            <div className="trend up">↑ 15 new this week</div>
          </div>
          <div className="mini-stat glass-card luxury-border">
            <h4>Repeat Purchase Rate</h4>
            <div className="val">32%</div>
            <div className="trend text-dim">Industry avg: 25%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
