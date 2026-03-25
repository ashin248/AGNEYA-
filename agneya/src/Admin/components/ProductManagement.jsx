import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../shared/utils/api";
import "../style/ReadyProductUpload.css"; // Reusing some base styles

const ProductManagement = () => {
  const [readyProducts, setReadyProducts] = useState([]);
  const [customBases, setCustomBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ready"); // "ready" or "custom"
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const adminToken = localStorage.getItem("adminToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [readyRes, customRes] = await Promise.all([
        API.get("/api/products/ready"),
        API.get("/api/products/custom-bases"),
      ]);
      setReadyProducts(readyRes.data.products || []);
      setCustomBases(customRes.data.customBases || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setMessage({ type: "error", text: "Failed to load product list" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;

    try {
      const endpoint = type === "ready" ? `/api/products/ready/${id}` : `/api/products/custom-base/${id}`;
      const res = await API.delete(endpoint, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Product deleted successfully" });
        // Update local state
        if (type === "ready") {
          setReadyProducts((prev) => prev.filter((p) => p._id !== id));
        } else {
          setCustomBases((prev) => prev.filter((p) => p._id !== id));
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Delete failed" });
    }
  };

  const filteredProducts = (activeTab === "ready" ? readyProducts : customBases).filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="upload-container" style={{ maxWidth: "1200px" }}>
      <div className="admin-header-info">
        <h2 className="text-grape">Product Management</h2>
        <p className="text-dim">View and manage your product catalog</p>
      </div>

      <div className="upload-mode-toggle" style={{ marginBottom: "2rem" }}>
        <button
          className={activeTab === "ready" ? "active" : ""}
          onClick={() => setActiveTab("ready")}
        >
          Online Products ({readyProducts.length})
        </button>
        <button
          className={activeTab === "custom" ? "active" : ""}
          onClick={() => setActiveTab("custom")}
        >
          Customizable Bases ({customBases.length})
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "1rem"
          }}
        />
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`message ${message.type}`} 
          style={{ marginBottom: "2rem" }}
        >
          {message.text}
        </motion.div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : (
        <div className="product-management-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px"
        }}>
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  background: "rgba(10, 10, 10, 0.8)",
                  borderRadius: "15px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "15px",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div className="product-mgmt-img-container" style={{ position: "relative" }}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ 
                      width: "100%", 
                      height: "180px", 
                      objectFit: "cover", 
                      borderRadius: "10px",
                      marginBottom: "12px"
                    }} 
                  />
                  {product.imageUrls && product.imageUrls.length > 1 && (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}>
                      {product.imageUrls.length} Views
                    </div>
                  )}
                </div>
                <h4 style={{ color: "#fff", marginBottom: "5px" }}>{product.name}</h4>
                <p style={{ color: "var(--primary-color)", fontWeight: "bold", fontSize: "1.1rem" }}>
                   ₹{activeTab === "ready" ? product.price : product.basePrice}
                </p>
                <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "5px" }}>
                  Stock: {product.stock}
                </p>
                
                <button
                  onClick={() => handleDelete(product._id, activeTab)}
                  style={{
                    marginTop: "15px",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "rgba(255, 0, 0, 0.15)",
                    color: "#ff4d4d",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.background = "rgba(255, 0, 0, 0.3)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(255, 0, 0, 0.15)"}
                >
                  <i className="bi bi-trash3" style={{ marginRight: "8px" }}></i>
                  Delete Product
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px", color: "#888" }}>
              No products found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
