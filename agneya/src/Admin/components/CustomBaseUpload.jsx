// src/Admin/components/CustomBaseUpload.jsx
import React, { useState } from "react";
import API from "../../shared/utils/api"; 
import "../style/CustomBaseUpload.css";

export default function CustomBaseUpload() {
  const [formData, setFormData] = useState({
    name: "",
    basePrice: "",
    description: "",                             
    stock: "",
  });

  const [baseImages, setBaseImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setMessage({ type: "error", text: "You can upload a maximum of 10 images" });
      return;
    }
    setBaseImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (baseImages.length === 0) {
      setMessage({ type: "error", text: "Please select at least one image" });
      return;
    }

    if (!formData.name.trim() || !formData.basePrice) {
      setMessage({ type: "error", text: "Name and Base Price are required" });
      return;
    }

    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      setMessage({ type: "error", text: "Admin login required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("basePrice", formData.basePrice);
    data.append("description", formData.description.trim() || "");
    data.append("stock", formData.stock || 50);
    
    // Append multiple images to 'images' field
    baseImages.forEach((file) => {
      data.append("images", file);
    });

    try {
      const res = await API.post("/api/products/custom-base", data, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.data.success) {
        setMessage({
          type: "success",
          text: "Custom base uploaded successfully!",
        });

        // Reset form
        setFormData({
          name: "",
          basePrice: "",
          description: "",
          stock: "",
        });
        setBaseImages([]);
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Upload failed",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-base-upload-container">
      <h2>Upload Customizable Base Product</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Base Price (₹) *</label>
          <input
            name="basePrice"
            type="number"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="Enter base price"
            required
            min="1"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Product Images (Max 10) *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            multiple
            required
            disabled={loading}
          />
          {baseImages.length > 0 && (
            <p className="selected-count">{baseImages.length} images selected</p>
          )}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description (optional)"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Initial Stock</label>
          <input
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Default: 50"
            min="0"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="upload-btn">
          {loading ? "Uploading..." : "Upload Custom Base"}
        </button>
      </form>
    </div>
  );
}
