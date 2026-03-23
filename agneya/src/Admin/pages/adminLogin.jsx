// src/Admin/pages/adminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../shared/utils/api";
import "../style/adminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/api/admin/login", { password });

      if (res.data.success) {
        // Optional: store session ID or flag (skip if unnecessary)
        localStorage.setItem("isAdmin", "true"); // for quick check

        // ✅ redirect here
        navigate("/admin", { replace: true });
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.response?.status === 401 ? "Invalid password" : "Server error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="security-tag">RESTRICTED ACCESS AREA</div>

        <h2>AGNEYA ADMIN PANEL</h2>
        <p className="subtitle">Administrator Authentication</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-input-group">
            <label htmlFor="admin-password">Security Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoFocus
              autoComplete="off"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className={`admin-login-btn ${loading ? "loading" : ""}`}
            disabled={loading || !password.trim()}
          >
            {loading ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}
          </button>
        </form>

        <div className="extra-info">
          <small>Contact support if you lost access</small>
        </div>
      </div>
    </div>
  );
}