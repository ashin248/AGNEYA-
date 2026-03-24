// src/user/pages/ProductCustomize.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import * as fabric from "fabric"; // Fabric.js v6 support
import { Helmet } from "react-helmet-async";
import { getImageUrl } from "../../shared/utils/api";
import "../style/ProductCustomize.css";

// ─── 🖼️ കസ്റ്റമൈസേഷൻ മാസ്കുകൾ (Masks for Clipping) 🖼️ ───
// ഈ മാസ്കുകൾ നിങ്ങളുടെ /public ഫോൾഡറിൽ ഉണ്ടായിരിക്കണം.
// കറുത്ത നിറത്തിലുള്ള മാസ്ക് ചിത്രങ്ങളാണ് ഏറ്റവും നല്ലത്.
const productMasks = {
  // ടി-ഷർട്ടിന്റെ ആകൃതിയിലുള്ള കറുത്ത മാസ്ക് PNG/SVG
  tshirt: "/masks/tshirt_mask.png", 
  // കപ്പിന്റെ ആകൃതിയിലുള്ള മാസ്ക്
  mug: "/masks/mug_mask.png", 
  // ...മറ്റുള്ളവ
};

function ProductCustomize() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect only if no base product selected
  const baseProduct = state?.baseProduct;
  useEffect(() => {
    if (!baseProduct?._id) {
      navigate("/shop");
    }
  }, [navigate, baseProduct]);

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [textSize, setTextSize] = useState(40);
  const [textColor, setTextColor] = useState("#000000");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [error, setError] = useState("");
  const [totalPrice, setTotalPrice] = useState(baseProduct?.price || baseProduct?.basePrice || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); 
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [activeImage, setActiveImage] = useState(null); 

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 700,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Load Product Background & Clipping Mask
    const loadStudio = () => {
      // 1. Load Background Image
      const bgImgElement = new Image();
      bgImgElement.crossOrigin = "anonymous";
      bgImgElement.src = baseProduct?.imageUrl ? getImageUrl(baseProduct.imageUrl) : "/placeholder-product.jpg";

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
          crossOrigin: "anonymous",
        });
        canvas.renderAll();

        // 2. 🛡️ Load Clipping Mask 🛡️
        // പ്രോജക്റ്റിന്റെ മാസ്ക് ലോഡ് ചെയ്യുന്നു (ടി-ഷർട്ട് അല്ലെങ്കിൽ കപ്പ്)
        const projectType = baseProduct?.category?.toLowerCase() || "tshirt";
        const maskUrl = productMasks[projectType] || productMasks.tshirt; // Default to tshirt mask

        if (maskUrl) {
          const maskImgElement = new Image();
          maskImgElement.crossOrigin = "anonymous";
          maskImgElement.src = maskUrl;

          maskImgElement.onload = () => {
            const fabricMask = new fabric.Image(maskImgElement);
            fabricMask.set({
              // ബാക്ക്ഗ്രൗണ്ടിന്റെ അതേ സ്കെയിലും അലൈൻമെന്റും നൽകുക
              scaleX: scale,
              scaleY: scale,
              left: (canvas.width - fabricBgImg.width * scale) / 2,
              top: (canvas.height - fabricBgImg.height * scale) / 2,
              selectable: false,
              evented: false, // മാസ്കിൽ ക്ലിക്ക് ചെയ്യാൻ പറ്റില്ല
              opacity: 0, // മാസ്ക് അദൃശ്യമാക്കുക
              name: "clipping-mask",
            });
            canvas.add(fabricMask);
            canvas.sendToBack(fabricMask); // മാസ്ക് ബാക്ക്ഗ്രൗണ്ടിന്റെ മുകളിലും ചിത്രങ്ങൾക്ക് താഴെയും നിൽക്കണം
            canvas.renderAll();
          };
        }
        
        saveState(); // Save initial state
      };
    };

    loadStudio();

    // History & Sync listeners
    const syncState = () => {
      saveState();
      updateObjectList();
      updatePrice();
    };

    canvas.on("object:modified", syncState);
    canvas.on("object:added", syncState);
    canvas.on("object:removed", syncState);
    canvas.on("selection:created", handleObjectSelection);
    canvas.on("selection:updated", handleObjectSelection);
    canvas.on("selection:cleared", () => setActiveImage(null));

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [baseProduct]);

  // Object Selection Handler
  const handleObjectSelection = (e) => {
    updateObjectList();
    const selected = e.selected[0];
    if (selected && selected.type === "image") {
      setActiveImage(selected);
      setActiveTab("image");
    } else {
      setActiveImage(null);
    }
  };

  // PRICE CALCULATION
  const updatePrice = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects().filter(o => o.name !== "clipping-mask");

    const textLayers = objs.filter((o) => o.type === "i-text").length;
    const imageLayers = objs.filter((o) => o.type === "image").length;

    const textCost = 30; // ₹30 per text layer
    const imageCost = 50; // ₹50 per image layer

    const base = baseProduct?.price || baseProduct?.basePrice || 0;
    setTotalPrice(base + textLayers * textCost + imageLayers * imageCost);
  }, [baseProduct]);

  // OBJECT LIST (LAYERS)
  const updateObjectList = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objs = [...canvas.getObjects()].filter(o => o.name !== "clipping-mask").reverse();
    setCanvasObjects(objs);
  }, []);

  // History Management
  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      const json = canvas.toJSON(["name", "selectable", "evented", "crossOrigin", "filters"]);
      setHistory((prev) => {
        const newHistory = [...prev, JSON.stringify(json)];
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
      });
      setRedoStack([]);
    } catch (err) {
      console.error("Failed to save canvas state:", err);
    }
  }, []);

  const undo = () => {
    if (history.length <= 1) return;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [current, ...prev]);
    loadState(previous);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setHistory((prev) => [...prev, next]);
    loadState(next);
  };

  const loadState = (jsonString) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.loadFromJSON(jsonString, () => {
      canvas.renderAll();
    });
  };

  // Add Text
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

  // ─── 🛡️ IMAGE UPLOAD WITH CLIPPING 🛡️ ───
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.src = event.target.result;
      imgElement.onload = () => {
        const img = new fabric.Image(imgElement);
        img.scale(0.5);
        img.set({ left: 100, top: 100, selectable: true, crossOrigin: "anonymous" });
        
        // 🛡️ ഈ ചിത്രം മാസ്കിനുള്ളിൽ മാത്രം കാണാൻ സെറ്റ് ചെയ്യുന്നു (Clipping Logic)
        img.set("globalCompositeOperation", "source-atop");

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

  // Layer Management
  const moveLayer = (direction) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;
    if (direction === "forward") canvas.bringObjectForward(active);
    else if (direction === "backward") canvas.sendObjectBackwards(active);
    canvas.renderAll();
    updateObjectList();
  };

  // Save Design & Add to Cart
  const saveAndProceed = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("⚠️ Please login to add items to cart. Your design is saved!");
      setTimeout(() => navigate("/login", { state: { redirectTo: `/customize`, baseProduct } }), 2000);
      return;
    }
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Generate high-quality preview (clipping works here)
    const designDataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    const cartItem = {
      productId: baseProduct._id,
      name: baseProduct.name,
      price: totalPrice,
      customDesignUrl: designDataUrl,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    alert("Added to cart!");
    navigate("/shop");
  };

  return (
    <div className="customize-page studio-theme">
      <Helmet>
        <title>{`Design Your ${baseProduct?.name || "Product"} | Agneya Studio`}</title>
      </Helmet>

      {/* Header */}
      <div className="studio-header">
        <button className="back-btn" onClick={() => navigate("/shop")}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="studio-title">
          Agneya <span>Design Studio</span>
        </h1>
        <div className="price-display">
          Total: <span>₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {/* Main Studio Layout */}
      <div className="studio-main-container">
        {/* Left Panel: Layers and Templates */}
        <aside className="studio-side-panel left-panel">
          <div className="panel-header">
            <button className={activeTab === 'templates' ? 'active' : ''} onClick={() => setActiveTab('templates')}>Templates</button>
            <button className={activeTab === 'layers' ? 'active' : ''} onClick={() => setActiveTab('layers')}>Layers</button>
          </div>
          
          <div className="panel-content">
            {activeTab === 'templates' && (
              <div className="template-grid">
                {Object.keys(templates).map(key => (
                  <div key={key} className="template-item" onClick={() => loadTemplate(key)}>
                    <div className="template-icon">{templates[key].name[0]}</div>
                    <span>{templates[key].name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'layers' && (
              <div className="layer-list">
                {canvasObjects.map((obj, idx) => (
                  <div key={idx} className="layer-item" onClick={() => {
                    fabricCanvasRef.current.setActiveObject(obj);
                    fabricCanvasRef.current.renderAll();
                  }}>
                    <i className={obj.type === 'i-text' ? 'bi bi-type' : 'bi bi-image'}></i>
                    <span className="layer-name">{obj.type} {idx + 1}</span>
                    <div className="layer-actions">
                      <button onClick={(e) => { e.stopPropagation(); moveLayer("forward"); }}><i className="bi bi-arrow-up-short"></i></button>
                      <button onClick={(e) => { e.stopPropagation(); fabricCanvasRef.current.remove(obj); }}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center Panel: Canvas */}
        <main className="studio-center-panel">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </main>

        {/* Right Panel: Tools (Text or Image) */}
        <aside className="studio-side-panel right-panel">
          <div className="panel-header">
            <span>Editor Tools</span>
          </div>
          
          <div className="panel-content">
            <div className="tool-section add-elements">
              <label>Add to Design</label>
              <div className="tool-grid">
                <button onClick={addText}><i className="bi bi-plus-square"></i> Text</button>
                <label className="upload-label">
                  <i className="bi bi-upload"></i> Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                </label>
              </div>
            </div>

            {/* History and Save actions */}
            <div className="tool-section history-actions">
              <div className="tool-grid">
                <button onClick={undo} disabled={history.length <= 1}><i className="bi bi-arrow-counterclockwise"></i> Undo</button>
                <button onClick={redo} disabled={!redoStack.length}><i className="bi bi-arrow-clockwise"></i> Redo</button>
              </div>
              <button onClick={saveAndProceed} className="primary-btn finish-btn">
                Add to Cart
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProductCustomize;






// // src/user/pages/ProductCustomize.jsx
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addToCart } from "../../store/cartSlice";
// import * as fabric from "fabric";
// import { Helmet } from "react-helmet-async";
// import TShirt3D from "../components/TShirt3D";
// import API from "../../shared/utils/api"; 
// import "../style/ProductCustomize.css";

// // ─── Sample Templates (expand as needed) ───
// const templates = {
//   birthday: {
//     name: "Happy Birthday Basic",
//     objects: [
//       {
//         type: "i-text",
//         text: "Happy Birthday",
//         fontSize: 72,
//         fill: "#ff6b6b",
//         left: 120,
//         top: 60,
//         fontFamily: "Lobster",
//       },
//       {
//         type: "i-text",
//         text: "[Your Name]",
//         fontSize: 90,
//         fill: "#4ecdc4",
//         left: 100,
//         top: 180,
//         fontFamily: "Great Vibes",
//       },
//     ],
//   },
//   wedding: {
//     name: "Wedding Special",
//     objects: [
//       { type: "i-text", text: "Save the Date", fontSize: 60, fill: "#9C51B6", left: 150, top: 100, fontFamily: "Dancing Script" },
//     ]
//   },
//   minimal: {
//     name: "Minimalist Cool",
//     objects: [
//       { type: "i-text", text: "LESS IS MORE", fontSize: 40, fill: "#333", left: 200, top: 200, fontFamily: "Roboto" },
//     ]
//   }
// };

// function ProductCustomize() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const baseProduct = state?.baseProduct;

//   const canvasRef = useRef(null);
//   const fabricCanvasRef = useRef(null);

//   const [textSize, setTextSize] = useState(40);
//   const [textColor, setTextColor] = useState("#000000");
//   const [selectedFont, setSelectedFont] = useState("Arial");
//   const [bold, setBold] = useState(false);
//   const [italic, setItalic] = useState(false);
//   const [underline, setUnderline] = useState(false);

//   const [history, setHistory] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [error, setError] = useState("");

//   // ─── NEW FEATURES STATES ───
//   const [currentSide, setCurrentSide] = useState("front"); // "front" | "back"
//   const [sideData, setSideData] = useState({ front: null, back: null });
//   const [canvasObjects, setCanvasObjects] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(baseProduct?.price || baseProduct?.basePrice || 0);
//   const [showDraftPrompt, setShowDraftPrompt] = useState(false);
//   const [hasSafeZone, setHasSafeZone] = useState(true);
//   const [qrText, setQrText] = useState("");
//   const [showQrInput, setShowQrInput] = useState(false);
//   const [show3D, setShow3D] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   // Redirect only if no base product selected
//   useEffect(() => {
//     if (!baseProduct?._id) {
//       navigate("/shop");
//     }
//   }, [navigate, baseProduct]);

//   // Load Google Fonts
//   useEffect(() => {
//     const link = document.createElement("link");
//     link.href =
//       "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Great+Vibes&family=Dancing+Script&family=Pacifico&family=Lobster&display=swap";
//     link.rel = "stylesheet";
//     document.head.appendChild(link);

//     return () => document.head.removeChild(link);
//   }, []);

//   // Initialize Fabric Canvas
//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = new fabric.Canvas(canvasRef.current, {
//       width: 700,
//       height: 700,
//       backgroundColor: "#f9fafb",
//       preserveObjectStacking: true,
//       selection: true,
//     });

//     fabricCanvasRef.current = canvas;

//     // Load base product image as background
//     const productImg = baseProduct?.imageUrl || "/placeholder-product.jpg";
//     setIsProcessing(true);
//     fabric.Image.fromURL(
//       productImg,
//       (img) => {
//         setIsProcessing(false);
//         if (!img) {
//           setError("Failed to load product image. Please try again.");
//           return;
//         }
//         const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
//         canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
//           scaleX: scale,
//           scaleY: scale,
//           left: (canvas.width - img.width * scale) / 2,
//           top: (canvas.height - img.height * scale) / 2,
//           selectable: false,
//           evented: false,
//           crossOrigin: "anonymous",
//         });
//         saveState(); // Save initial state
//       },
//       { crossOrigin: "anonymous" }
//     );

//     // History & Sync listeners
//     const syncState = () => {
//       saveState();
//       updateObjectList();
//       updatePrice();
//       autoSaveToLocal();
//     };

//     canvas.on("object:modified", syncState);
//     canvas.on("object:added", syncState);
//     canvas.on("object:removed", syncState);
//     canvas.on("selection:created", updateObjectList);
//     canvas.on("selection:updated", updateObjectList);
//     canvas.on("selection:cleared", updateObjectList);

//     // Initial Safe Zone
//     addSafeZoneOverlay(canvas);

//     // Check for Draft
//     const draft = localStorage.getItem(`draft_${baseProduct._id}`);
//     if (draft) setShowDraftPrompt(true);

//     return () => {
//       canvas.off();
//       canvas.dispose();
//       fabricCanvasRef.current = null;
//     };
//   }, [baseProduct]);

//   // ─── SAFE ZONE OVERLAY ───
//   const addSafeZoneOverlay = (canvas) => {
//     const margin = 40;
//     const rect = new fabric.Rect({
//       left: margin,
//       top: margin,
//       width: canvas.width - margin * 2,
//       height: canvas.height - margin * 2,
//       fill: "transparent",
//       stroke: "#9c51b6",
//       strokeDashArray: [5, 5],
//       selectable: false,
//       evented: false,
//       opacity: 0.5,
//       name: "safe-zone-overlay",
//     });
//     canvas.add(rect);
//     canvas.bringObjectToFront(rect);
//   };

//   const toggleSafeZone = () => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;
//     const overlay = canvas.getObjects().find(o => o.name === "safe-zone-overlay");
//     if (overlay) {
//       overlay.set("opacity", hasSafeZone ? 0 : 0.5);
//       setHasSafeZone(!hasSafeZone);
//       canvas.renderAll();
//     }
//   };

//   // ─── PRICE CALCULATION ───
//   const updatePrice = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;
//     const objs = canvas.getObjects().filter(o => o.name !== "safe-zone-overlay");
    
//     // Dynamic Pricing Logic: Base + per text layer + per image layer
//     const textLayers = objs.filter(o => o.type === "i-text").length;
//     const imageLayers = objs.filter(o => o.type === "image").length;
    
//     const textCost = 30; // ₹30 per text layer
//     const imageCost = 50; // ₹50 per image layer
    
//     const base = baseProduct?.price || baseProduct?.basePrice || 0;
//     setTotalPrice(base + (textLayers * textCost) + (imageLayers * imageCost));
//   }, [baseProduct]);

//   // ─── OBJECT LIST (LAYERS) ───
//   const updateObjectList = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;
//     const objs = [...canvas.getObjects()]
//       .filter(o => o.name !== "safe-zone-overlay" && o !== canvas.backgroundImage)
//       .reverse();
//     setCanvasObjects(objs);
//   }, []);

//   // ─── AUTO-SAVE ───
//   const autoSaveToLocal = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;
//     const json = canvas.toJSON(["name", "selectable", "evented"]);
//     localStorage.setItem(`draft_${baseProduct?._id}`, JSON.stringify(json));
//   }, [baseProduct]);

//   const loadDraft = () => {
//     const draft = localStorage.getItem(`draft_${baseProduct?._id}`);
//     if (draft) {
//       loadState(draft);
//       setShowDraftPrompt(false);
//     }
//   };

//   // ─── SIDE SWITCHING ───
//   const switchSide = (side) => {
//     if (side === currentSide) return;
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const currentJson = canvas.toJSON(["name", "selectable", "evented"]);
//     setSideData(prev => ({ ...prev, [currentSide]: JSON.stringify(currentJson) }));

//     canvas.getObjects().forEach(obj => {
//       if (obj !== canvas.backgroundImage) canvas.remove(obj);
//     });

//     const nextData = sideData[side];
//     if (nextData) {
//       canvas.loadFromJSON(nextData, () => {
//         addSafeZoneOverlay(canvas);
//         canvas.renderAll();
//       });
//     } else {
//       addSafeZoneOverlay(canvas);
//     }
//     setCurrentSide(side);
//   };

//   // ─── ALIGNMENT ───
//   const alignObject = (type) => {
//     const canvas = fabricCanvasRef.current;
//     const active = canvas?.getActiveObject();
//     if (!active) return;
//     if (type === "center") canvas.centerObject(active);
//     else if (type === "horizontally") active.centerH();
//     else if (type === "vertically") active.centerV();
//     active.setCoords();
//     canvas.requestRenderAll();
//     saveState();
//   };

//   // ─── QR CODE ───
//   const addQrCode = () => {
//     if (!qrText.trim()) return;
//     const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
//     fabric.Image.fromURL(url, (img) => {
//       img.set({ left: 250, top: 250, scaleX: 0.5, scaleY: 0.5 });
//       fabricCanvasRef.current?.add(img);
//       setShowQrInput(false);
//       setQrText("");
//     }, { crossOrigin: "anonymous" });
//   };

//   // ─── IMAGE FILTERS ───
//   const applyFilter = (filterType) => {
//     const canvas = fabricCanvasRef.current;
//     const active = canvas?.getActiveObject();
//     if (!active || active.type !== "image") return;
//     let filter;
//     if (filterType === "grayscale") filter = new fabric.Image.filters.Grayscale();
//     else if (filterType === "sepia") filter = new fabric.Image.filters.Sepia();
//     else if (filterType === "invert") filter = new fabric.Image.filters.Invert();
//     if (filter) {
//       active.filters.push(filter);
//       active.applyFilters();
//       canvas.renderAll();
//       saveState();
//     }
//   };

//   // ─── LAYER OPS ───
//   const moveLayer = (direction) => {
//     const canvas = fabricCanvasRef.current;
//     const active = canvas?.getActiveObject();
//     if (!active) return;
//     if (direction === "forward") canvas.bringObjectForward(active);
//     else if (direction === "backward") canvas.sendObjectBackwards(active);
//     else if (direction === "top") canvas.bringObjectToFront(active);
//     else if (direction === "bottom") canvas.sendObjectToBack(active);
    
//     // Ensure safe-zone-overlay is always on top
//     const objects = canvas.getObjects();
//     const overlay = objects.find(o => o.name === "safe-zone-overlay");
//     if (overlay) canvas.bringObjectToFront(overlay);
//     canvas.renderAll();
//     updateObjectList();
//   };

//   // ─── TEXT EFFECTS (Shadow/Stroke) ───
//   const applyTextEffect = (type, value) => {
//     const canvas = fabricCanvasRef.current;
//     const active = canvas?.getActiveObject();
//     if (!active || active.type !== "i-text") return;
//     if (type === "stroke") {
//        active.set({ stroke: value, strokeWidth: value ? 2 : 0 });
//     } else if (type === "shadow") {
//        active.set("shadow", value ? new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 10, offsetX: 5, offsetY: 5 }) : null);
//     }
//     canvas.renderAll();
//     saveState();
//   };

//   // ─── History Management ───
//   const saveState = useCallback(() => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     try {
//       const json = canvas.toJSON(["fontFamily", "fontWeight", "fontStyle", "underline"]);
//       setHistory((prev) => {
//         const newHistory = [...prev, JSON.stringify(json)];
//         // Limit history to prevent memory issues
//         if (newHistory.length > 30) newHistory.shift();
//         return newHistory;
//       });
//       setRedoStack([]);
//     } catch (err) {
//       console.error("Failed to save canvas state:", err);
//     }
//   }, []);

//   const undo = () => {
//     if (history.length <= 1) return;
//     const current = history[history.length - 1];
//     const previous = history[history.length - 2];

//     setHistory((prev) => prev.slice(0, -1));
//     setRedoStack((prev) => [current, ...prev]);

//     loadState(previous);
//   };

//   const redo = () => {
//     if (!redoStack.length) return;
//     const next = redoStack[0];
//     setRedoStack((prev) => prev.slice(1));
//     setHistory((prev) => [...prev, next]);
//     loadState(next);
//   };

//   const loadState = (jsonString) => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     canvas.loadFromJSON(jsonString, () => {
//       canvas.renderAll();
//     });
//   };

//   // ─── Add Text ───
//   const addText = () => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const text = new fabric.IText("Edit me", {
//       left: 180,
//       top: 180,
//       fontSize: textSize,
//       fill: textColor,
//       fontFamily: selectedFont,
//       fontWeight: bold ? "bold" : "normal",
//       fontStyle: italic ? "italic" : "normal",
//       underline: underline,
//       editable: true,
//     });

//     canvas.add(text);
//     canvas.setActiveObject(text);
//     canvas.requestRenderAll();
//   };

//   // ─── Image Upload ───
//   const handleImageUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       fabric.Image.fromURL(event.target.result, (img) => {
//         img.scale(0.5);
//         img.set({ left: 100, top: 100, selectable: true });
//         fabricCanvasRef.current?.add(img);
//         fabricCanvasRef.current?.setActiveObject(img);
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   // ─── AI Background Removal (remove.bg) ───
//   const removeBackground = async () => {
//     const canvas = fabricCanvasRef.current;
//     const active = canvas?.getActiveObject();

//     if (!active || active.type !== "image") {
//       setError("Please select an uploaded image first");
//       return;
//     }

//     try {
//       setError("");
//       const dataUrl = active.toDataURL({ format: "png" });
//       const blob = await (await fetch(dataUrl)).blob();

//       const formData = new FormData();
//       formData.append("image_file", blob, "uploaded.png");
//       formData.append("size", "auto");

//       const res = await fetch("https://api.remove.bg/v1.0/removebg", {
//         method: "POST",
//         headers: {
//           "X-Api-Key": "YOUR_REMOVE_BG_API_KEY_HERE", // ← Replace with your actual key
//         },
//         body: formData,
//       });

//       if (!res.ok) {
//         throw new Error(`Remove.bg error: ${res.statusText}`);
//       }

//       const newBlob = await res.blob();
//       const newUrl = URL.createObjectURL(newBlob);

//       fabric.Image.fromURL(newUrl, (img) => {
//         img.scaleToWidth(active.getScaledWidth());
//         img.set({
//           left: active.left,
//           top: active.top,
//         });
//         canvas.remove(active);
//         canvas.add(img);
//         canvas.setActiveObject(img);
//         saveState();
//       });
//     } catch (err) {
//       setError("Background removal failed: " + err.message);
//       console.error(err);
//     }
//   };

//   // ─── Load Template ───
//   const loadTemplate = (key) => {
//     const tpl = templates[key];
//     if (!tpl) return;

//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     // Clear only foreground objects (keep background)
//     canvas.getObjects().forEach((obj) => {
//       if (obj !== canvas.backgroundImage) canvas.remove(obj);
//     });

//     // Add template objects
//     tpl.objects.forEach((obj) => {
//       if (obj.type === "text") {
//         const text = new fabric.IText(obj.text, {
//           left: obj.left,
//           top: obj.top,
//           fontSize: obj.fontSize,
//           fill: obj.fill,
//           fontFamily: obj.fontFamily,
//         });
//         canvas.add(text);
//       }
//     });

//     canvas.requestRenderAll();
//     saveState();
//   };

//   // ─── Generate High-Res Preview ───
//   const generatePrintPreview = () => {
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const multiplier = 3; // for ~300 DPI

//     const tempCanvas = new fabric.StaticCanvas(null, {
//       width: canvas.width * multiplier,
//       height: canvas.height * multiplier,
//     });

//     // Clone objects with scale
//     canvas.getObjects().forEach((obj) => {
//       if (obj === canvas.backgroundImage) return;
//       const clone = obj.toObject();
//       tempCanvas.add(
//         fabric.util.object.enlivenObjects([clone])[0].set({
//           scaleX: (obj.scaleX || 1) * multiplier,
//           scaleY: (obj.scaleY || 1) * multiplier,
//           left: (obj.left || 0) * multiplier,
//           top: (obj.top || 0) * multiplier,
//         })
//       );
//     });

//     // Background image
//     if (canvas.backgroundImage) {
//       const bg = canvas.backgroundImage;
//       tempCanvas.setBackgroundImage(
//         new fabric.Image(bg.getElement(), {
//           scaleX: multiplier,
//           scaleY: multiplier,
//         }),
//         tempCanvas.renderAll.bind(tempCanvas)
//       );
//     }

//     const url = tempCanvas.toDataURL({ format: "png", multiplier: 1 });
//     setPreviewUrl(url);
//     setShowPreview(true);
//     tempCanvas.dispose();
//   };

//   // ─── Save Design & Add to Cart ───
//   const saveAndProceed = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("⚠️ Please login to add items to cart. Your design is saved locally!");
//       setTimeout(() => navigate("/login", { state: { redirectTo: `/customize`, baseProduct } }), 1500);
//       return;
//     }
//     const canvas = fabricCanvasRef.current;
//     if (!canvas) return;

//     const designDataUrl = canvas.toDataURL({
//       format: "png",
//       quality: 0.92,
//       multiplier: 2,
//     });

//     const cartItem = {
//       productId: baseProduct._id,
//       name: baseProduct.name,
//       price: totalPrice,
//       customDesignUrl: designDataUrl,
//       canvasData: canvas.toJSON(),
//       quantity: 1,
//     };

//     dispatch(addToCart(cartItem));
//     alert("Added to cart!");
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

