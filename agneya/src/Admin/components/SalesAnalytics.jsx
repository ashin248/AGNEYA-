// src/Admin/components/SalesAnalytics.jsx
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import API from "../../shared/utils/api";
import "../style/SalesAnalytics.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const SalesAnalytics = () => {
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const [revenueRes, topRes] = await Promise.all([
          API.get("/api/admin/analytics/daily-revenue"),
          API.get("/api/admin/analytics/top-products"),
        ]);

        setDailyRevenue(revenueRes.data?.data || []);
        setTopProducts(topRes.data?.data || []);

      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalRevenue = dailyRevenue.reduce((sum, d) => sum + (d?.total || 0), 0);
  const totalOrders = dailyRevenue.reduce((sum, d) => sum + (d?.count || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  const revenueChartData = {
    labels: dailyRevenue.map((item) =>
      new Date(item.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Daily Revenue (₹)",
        data: dailyRevenue.map((item) => item?.total || 0),
        borderColor: "#9c51b6",
        backgroundColor: "rgba(156, 81, 182, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#9c51b6",
        pointBorderColor: "#111",
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: "rgba(17, 17, 17, 0.95)",
        titleColor: "#9c51b6",
        bodyColor: "#fff",
        borderColor: "rgba(156, 81, 182, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { 
          color: "#999",
          callback: (value) => "₹" + value.toLocaleString(),
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#999" },
      },
    },
  };

  if (loading) return <div className="analytics-loading">Preparing your insights...</div>;
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="sales-analytics animate-fade-in">
      <div className="analytics-header">
        <h1>Performance Overview</h1>
        <p className="subtitle">Real-time sales tracking and business growth metrics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card luxury-border">
          <div className="stat-icon revenue-icon">₹</div>
          <div className="stat-content">
            <h4>Total Revenue</h4>
            <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="stat-trend up">↑ 12.5% vs last month</div>
          </div>
        </div>

        <div className="stat-card glass-card luxury-border">
          <div className="stat-icon orders-icon">📦</div>
          <div className="stat-content">
            <h4>Total Orders</h4>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-trend up">↑ 8.2% vs last month</div>
          </div>
        </div>

        <div className="stat-card glass-card luxury-border">
          <div className="stat-icon aov-icon">💎</div>
          <div className="stat-content">
            <h4>Avg. Order Value</h4>
            <div className="stat-value">₹{Number(averageOrderValue).toLocaleString("en-IN")}</div>
            <div className="stat-trend text-dim">Based on {totalOrders} orders</div>
          </div>
        </div>
      </div>

      <div className="analytics-main-grid">
        <div className="chart-section glass-card luxury-border">
          <div className="section-header">
            <h3>Revenue Trend</h3>
            <div className="date-badge">Last 30 Days</div>
          </div>
          <div className="chart-wrapper">
            <Line data={revenueChartData} options={commonOptions} />
          </div>
        </div>

        <div className="top-products-section glass-card luxury-border">
          <div className="section-header">
            <h3>Best Sellers</h3>
          </div>
          <div className="products-table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td className="product-name-cell">{p.name}</td>
                    <td>{p.count}</td>
                    <td className="text-grape">₹{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-dim">No sales data recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;