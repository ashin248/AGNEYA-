// src/user/pages/ProductCustomize.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import * as fabric from "fabric";
import { Helmet } from "react-helmet-async";
import TShirt3D from "../components/TShirt3D";
import { getImageUrl } from "../../shared/utils/api";
import "../style/ProductCustomize.css";

const productMasks = {
  tshirt: "/masks/tshirt_mask.png",
  mug: "/masks/mug_mask.png",
};

const GOOGLE_FONTS = [
  "Arial", "Pacifico", "Graduate", "Bangers", "Bebas Neue", "Orbitron", 
  "Lobster", "Righteous", "Permanent Marker", "Monoton"
];

const CLIPART_ITEMS = [
  { name: "Flame", url: "https://www.svgrepo.com/show/439169/flame.svg" },
  { name: "Crown", url: "https://www.svgrepo.com/show/439139/crown.svg" },
  { name: "Star", url: "https://www.svgrepo.com/show/439321/star.svg" },
  { name: "Heart", url: "https://www.svgrepo.com/show/439189/heart.svg" },
  { name: "Lightning", url: "https://www.svgrepo.com/show/439226/lightning.svg" },
  { name: "Diamond", url: "https://www.svgrepo.com/show/439149/diamond.svg" },
  { name: "Skull", url: "https://www.svgrepo.com/show/439311/skull.svg" },
  { name: "Rocket", url: "https://www.svgrepo.com/show/439304/rocket.svg" },
];

