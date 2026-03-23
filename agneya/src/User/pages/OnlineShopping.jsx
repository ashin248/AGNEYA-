

// src/user/pages/OnlineShopping.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { staggeredGravityContainer, gravityScrollVariant } from "../../shared/animations/framerVariants";
import { Helmet } from "react-helmet-async";
import ProductReviews from "../components/ProductReviews";
import API from "../../shared/utils/api";
import "../style/OnlineShopping.css";

function OnlineShopping() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("buy");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [companyProducts, setCompanyProducts] = useState([]);
  const [customizableBases, setCustomizableBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const categoryIcons = {
    "All": "bi-grid-fill",
    "T-Shirt": "bi-person-vcard",
    "Business Card": "bi-card-heading",
    "Brochure": "bi-book-half",
    "Label": "bi-tags",
    "Keychain": "bi-key",
    "Photo Printing": "bi-image",
    "Banner": "bi-flag",
    "Card": "bi-postcard",
    "Sticker": "bi-stickies"
  };

  // Fallback dummy data – shown when API returns empty arrays or fails
  const dummyReadyProducts = [
    {
      _id: "demo-ready-1",
      name: "Premium Cotton Round Neck T-Shirt",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      category: "T-Shirt",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-ready-2",
      name: "Matte Finish Business Card (100 pcs)",
      price: 349,
      imageUrl: "https://images.unsplash.com/photo-1587847264519-4a9a8b8d3d7f?w=600",
      category: "Business Card",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-ready-3",
      name: "Vinyl Sticker Pack (10 Designs)",
      price: 249,
      imageUrl: "https://images.unsplash.com/photo-1581287053822-fd7bf4f1b16f?w=600",
      category: "Sticker",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-ready-4",
      name: "A4 Brochure Printing (Glossy)",
      price: 12.5,
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600",
      category: "Brochure",
      createdAt: new Date().toISOString()
    }
  ];

  const dummyCustomBases = [
    {
      _id: "demo-custom-1",
      name: "Classic Round Neck T-Shirt (Custom Print Ready)",
      basePrice: 399,
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600",
      category: "T-Shirt",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-custom-2",
      name: "Heavy Cotton Oversized Hoodie Base",
      basePrice: 949,
      imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600",
      category: "T-Shirt",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-custom-3",
      name: "White Ceramic Mug (Sublimation Ready)",
      basePrice: 349,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      category: "Photo Printing",
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-custom-4",
      name: "PVC Keychain Base (Double Side Print)",
      basePrice: 79,
      imageUrl: "https://images.unsplash.com/photo-1605640840604-14ac1f9b8a24?w=600",
      category: "Keychain",
      createdAt: new Date().toISOString()
    }
  ];

  // Fetch real data from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const [readyRes, customRes] = await Promise.all([
          API.get("/api/products/ready"),
          API.get("/api/products/custom-bases")
        ]);

        let readyData = readyRes?.data?.products || readyRes?.data?.data || [];
        let customData = customRes?.data?.customBases || customRes?.data?.data || [];

        // Use fallback data when API returns empty
        if (readyData.length === 0) {
          console.log("[Fallback] No ready products from API → using dummy data");
          readyData = dummyReadyProducts;
        }

        if (customData.length === 0) {
          console.log("[Fallback] No custom bases from API → using dummy data");
          customData = dummyCustomBases;
        }

        setCompanyProducts(readyData);
        setCustomizableBases(customData);
      } catch (err) {
        console.error("Products fetch error:", err);
        setError("Couldn't load products from server. Showing sample items.");
        // On network/server error → show dummies
        setCompanyProducts(dummyReadyProducts);
        setCustomizableBases(dummyCustomBases);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const allProducts = [...companyProducts, ...customizableBases];
    const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [companyProducts, customizableBases]);

  // Filtered & Sorted Ready Products
  const filteredReadyProducts = useMemo(() => {
    let list = [...companyProducts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "All") {
      list = list.filter(p => p.category === selectedCategory);
    }

    const min = priceRange.min ? Number(priceRange.min) : -Infinity;
    const max = priceRange.max ? Number(priceRange.max) : Infinity;
    if (min !== -Infinity || max !== Infinity) {
      list = list.filter(p => {
        const price = p.price || 0;
        return price >= min && price <= max;
      });
    }

    if (sortBy === "price-low-high") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high-low") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [companyProducts, searchTerm, selectedCategory, priceRange, sortBy]);

  // Filtered & Sorted Custom Bases
  const filteredCustomBases = useMemo(() => {
    let list = [...customizableBases];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "All") {
      list = list.filter(p => p.category === selectedCategory);
    }

    const min = priceRange.min ? Number(priceRange.min) : -Infinity;
    const max = priceRange.max ? Number(priceRange.max) : Infinity;
    if (min !== -Infinity || max !== Infinity) {
      list = list.filter(p => {
        const price = p.basePrice || 0;
        return price >= min && price <= max;
      });
    }

    if (sortBy === "price-low-high") {
      list.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === "price-high-low") {
      list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [customizableBases, searchTerm, selectedCategory, priceRange, sortBy]);

  const handleProtectedAction = (path, stateData = {}) => {
    const token = localStorage.getItem("token");
    // Allow '/customize' without login - login will be required at Add to Cart
    if (!token && path !== "/customize") {
      localStorage.setItem("redirectAfterLogin", JSON.stringify({ path, state: stateData }));
      setShowAuthModal(true);
    } else {
      navigate(path, { state: stateData });
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="online-shopping-page">
      <Helmet>
        <title>Shop Custom Products | Agneya Kochi</title>
        <meta name="description" content="Browse and customize products at Agneya Kochi. Custom T-shirts, printing services, and more." />
      </Helmet>

      <div className="shop-header-section">
        <motion.h1
          className="shop-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Shop <span>Collection</span>
        </motion.h1>

        {/* Category Icons Navigation */}
        <motion.div
          className="category-icons-nav"
          variants={staggeredGravityContainer}
          initial="hidden"
          animate="visible"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat}
              className={`category-icon-item ${selectedCategory === cat ? "active" : ""}`}
              variants={gravityScrollVariant}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="icon-wrapper">
                <i className={`bi ${categoryIcons[cat] || "bi-box-seam"}`}></i>
              </div>
              <span>{cat}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="shop-main-layout">
        {/* Sidebar Filters */}
        <motion.aside
          className="shop-sidebar"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="sidebar-section">
            <h3>Search Products</h3>
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Find something..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span className="price-dash"></span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>

            <button
              className="reset-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setPriceRange({ min: "", max: "" });
                setSortBy("newest");
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              Reset Filters
            </button>
          </div>
        </motion.aside>

        {/* Content Area */}
        <div className="shop-content-area">
          {/* Tabs */}
          <div className="shop-tabs">
            <button
              className={activeTab === "buy" ? "active" : ""}
              onClick={() => setActiveTab("buy")}
            >
              Ready Products
            </button>
            <button
              className={activeTab === "custom" ? "active" : ""}
              onClick={() => setActiveTab("custom")}
            >
              Custom Products
            </button>
          </div>

      {/* Ready Products Grid */}
      {activeTab === "buy" && (
        <motion.div
          className="product-grid"
          variants={staggeredGravityContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredReadyProducts.length === 0 ? (
            <p className="no-results">No products match your filters 😕</p>
          ) : (
            filteredReadyProducts.map(p => (
              <motion.div key={p._id} className="product-card" variants={gravityScrollVariant}>
                <div className="product-img-wrapper">
                  <img
                    className="product-img"
                    src={p.imageUrl}
                    alt={p.name}
                    onError={e => e.target.src = "/placeholder-product.jpg"}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{p.name}</h3>
                  <p className="product-price">₹{(p.price || 0).toLocaleString("en-IN")}</p>
                  {p.category && <span className="category-tag">{p.category}</span>}
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleProtectedAction("/purchase", { product: p })}
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Custom Bases Grid */}
      {activeTab === "custom" && (
        <motion.div
          className="product-grid"
          variants={staggeredGravityContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredCustomBases.length === 0 ? (
            <p className="no-results">No custom bases found</p>
          ) : (
            filteredCustomBases.map(p => (
              <motion.div key={p._id} className="product-card" variants={gravityScrollVariant}>
                <div className="product-img-wrapper">
                  <img
                    className="product-img"
                    src={p.imageUrl}
                    alt={p.name}
                    onError={e => e.target.src = "/placeholder-product.jpg"}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{p.name}</h3>
                  <p className="product-price">From ₹{(p.basePrice || 0).toLocaleString("en-IN")}</p>
                  {p.category && <span className="category-tag">{p.category}</span>}
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleProtectedAction("/customize", { baseProduct: p })}
                  >
                    Customize
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Login Required Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay">
          <motion.div
            className="auth-modal glass"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
          >
            <div className="auth-modal-icon">
              <i className="bi bi-lock-fill"></i>
            </div>
            <h2>Login Required</h2>
            <p>You need to login to use the <span>Buy Now</span> or <span>Customize</span> features.</p>
            <div className="auth-modal-actions">
              <button
                className="primary-btn login-btn"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
              <button 
                className="secondary-btn cancel-btn"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

        </div> {/* end shop-content-area */}
      </div> {/* end shop-main-layout */}

    </div>
  );
}

export default OnlineShopping;