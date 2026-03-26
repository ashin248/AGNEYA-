// src/user/pages/OnlineShopping.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import { staggeredGravityContainer, gravityScrollVariant } from "../../shared/animations/framerVariants";
import { Helmet } from "react-helmet-async";
import ProductReviews from "../components/ProductReviews";
import ProductSkeleton, { SkeletonGrid } from "../components/ProductSkeleton";
import API, { getImageUrl } from "../../shared/utils/api";
import "../style/OnlineShopping.css";

const ProductImageGallery = ({ images, name, getImageUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <img className="product-img" src="/placeholder-product.jpg" alt={name} />;
  }

  return (
    <div className="product-card-gallery">
      <img
        className="product-img"
        src={getImageUrl(images[currentIndex])}
        alt={`${name} - View ${currentIndex + 1}`}
        onError={(e) => (e.target.src = "/placeholder-product.jpg")}
      />
      {images.length > 1 && (
        <div className="gallery-dots">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`gallery-dot ${idx === currentIndex ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
            ></span>
          ))}
        </div>
      )}
      {images.length > 1 && (
        <div className="gallery-nav">
          <button 
            className="nav-btn prev" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button 
            className="nav-btn next" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

function OnlineShopping() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("buy");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const [companyProducts, setCompanyProducts] = useState([]);
  const [customizableBases, setCustomizableBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

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

  // Fetch ONLY real data from backend (No dummy data)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const [readyRes, customRes] = await Promise.all([
          API.get("/api/products/ready"),
          API.get("/api/products/custom-bases")
        ]);

        const readyData = readyRes?.data?.products || readyRes?.data?.data || [];
        const customData = customRes?.data?.customBases || customRes?.data?.data || [];

        setCompanyProducts(readyData);
        setCustomizableBases(customData);

        if (readyData.length === 0 && customData.length === 0) {
          setError("No products available at the moment.");
        }
      } catch (err) {
        console.error("Products fetch error:", err);
        setError("Failed to load products. Please try again later.");
        setCompanyProducts([]);
        setCustomizableBases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClick = () => setShowSuggestions(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Extract unique categories from real data only
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

    if (inStockOnly) {
      list = list.filter(p => (p.stock || 0) > 0);
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

    if (inStockOnly) {
      list = list.filter(p => (p.stock || 0) > 0);
    }

    if (sortBy === "price-low-high") {
      list.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === "price-high-low") {
      list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [customizableBases, searchTerm, selectedCategory, priceRange, sortBy, inStockOnly]);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    const all = [...companyProducts, ...customizableBases];
    return all
      .filter(p => p.name?.toLowerCase().includes(term))
      .map(p => p.name)
      .slice(0, 5);
  }, [companyProducts, customizableBases, searchTerm]);

  const handleProtectedAction = (path, stateData = {}) => {
    const token = localStorage.getItem("token");
    if (!token && path !== "/customize") {
      localStorage.setItem("redirectAfterLogin", JSON.stringify({ path, state: stateData }));
      setShowAuthModal(true);
    } else {
      navigate(path, { state: stateData });
    }
  };

  const handleCustomizeAndDownload = (product) => {
    try {
      // 1. Auto-download the selected image using native download approach
      const imageUrl = getImageUrl(product.imageUrls?.[0] || product.images?.[0] || product.imageUrl);
      
      const link = document.createElement("a");
      link.href = imageUrl;
      // Provide a clean filename
      link.download = `${product.name?.replace(/\s+/g, "_") || "custom_base"}.jpg`;
      link.target = "_blank"; // Fallback to opening in a new tab if download is blocked
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error("Failed to download image automatically:", error);
    }
    
    // 2. Navigate to customize page
    handleProtectedAction("/customize", { baseProduct: product });
  };

  if (loading) {
    return (
      <div className="online-shopping-page">
        <div className="shop-header-section">
          <h1 className="shop-title">Shop <span>Collection</span></h1>
        </div>
        <div className="shop-main-layout">
          <aside className="shop-sidebar">
            <div className="skeleton-line" style={{ height: "300px", borderRadius: "24px" }}></div>
          </aside>
          <div className="shop-content-area">
            <SkeletonGrid count={9} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="online-shopping-page">
      <Helmet>
        <title>{selectedCategory === 'All' ? 'Shop Custom Products' : `${selectedCategory} Collection`} | Agneya Kochi</title>
        <meta name="description" content={`Browse our ${selectedCategory === 'All' ? 'complete' : selectedCategory} collection. Premium quality custom printing and ready-to-wear products at Agneya Kochi.`} />
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
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul 
                    className="search-suggestions"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {suggestions.map((s, i) => (
                      <li key={i} onClick={() => {
                        setSearchTerm(s);
                        setShowSuggestions(false);
                      }}>
                        {s}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
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

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
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
                setInStockOnly(false);
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

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Ready Products Grid */}
          {activeTab === "buy" && (
            <motion.div
              className="product-grid"
              variants={staggeredGravityContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredReadyProducts.length === 0 ? (
                <div className="no-results-premium">
                  <div className="no-results-icon">
                    <i className="bi bi-search-heart"></i>
                  </div>
                  <h3>No matching items found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button className="reset-btn-pill" onClick={() => {
                    setSearchTerm("");
                    setPriceRange({ min: "", max: "" });
                  }}>Clear Search</button>
                </div>
              ) : (
                <>
                  {filteredReadyProducts.slice(0, visibleCount).map(p => (
                    <motion.div key={p._id} className="product-card" variants={gravityScrollVariant}>
                      <div className="product-img-wrapper">
                      {/* Badge Labels */}
                      {p.discount > 0 && <span className="badge-discount">{p.discount}% OFF</span>}
                      {(new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24) < 7 && (
                        <span className="badge-new">New Arrival</span>
                      )}
                      
                      <ProductImageGallery 
                        images={p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [p.imageUrl]} 
                        name={p.name} 
                        getImageUrl={getImageUrl} 
                      />

                      {/* Wishlist Heart */}
                      <button 
                        className={`wishlist-heart ${wishlist.some(w => w._id === p._id) ? "active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                        title="Add to Wishlist"
                      >
                        <i className={`bi ${wishlist.some(w => w._id === p._id) ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </button>

                      {/* Quick View Button */}
                      <div className="quick-view-overlay" onClick={() => setQuickViewProduct(p)}>
                        <i className="bi bi-eye"></i> Quick View
                      </div>
                    </div>
                    <div className="product-info">
                      <div className="product-meta-top">
                        <h3 className="product-title">{p.name}</h3>
                        <div className="product-rating">⭐ 4.5</div>
                      </div>
                      <p className="product-price">₹{(p.price || 0).toLocaleString("en-IN")}</p>
                      {p.category && <span className="category-tag">{p.category}</span>}
                      
                      <div className="product-card-actions">
                        <button
                          className="cart-btn-secondary"
                          onClick={() => {
                            dispatch(addToCart({
                              productId: p._id,
                              name: p.name,
                              price: p.price,
                              imageUrl: p.imageUrl,
                              quantity: 1
                            }));
                            alert("Added to cart!");
                          }}
                        >
                          <i className="bi bi-cart-plus"></i>
                        </button>
                        <button
                          className="buy-now-btn-main"
                          onClick={() => handleProtectedAction("/purchase", { product: p })}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredReadyProducts.length > visibleCount && (
                  <div className="load-more-container">
                    <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 8)}>
                      Load More Products <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                )}
                </>
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
                <div className="no-results-premium">
                  <div className="no-results-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <h3>No custom products found</h3>
                  <p>Try searching for something else or clearing filters</p>
                  <button className="reset-btn-pill" onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}>Show All</button>
                </div>
              ) : (
                <>
                  {filteredCustomBases.slice(0, visibleCount).map(p => (
                    <motion.div key={p._id} className="product-card" variants={gravityScrollVariant}>
                      <div className="product-img-wrapper">
                      {/* Badge Labels */}
                      {(new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24) < 7 && (
                        <span className="badge-new">New Arrival</span>
                      )}
                      
                      <ProductImageGallery 
                        images={p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [p.imageUrl]} 
                        name={p.name} 
                        getImageUrl={getImageUrl} 
                      />

                      {/* Wishlist Heart */}
                      <button 
                        className={`wishlist-heart ${wishlist.some(w => w._id === p._id) ? "active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                        title="Add to Wishlist"
                      >
                        <i className={`bi ${wishlist.some(w => w._id === p._id) ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </button>
                    </div>
                    <div className="product-info">
                      <div className="product-meta-top">
                        <h3 className="product-title">{p.name}</h3>
                        <div className="product-rating">⭐ 4.5</div>
                      </div>
                      <p className="product-price">Starting ₹{(p.basePrice || 0).toLocaleString("en-IN")}</p>
                      <span className="category-tag">Customizable</span>
                      
                      <button
                        className="buy-now-btn-main"
                        style={{ background: "linear-gradient(135deg, #ff4081, #f50057)", color: "#fff" }}
                        onClick={() => handleCustomizeAndDownload(p)}
                      >
                        <i className="bi bi-palette-fill" style={{ marginRight: '8px' }}></i>
                        Customize Now
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filteredCustomBases.length > visibleCount && (
                  <div className="load-more-container">
                    <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 8)}>
                      Load More Custom Products <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                )}
                </>
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

          {/* Quick View Modal */}
          {quickViewProduct && (
            <div className="quick-view-modal-overlay" onClick={() => setQuickViewProduct(null)}>
              <motion.div 
                className="quick-view-modal glass"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <button className="close-qv" onClick={() => setQuickViewProduct(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
                <div className="qv-content">
                  <div className="qv-img">
                    <img src={getImageUrl(quickViewProduct.imageUrl)} alt={quickViewProduct.name} />
                  </div>
                  <div className="qv-info">
                    <h2>{quickViewProduct.name}</h2>
                    <p className="qv-category">{quickViewProduct.category}</p>
                    <div className="qv-rating">⭐ 4.5 (24 Reviews)</div>
                    <p className="qv-price">₹{(quickViewProduct.price || quickViewProduct.basePrice || 0).toLocaleString("en-IN")}</p>
                    <p className="qv-desc">{quickViewProduct.description || "Premium quality product from Agneya. Custom printing available on request."}</p>
                    
                    <div className="qv-actions">
                      {activeTab === "buy" ? (
                        <>
                          <button className="qv-atc" onClick={() => {
                            dispatch(addToCart({ ...quickViewProduct, quantity: 1 }));
                            setQuickViewProduct(null);
                          }}>
                            Add to Cart
                          </button>
                          <button className="qv-buy" onClick={() => handleProtectedAction("/purchase", { product: quickViewProduct })}>
                            Buy Now
                          </button>
                        </>
                      ) : (
                        <button className="qv-buy" onClick={() => handleCustomizeAndDownload(quickViewProduct)}>
                          Customize Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnlineShopping;
