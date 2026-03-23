// src/admin/components/ReadyProductUpload.jsx
import React, { useState } from "react";
import API from "../../shared/utils/api"; 
import "../style/ReadyProductUpload.css";

export default function ReadyProductUpload() {
  const [singleForm, setSingleForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    description: "",
    stock: "",
  });

  const [singleImage, setSingleImage] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [zipImages, setZipImages] = useState(null);
  const [uploadType, setUploadType] = useState("single"); // "single" or "bulk"

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const adminToken = localStorage.getItem("adminToken");

  const handleSingleChange = (e) => {
    setSingleForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSingleImage = (e) => setSingleImage(e.target.files[0]);

  const handleBulkCsv = (e) => setCsvFile(e.target.files[0]);
  const handleBulkZip = (e) => setZipImages(e.target.files[0]);

  const uploadSingleProduct = async (e) => {
    e.preventDefault();

    if (!singleImage) {
      setMessage({ type: "error", text: "Please select a product image" });
      return;
    }

    if (!singleForm.name.trim() || !singleForm.price) {
      setMessage({ type: "error", text: "Product name and price are required" });
      return;
    }

    if (!adminToken) {
      setMessage({ type: "error", text: "Admin login required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    Object.keys(singleForm).forEach((key) => {
      if (singleForm[key]) formData.append(key, singleForm[key]);
    });
    formData.append("image", singleImage);

    try {
      const res = await API.post("/api/products/ready", formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.data.success) {
        setMessage({
          type: "success",
          text: "Product uploaded successfully!",
        });

        // Reset form
        setSingleForm({
          name: "",
          price: "",
          originalPrice: "",
          discount: "",
          category: "",
          description: "",
          stock: "",
        });
        setSingleImage(null);
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Upload failed",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload product",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadBulkProducts = async (e) => {
    e.preventDefault();

    if (!csvFile || !zipImages) {
      setMessage({
        type: "error",
        text: "Please select both CSV file and ZIP images",
      });
      return;
    }

    if (!adminToken) {
      setMessage({ type: "error", text: "Admin login required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("productsCsv", csvFile);
    formData.append("imagesZip", zipImages);

    try {
      const res = await API.post("/api/products/bulk-ready", formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.data.success) {
        setMessage({
          type: "success",
          text: `Bulk upload successful! ${res.data.inserted || 0} products added.`,
        });

        setCsvFile(null);
        setZipImages(null);
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Bulk upload failed",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Bulk upload failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Ready Products</h2>

      <div className="upload-mode-toggle">
        <button
          className={uploadType === "single" ? "active" : ""}
          onClick={() => setUploadType("single")}
          disabled={loading}
        >
          Single Product
        </button>
        <button
          className={uploadType === "bulk" ? "active" : ""}
          onClick={() => setUploadType("bulk")}
          disabled={loading}
        >
          Bulk Upload (CSV + ZIP)
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {uploadType === "single" ? (
        <form onSubmit={uploadSingleProduct} className="single-upload-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              name="name"
              value={singleForm.name}
              onChange={handleSingleChange}
              placeholder="Enter product name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Selling Price (₹) *</label>
            <input
              name="price"
              type="number"
              value={singleForm.price}
              onChange={handleSingleChange}
              placeholder="Selling price"
              required
              min="1"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Original Price (₹)</label>
            <input
              name="originalPrice"
              type="number"
              value={singleForm.originalPrice}
              onChange={handleSingleChange}
              placeholder="Original/MRP price"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Discount (%)</label>
            <input
              name="discount"
              type="number"
              value={singleForm.discount}
              onChange={handleSingleChange}
              placeholder="Discount percentage"
              min="0"
              max="100"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              value={singleForm.category}
              onChange={handleSingleChange}
              placeholder="e.g. T-Shirts, Mugs"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={singleForm.description}
              onChange={handleSingleChange}
              placeholder="Product description"
              rows="4"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              name="stock"
              type="number"
              value={singleForm.stock}
              onChange={handleSingleChange}
              placeholder="Available stock"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Product Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSingleImage}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="upload-btn">
            {loading ? "Uploading..." : "Upload Single Product"}
          </button>
        </form>
      ) : (
        <form onSubmit={uploadBulkProducts} className="bulk-upload-form">
          <div className="bulk-info">
            <p><strong>CSV Format Requirements:</strong></p>
            <pre>name,price,originalPrice,discount,category,description,stock,imageFilename</pre>
            <p>imageFilename should match the exact filename inside the ZIP (e.g., black-tshirt.png)</p>
          </div>

          <div className="form-group">
            <label>Bulk CSV File (products.csv) *</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkCsv}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Images ZIP File *</label>
            <input
              type="file"
              accept=".zip"
              onChange={handleBulkZip}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="upload-btn">
            {loading ? "Processing Bulk Upload..." : "Upload Bulk Products"}
          </button>
        </form>
      )}
    </div>
  );
}