function ProductCustomize() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const baseProduct = state?.baseProduct;

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [textSize, setTextSize] = useState(40);
  const [textColor, setTextColor] = useState("#000000");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isNeon, setIsNeon] = useState(false);
  const [textCurve, setTextCurve] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [error, setError] = useState("");
  const [totalPrice, setTotalPrice] = useState(baseProduct?.price || baseProduct?.basePrice || 0);
  const [activeTab, setActiveTab] = useState("text");
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [activeSideIndex, setActiveSideIndex] = useState(0);
  const [sidesData, setSidesData] = useState({});
  const [showSafetyArea, setShowSafetyArea] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if no product
  useEffect(() => {
    if (!baseProduct?._id) navigate("/shop");

    // Load Google Fonts
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.filter(f => f !== "Arial").map(f => f.replace(" ", "+")).join("&family=")}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, [navigate, baseProduct]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 700,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    loadSide(activeSideIndex);

    const syncState = () => {
      saveState();
      updateObjectList();
      updatePrice();
    };

    canvas.on("object:modified", syncState);
    canvas.on("object:added", syncState);
    canvas.on("object:removed", syncState);
    canvas.on("selection:created", (e) => handleObjectSelection(e));
    canvas.on("selection:updated", (e) => handleObjectSelection(e));
    canvas.on("selection:cleared", () => {
      setActiveImage(null);
      updateObjectList();
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [baseProduct]);

  const loadSide = (index) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    canvas.clear();
    
    const imageUrl = baseProduct.images && baseProduct.images[index] 
      ? baseProduct.images[index] 
      : baseProduct.imageUrl;

    const bgImgElement = new Image();
    bgImgElement.crossOrigin = "anonymous";
    bgImgElement.src = getImageUrl(imageUrl) || "/placeholder-product.jpg";

    bgImgElement.onload = () => {
      const fabricBgImg = new fabric.Image(bgImgElement);
      const scale = Math.min(canvas.width / fabricBgImg.width, canvas.height / fabricBgImg.height);

      canvas.backgroundImage = fabricBgImg;
      fabricBgImg.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width - fabricBgImg.width * scale) / 2,
        top: (canvas.height - fabricBgImg.height * scale) / 2,
        selectable: false,
      });

      // Clipping Mask logic (re-add for new side)
      const projectType = baseProduct?.category?.toLowerCase() || "tshirt";
      const maskUrl = productMasks[projectType] || productMasks.tshirt;
      
      const maskImgElement = new Image();
      maskImgElement.crossOrigin = "anonymous";
      maskImgElement.src = maskUrl;
      maskImgElement.onload = () => {
        const fabricMask = new fabric.Image(maskImgElement);
        fabricMask.set({
          scaleX: scale, scaleY: scale,
          left: (canvas.width - fabricBgImg.width * scale) / 2,
          top: (canvas.height - fabricBgImg.height * scale) / 2,
          selectable: false, evented: false, opacity: 0, name: "clipping-mask"
        });
        canvas.add(fabricMask);
        canvas.sendToBack(fabricMask);
        canvas.clipPath = fabricMask;

        // Safety Area
        const safetyRect = new fabric.Rect({
          left: canvas.width / 2 - 150,
          top: canvas.height / 2 - 200,
          width: 300,
          height: 400,
          fill: "transparent",
          stroke: "#ff4081",
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          name: "safety-area",
          visible: showSafetyArea,
          opacity: 0.5
        });
        canvas.add(safetyRect);
        canvas.bringToFront(safetyRect);

        // Load existing objects for this side if any
        if (sidesData[index]) {
          canvas.loadFromJSON(sidesData[index], () => {
            canvas.renderAll();
            // Ensure safety area stays on top
            const sArea = canvas.getObjects().find(o => o.name === "safety-area");
            if (sArea) canvas.bringToFront(sArea);
            setIsSaving(false);
          });
        } else {
          canvas.renderAll();
          setIsSaving(false);
        }
      };
    };
  };

  const switchSide = (newIndex) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Save current side
    const json = canvas.toJSON(["name", "selectable", "evented", "filters", "crossOrigin"]);
    setSidesData(prev => ({ ...prev, [activeSideIndex]: JSON.stringify(json) }));

    setActiveSideIndex(newIndex);
    loadSide(newIndex);
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const sArea = canvas?.getObjects().find(o => o.name === "safety-area");
    if (sArea) {
      sArea.set("visible", showSafetyArea);
      canvas.renderAll();
    }
  }, [showSafetyArea]);

  const handleObjectSelection = (e) => {
    updateObjectList();
    const selected = e.selected ? e.selected[0] : null;
    if (selected && selected.type === "image" && selected.name !== "clipping-mask") {
      setActiveImage(selected);
      setActiveTab("image");
    } else {
      setActiveImage(null);
    }
  };

  const updatePrice = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects().filter((o) => o.name !== "clipping-mask");
    const textLayers = objs.filter((o) => o.type === "i-text").length;
    const imageLayers = objs.filter((o) => o.type === "image").length;

    const base = baseProduct?.price || baseProduct?.basePrice || 0;
    setTotalPrice(base + textLayers * 30 + imageLayers * 50);
  }, [baseProduct]);

  const updateObjectList = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setCanvasObjects([...canvas.getObjects()].filter((o) => o.name !== "clipping-mask").reverse());
  }, []);

  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      const json = canvas.toJSON(["name", "selectable", "evented", "filters", "crossOrigin"]);
      setHistory((prev) => [...prev.slice(-29), JSON.stringify(json)]);
      setRedoStack([]);
    } catch (err) {
      console.error("Save state error:", err);
    }
  }, []);

  const undo = () => {
    if (history.length <= 1) return;
    const current = history.pop();
    setRedoStack((prev) => [current, ...prev]);
    const previous = history[history.length - 1];
    fabricCanvasRef.current.loadFromJSON(previous, () => {
      fabricCanvasRef.current.renderAll();
      updateObjectList();
      updatePrice();
    });
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack.shift();
    setHistory((prev) => [...prev, next]);
    fabricCanvasRef.current.loadFromJSON(next, () => {
      fabricCanvasRef.current.renderAll();
      updateObjectList();
      updatePrice();
    });
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new fabric.IText("Double click to edit", {
      left: 180,
      top: 180,
      fontSize: textSize,
      fill: textColor,
      fontFamily: selectedFont,
      cornerColor: "#b388ff",
      cornerSize: 10,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const applyNeon = (enabled) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active || active.type !== 'i-text') return;

    if (enabled) {
      active.set({
        shadow: new fabric.Shadow({
          color: textColor,
          blur: 20,
          offsetX: 0,
          offsetY: 0
        })
      });
    } else {
      active.set('shadow', null);
    }
    setIsNeon(enabled);
    canvas.renderAll();
    saveState();
  };

  const applyCurve = (value) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active || active.type !== 'i-text') return;

    // Fast path for 0 curve (standard text)
    if (value === 0) {
      active.set('path', null);
    } else {
      // Create an arc path
      const radius = 5000 / Math.abs(value); // inverse relationship
      const direction = value > 0 ? 1 : -1;
      const pathData = `M 0 0 Q 150 ${value * 2} 300 0`; 
      // Note: Truly circular paths are complex in basic Fabric. Using a quadratic bezier for simple arcing.
      active.set('path', new fabric.Path(pathData, { visible: false }));
    }
    
    setTextCurve(value);
    canvas.renderAll();
    saveState();
  };

  const addClipArt = (url) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(150);
      img.set({
        left: 100,
        top: 100,
        crossOrigin: "anonymous",
      });
      canvas.add(img);
      canvas.centerObject(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.src = event.target.result;
      imgElement.onload = () => {
        const img = new fabric.Image(imgElement);
        img.scaleToWidth(200);
        img.set({
          left: 100,
          top: 100,
          crossOrigin: "anonymous",
        });

        const canvas = fabricCanvasRef.current;
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        setActiveImage(img);
        setActiveTab("image");
        canvas.renderAll();
      };
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (filterType) => {
    if (!activeImage) return;
    let filter;
    if (filterType === "grayscale") filter = new fabric.Image.filters.Grayscale();
    if (filterType === "sepia") filter = new fabric.Image.filters.Sepia();

    if (filter) {
      activeImage.filters = [filter]; // replace previous filters
      activeImage.applyFilters();
      fabricCanvasRef.current.renderAll();
      saveState();
    }
  };

  const moveLayer = (direction) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;
    if (direction === "up") canvas.bringObjectForward(active);
    if (direction === "down") canvas.sendObjectBackwards(active);
    canvas.renderAll();
    updateObjectList();
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to add to cart!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const canvas = fabricCanvasRef.current;
    
    // Temporarily hide safety area for export
    const sArea = canvas.getObjects().find(o => o.name === "safety-area");
    if (sArea) sArea.set("visible", false);
    
    const designDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    
    // Restore safety area
    if (sArea) sArea.set("visible", showSafetyArea);

    // Collect all sides data for the order
    const finalSides = { ...sidesData, [activeSideIndex]: JSON.stringify(canvas.toJSON(["name", "selectable", "evented", "filters", "crossOrigin"])) };

    dispatch(
      addToCart({
        productId: baseProduct._id,
        name: baseProduct.name,
        price: totalPrice,
        customDesignUrl: designDataUrl,
        allSides: finalSides,
        quantity: 1,
      })
    );

    alert("Multi-side design added to cart!");
    navigate("/shop");
  };

  const handleSaveDraft = () => {
    const canvas = fabricCanvasRef.current;
    // Save current side to sidesData first
    const updatedSides = { ...sidesData, [activeSideIndex]: JSON.stringify(canvas.toJSON(["name", "selectable", "evented", "filters", "crossOrigin"])) };
    localStorage.setItem(`agneya_draft_${baseProduct._id}`, JSON.stringify(updatedSides));
    alert("Progress saved as draft!");
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem(`agneya_draft_${baseProduct._id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setSidesData(parsed);
        // Load active side
        const activeData = parsed[activeSideIndex];
        if (activeData) {
          fabricCanvasRef.current.loadFromJSON(activeData, () => {
            fabricCanvasRef.current.renderAll();
            // Re-add safety area if needed
            addSafetyArea(fabricCanvasRef.current);
          });
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to proceed with Buy Now!");
      // Save redirect state so user returns to customize page after login or goes to purchase?
      // Better to go to login and then naturally we can't easily resume the canvas state without complexity.
      // But we can store the design in localStorage momentarily.
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const canvas = fabricCanvasRef.current;
    const designDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });

    // Navigate directly to purchase page
    navigate("/purchase", { 
      state: { 
        product: {
          ...baseProduct,
          price: totalPrice // Use the calculated total price with customization
        },
        customDesignUrl: designDataUrl 
      } 
    });
  };

  return (
    <div className="customize-page studio-theme">
      <Helmet>
        <title>{`Design Your ${baseProduct?.name || "Product"} | Agneya Studio`}</title>
      </Helmet>

      <div className="studio-header">
        <button className="back-btn" onClick={() => navigate("/shop")}>← Back</button>
        <h1 className="studio-title">Agneya <span>Studio</span></h1>
        <div className="price-display">Total: <span>₹{totalPrice}</span></div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="studio-main-container">
        {/* Left Panel - Layers */}
        <aside className="studio-side-panel left-panel">
          <div className="panel-header">
            <button className={activeTab === "layers" ? "active" : ""} onClick={() => setActiveTab("layers")}>Layers</button>
            <button className={activeTab === "clipart" ? "active" : ""} onClick={() => setActiveTab("clipart")}>ClipArt</button>
          </div>
          <div className="panel-content">
            {activeTab === "layers" && canvasObjects.map((obj, idx) => (
              <div key={idx} className="layer-item" onClick={() => fabricCanvasRef.current.setActiveObject(obj)}>
                <i className={obj.type === "i-text" ? "bi bi-type" : "bi bi-image"}></i>
                <span className="layer-name">{obj.type} {idx + 1}</span>
                <div className="layer-actions">
                  <button onClick={(e) => { e.stopPropagation(); moveLayer("up"); }}><i className="bi bi-arrow-up-short"></i></button>
                  <button onClick={(e) => { e.stopPropagation(); fabricCanvasRef.current.remove(obj); }}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            ))}

            {activeTab === "clipart" && (
              <div className="clipart-grid">
                {CLIPART_ITEMS.map((item, idx) => (
                  <div key={idx} className="clipart-item" onClick={() => addClipArt(item.url)}>
                    <img src={item.url} alt={item.name} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="studio-center-panel">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
            
            {/* Side Switcher Controls */}
            <div className="side-switcher">
              {(baseProduct.images && baseProduct.images.length > 0 ? baseProduct.images : [baseProduct.imageUrl]).map((img, idx) => (
                <div 
                  key={idx} 
                  className={`side-thumb ${activeSideIndex === idx ? 'active' : ''}`}
                  onClick={() => switchSide(idx)}
                >
                  <img src={getImageUrl(img)} alt={`Side ${idx + 1}`} />
                  <span>Side {idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Guide Toggle */}
            <div className="guide-toggle">
              <label>
                <input type="checkbox" checked={showSafetyArea} onChange={(e) => setShowSafetyArea(e.target.checked)} />
                Show Print Guide
              </label>
            </div>
          </div>
        </main>

        {/* Right Panel - Tools */}
        <aside className="studio-side-panel right-panel">
          <div className="tool-section">
            <label>Add Elements</label>
            <div className="tool-grid">
              <button onClick={addText}>Add Text</button>
              <label className="tool-btn upload-label">
                Upload Image <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            </div>
          </div>

          {/* Text Controls */}
          <div className="tool-section">
            <label>Text Properties</label>
            <div>
              <input type="range" min="10" max="100" value={textSize} onChange={(e) => setTextSize(+e.target.value)} />
              <span>Size: {textSize}</span>
            </div>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            <select value={selectedFont} onChange={(e) => {
              setSelectedFont(e.target.value);
              const active = fabricCanvasRef.current?.getActiveObject();
              if (active && active.type === 'i-text') {
                active.set('fontFamily', e.target.value);
                fabricCanvasRef.current.renderAll();
              }
            }}>
            </select>
          </div>

          <div className="tool-section">
            <label>Text Visuals</label>
            <div className="effect-grid">
              <button 
                className={isNeon ? "active neon-btn" : "neon-btn"} 
                onClick={() => applyNeon(!isNeon)}
              >
                <i className="bi bi-lightbulb"></i> Neon Glow
              </button>
            </div>
            
            <div className="slider-group">
              <label>Curved Text ({textCurve})</label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                value={textCurve} 
                onChange={(e) => applyCurve(+e.target.value)} 
              />
            </div>
          </div>

          {/* Image Filters */}
          {activeImage && (
            <div className="tool-section">
              <label>Filters</label>
              <div className="tool-grid">
                <button onClick={() => applyFilter("grayscale")}>B&W</button>
                <button onClick={() => applyFilter("sepia")}>Sepia</button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="history-section">
            <button onClick={undo} disabled={history.length <= 1}>Undo</button>
            <button onClick={redo} disabled={!redoStack.length}>Redo</button>
          </div>

          <div className="action-buttons">
            <button className="finish-btn draft-btn" onClick={handleSaveDraft}>
              <i className="bi bi-save"></i> Save Draft
            </button>
            <button className="finish-btn preview-3d-btn" onClick={() => setShow3D(true)}>
              <i className="bi bi-box"></i> 3D Preview
            </button>
            <button className="finish-btn add-cart" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i> Add to Cart
            </button>
            <button className="finish-btn buy-now" onClick={handleBuyNow}>
              <i className="bi bi-lightning-fill"></i> Buy Now
            </button>
          </div>
        </aside>
      </div>

      {/* 3D Modal */}
      {show3D && (
        <div className="studio-modal-overlay" onClick={() => setShow3D(false)}>
          <div className="studio-modal 3d-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>3D Product Mockup</h2>
              <button className="close-modal" onClick={() => setShow3D(false)}>×</button>
            </div>
            <div className="modal-body">
              <TShirt3D fabricCanvas={fabricCanvasRef.current} />
            </div>
            <div className="modal-footer">
              <p>Drag to rotate. Designs are rendered in real-time.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCustomize;
//     navigate("/shop");
//   };

//   const handleCheckoutNow = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("⚠️ Please login to purchase. Your design is saved locally!");
//       setTimeout(() => navigate("/login", { state: { redirectTo: `/customize` } }), 1500);
//       return;
//     }
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     try {
//       setIsProcessing(true);
//       setError("");

//       // 1. Generate Design Image
//       const designDataUrl = canvas.toDataURL({
//         format: "png",
//         quality: 1,
//         multiplier: 2,
//       });

//       // 2. Create Order on Backend
//       const orderData = {
//         items: [{
//           productId: baseProduct._id,
//           name: baseProduct.name,
//           quantity: 1,
//           price: totalPrice,
//           customDesignUrl: designDataUrl,
//           isCustom: true,
//           canvasData: canvas.toJSON()
//         }],
//         amount: totalPrice,
//         shippingAddress: {}, // Should be collected if none exists, but following existing flow
//         paymentMethod: "Razorpay"
//       };

//       const res = await API.post("/api/orders/create", orderData);
//       if (!res.data.success) throw new Error(res.data.message);

//       const { razorpayOrderId, orderId } = res.data;

//       // 3. Get Razorpay Key
//       const keyRes = await API.get("/api/payment/key");
//       const RAZORPAY_KEY_ID = keyRes.data.key;

//       // 4. Open Razorpay Modal
//       const options = {
//         key: RAZORPAY_KEY_ID,
//         amount: totalPrice * 100,
//         currency: "INR",
//         name: "Agneya Print Services",
//         description: `Custom Design: ${baseProduct.name}`,
//         order_id: razorpayOrderId,
//         handler: async function (response) {
//           try {
//             const verifyRes = await API.post("/api/payment/verify", {
//               ...response,
//               orderId
//             });
//             if (verifyRes.data.success) {
//               alert("Payment Successful! Order Confirmed.");
//               navigate("/my-orders");
//             } else {
//               throw new Error("Payment verification failed");
//             }
//           } catch (err) {
//             alert("Verification Error: " + err.message);
//           }
//         },
//         prefill: {
//           name: "Customer Name", // Should get from auth
//           email: "customer@example.com",
//         },
//         theme: { color: "#9c51b6" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();

//     } catch (err) {
//       console.error("Checkout Error:", err);
//       setError("Checkout failed: " + err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const saveToProfile = async () => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;
    
//     const previewUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
//     try {
//       await API.post("/user/designs", {
//         name: `Design ${new Date().toLocaleDateString()}`,
//         canvasData: canvas.toJSON(),
//         previewUrl
//       });
//       alert("Design saved to your profile!");
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   return (
//     <div className="customize-page">
//       <Helmet>
//         <title>{`Customize ${baseProduct?.name || "Product"} | Agneya Kochi`}</title>
//         <meta name="description" content={`Design your own ${baseProduct?.name} online. Custom T-shirts in Kerala, Online Printing Kochi.`} />
//       </Helmet>
//       <h1>Customize {baseProduct?.name || "Your Product"}</h1>

//       {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

//       {showDraftPrompt && (
//         <div className="draft-prompt-banner">
//           <span>You have an unsaved design from earlier.</span>
//           <button onClick={loadDraft}>Resume Design</button>
//           <button onClick={() => { localStorage.removeItem(`draft_${baseProduct._id}`); setShowDraftPrompt(false); }}>Discard</button>
//         </div>
//       )}

//       <div className="price-tag">
//         Estimated Total: <span>₹{totalPrice.toFixed(2)}</span>
//       </div>

//       <div className="side-toggle">
//         <button className={currentSide === "front" ? "active" : ""} onClick={() => switchSide("front")}>Front</button>
//         <button className={currentSide === "back" ? "active" : ""} onClick={() => switchSide("back")}>Back</button>
//         <button className={show3D ? "active-3d" : ""} onClick={() => setShow3D(!show3D)}>
//           <i className="bi bi-box"></i> {show3D ? "Hide 3D" : "Show 3D"}
//         </button>
//       </div>

//       <div className="main-editor-container">
//         {/* Template Sidebar */}
//         <aside className="template-sidebar">
//           <h3>Templates</h3>
//           <div className="tpl-grid">
//             {Object.keys(templates).map(key => (
//               <div key={key} className="tpl-item" onClick={() => loadTemplate(key)}>
//                 <div className="tpl-preview">{templates[key].name[0]}</div>
//                 <span>{templates[key].name}</span>
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* Left Side: Layer Panel */}
//         <aside className="layer-panel">
//           <h3>Layers</h3>
//           <div className="layer-list">
//             {canvasObjects.map((obj, idx) => (
//               <div key={idx} className="layer-item" onClick={() => {
//                 fabricCanvasRef.current.setActiveObject(obj);
//                 fabricCanvasRef.current.renderAll();
//               }}>
//                 <span className="layer-icon">
//                   {obj.type === "i-text" ? <i className="bi bi-type"></i> : 
//                    obj.type === "image" ? <i className="bi bi-image"></i> : 
//                    <i className="bi bi-shape"></i>}
//                 </span>
//                 <span className="layer-name">{obj.type} {idx + 1}</span>
//                 <div className="layer-actions">
//                   <button onClick={(e) => { e.stopPropagation(); moveLayer("top"); }} title="Bring to Front"><i className="bi bi-arrow-up-circle"></i></button>
//                   <button onClick={(e) => { e.stopPropagation(); fabricCanvasRef.current.remove(obj); }} title="Delete"><i className="bi bi-trash"></i></button>
//                 </div>
//               </div>
//             ))}
//             {canvasObjects.length === 0 && <p className="empty-msg">No objects yet</p>}
//           </div>
//         </aside>

//         <div className="editor-center">
//           <div className="toolbar">
//             <div className="toolbar-group">
//               <button onClick={addText} title="Add Text"><i className="bi bi-plus-square"></i> Text</button>
//               <label className="upload-btn" title="Upload Image">
//                 <i className="bi bi-upload"></i> Image
//                 <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
//               </label>
//               <button onClick={() => setShowQrInput(!showQrInput)} title="Add QR Code"><i className="bi bi-qr-code"></i> QR</button>
//             </div>

//             <div className="toolbar-group">
//               <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
//                 <option value="Arial">Arial</option>
//                 <option value="Roboto">Roboto</option>
//                 <option value="Great Vibes">Great Vibes</option>
//                 <option value="Dancing Script">Dancing Script</option>
//                 <option value="Pacifico">Pacifico</option>
//                 <option value="Lobster">Lobster</option>
//               </select>
//               <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} title="Change Color" />
//               <button onClick={() => setBold(!bold)} className={bold ? "btn-active" : ""}>B</button>
//               <button onClick={() => setItalic(!italic)} className={italic ? "btn-active" : ""}>I</button>
//             </div>

//             <div className="toolbar-group">
//               <button onClick={() => alignObject("horizontally")} title="Center H"><i className="bi bi-distribute-horizontal"></i></button>
//               <button onClick={() => alignObject("vertically")} title="Center V"><i className="bi bi-distribute-vertical"></i></button>
//               <button onClick={toggleSafeZone} title="Toggle Safe Zone">
//                 <i className={hasSafeZone ? "bi bi-eye" : "bi bi-eye-slash"}></i> Safe Zone
//               </button>
//             </div>

//             <div className="toolbar-group">
//               <button onClick={undo} disabled={history.length <= 1} title="Undo"><i className="bi bi-arrow-counterclockwise"></i></button>
//               <button onClick={redo} disabled={!redoStack.length} title="Redo"><i className="bi bi-arrow-clockwise"></i></button>
//             </div>

//             <button onClick={saveToProfile} className="save-btn" title="Save to Profile"><i className="bi bi-bookmark-heart"></i></button>
//             <button onClick={generatePrintPreview} className="print-btn" title="Export High-Res"><i className="bi bi-printer"></i></button>

//             <button onClick={saveAndProceed} className="save-proceed">
//               Add to Cart
//             </button>
//             <button onClick={handleCheckoutNow} className="checkout-now" disabled={isProcessing}>
//               {isProcessing ? "Processing..." : `Buy Now ₹${totalPrice}`}
//             </button>
//           </div>

//           <div className="canvas-wrapper">
//             {show3D ? (
//               <TShirt3D fabricCanvas={fabricCanvasRef.current} />
//             ) : (
//               <canvas ref={canvasRef} />
//             )}
//           </div>

//           {showQrInput && (
//             <div className="qr-input-overlay">
//               <input 
//                 type="text" 
//                 placeholder="Enter URL or Text" 
//                 value={qrText} 
//                 onChange={(e) => setQrText(e.target.value)} 
//               />
//               <button onClick={addQrCode}>Add QR Code</button>
//               <button onClick={() => setShowQrInput(false)}>Cancel</button>
//             </div>
//           )}
          
//           <div className="filter-shelf">
//             <span>Effects: </span>
//             <button onClick={() => applyTextEffect("shadow", true)}>Shadow</button>
//             <button onClick={() => applyFilter("grayscale")}>Grayscale</button>
//             <button onClick={() => applyFilter("sepia")}>Sepia</button>
//             <button onClick={removeBackground} className="ai-btn">Remove BG (AI)</button>
//           </div>
//         </div>
//       </div>

//       {/* Print Preview Modal */}
//       {showPreview && previewUrl && (
//         <div className="preview-modal" onClick={() => setShowPreview(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h3>High-Resolution Print Preview</h3>
//             <img src={previewUrl} alt="High-res preview" style={{ maxWidth: "100%", maxHeight: "70vh" }} />
//             <div className="preview-actions">
//               <a href={previewUrl} download="custom-design-print.png" className="download-btn">
//                 Download Print File
//               </a>
//               <button onClick={() => setShowPreview(false)}>Close</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProductCustomize;

