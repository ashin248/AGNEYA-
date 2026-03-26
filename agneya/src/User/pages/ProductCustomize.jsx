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
  "Arial",
  "Pacifico",
  "Graduate",
  "Bangers",
  "Bebas Neue",
  "Orbitron",
  "Lobster",
  "Righteous",
  "Permanent Marker",
  "Monoton",
];

const CLIPART_ITEMS = [
  { name: "Flame", url: "https://www.svgrepo.com/show/439169/flame.svg" },
  { name: "Crown", url: "https://www.svgrepo.com/show/439139/crown.svg" },
  { name: "Star", url: "https://www.svgrepo.com/show/439321/star.svg" },
  { name: "Heart", url: "https://www.svgrepo.com/show/439189/heart.svg" },
  {
    name: "Lightning",
    url: "https://www.svgrepo.com/show/439226/lightning.svg",
  },
  { name: "Diamond", url: "https://www.svgrepo.com/show/439149/diamond.svg" },
  { name: "Skull", url: "https://www.svgrepo.com/show/439311/skull.svg" },
  { name: "Rocket", url: "https://www.svgrepo.com/show/439304/rocket.svg" },
];

function ProductCustomize() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [baseProduct, setBaseProduct] = useState(() => {
    if (state?.baseProduct) return state.baseProduct;
    const saved = localStorage.getItem("current_product");
    return saved ? JSON.parse(saved) : null;
  });

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
  const [totalPrice, setTotalPrice] = useState(
    baseProduct?.price || baseProduct?.basePrice || 0,
  );
  const [activeTab, setActiveTab] = useState("text");
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [activeSideIndex, setActiveSideIndex] = useState(0);
  const [sidesData, setSidesData] = useState({});
  const [showSafetyArea, setShowSafetyArea] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect & Google Fonts
  useEffect(() => {
    if (baseProduct?._id) {
      localStorage.setItem("current_product", JSON.stringify(baseProduct));
    }

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.filter(
      (f) => f !== "Arial",
    )
      .map((f) => f.replace(/ /g, "+"))
      .join("&family=")}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => document.head.removeChild(link);
  }, [baseProduct]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !baseProduct) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 700,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
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
    canvas.on("selection:created", handleObjectSelection);
    canvas.on("selection:updated", handleObjectSelection);
    canvas.on("selection:cleared", () => {
      setActiveImage(null);
      updateObjectList();
    });

    canvas.on("mouse:wheel", function(opt) {
      if (opt.e.ctrlKey || opt.e.metaKey || opt.e.shiftKey || opt.e.altKey) {
        let delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.2) zoom = 0.2;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    });

    canvas.on('mouse:down', function(opt) {
      let evt = opt.e;
      if (evt.shiftKey === true || evt.altKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:move', function(opt) {
      if (this.isDragging) {
        let e = opt.e;
        let vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    canvas.on('mouse:up', function(opt) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [baseProduct]);

  const loadSide = (index) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !baseProduct) return;

    setIsSaving(true);
    canvas.clear();

    const imageUrl = baseProduct.images?.[index] || baseProduct.imageUrl;
    const bgImgElement = new Image();
    bgImgElement.crossOrigin = "anonymous";
    bgImgElement.src = getImageUrl(imageUrl) || "/placeholder-product.jpg";

    bgImgElement.onload = () => {
      const fabricBgImg = new fabric.Image(bgImgElement);
      const scale = Math.min(
        canvas.width / fabricBgImg.width,
        canvas.height / fabricBgImg.height,
      );

      canvas.backgroundImage = fabricBgImg;
      fabricBgImg.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width - fabricBgImg.width * scale) / 2,
        top: (canvas.height - fabricBgImg.height * scale) / 2,
        selectable: false,
      });

      // Load Clipping Mask
      const projectType = baseProduct?.category?.toLowerCase() || "";
      const maskUrl = productMasks[projectType];

      const finishLoading = (maskObject, safetyWidth, safetyHeight) => {
        // Safety Area
        const safetyRect = new fabric.Rect({
          left: canvas.width / 2 - safetyWidth / 2,
          top: canvas.height / 2 - safetyHeight / 2,
          width: safetyWidth,
          height: safetyHeight,
          fill: "transparent",
          stroke: "#ff4081",
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          name: "safety-area",
          visible: showSafetyArea,
          opacity: 0.6,
        });
        canvas.add(safetyRect);
        canvas.bringToFront(safetyRect);

        // Load saved data for this side
        if (sidesData[index]) {
          canvas.loadFromJSON(sidesData[index], () => {
            reApplyClipPath();
            canvas.renderAll();
            setIsSaving(false);
          });
        } else {
          // Check for draft recovery if this is the first load
          const draft = localStorage.getItem(`agneya_draft_${baseProduct._id}`);
          if (draft && Object.keys(sidesData).length === 0) {
            const parsed = JSON.parse(draft);
            setSidesData(parsed);
            if (parsed[index]) {
              canvas.loadFromJSON(parsed[index], () => {
                reApplyClipPath();
                canvas.renderAll();
                setIsSaving(false);
              });
              return;
            }
          }
          canvas.renderAll();
          setIsSaving(false);
        }
      };

      if (maskUrl) {
        const maskImgElement = new Image();
        maskImgElement.crossOrigin = "anonymous";
        maskImgElement.src = maskUrl;

        maskImgElement.onload = () => {
          const fabricMask = new fabric.Image(maskImgElement);
          fabricMask.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvas.width - fabricBgImg.width * scale) / 2,
            top: (canvas.height - fabricBgImg.height * scale) / 2,
            selectable: false,
            evented: false,
            opacity: 0,
            name: "clipping-mask",
            absolutePositioned: true,
          });

          canvas.add(fabricMask);
          canvas.sendToBack(fabricMask);
          canvas.clipPath = fabricMask;

          finishLoading(fabricMask, 300, 400); // Default tshirt safety area
        };
      } else {
        // Generic Rectangular mask for other products (like mobile covers)
        const printW = fabricBgImg.width * scale * 0.5; // ~50% of background width
        const printH = fabricBgImg.height * scale * 0.8; // ~80% of background height
        const fabricMask = new fabric.Rect({
          width: printW,
          height: printH,
          left: (canvas.width - printW) / 2,
          top: (canvas.height - printH) / 2,
          selectable: false,
          evented: false,
          opacity: 0,
          name: "clipping-mask",
          absolutePositioned: true,
        });

        canvas.add(fabricMask);
        canvas.sendToBack(fabricMask);
        canvas.clipPath = fabricMask;

        finishLoading(fabricMask, printW, printH);
      }
    };
  };

  const handleZoom = (scaleDelta) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    let zoom = canvas.getZoom() * scaleDelta;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.2) zoom = 0.2;
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoom);
  };

  const reApplyClipPath = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const mask = canvas.getObjects().find((o) => o.name === "clipping-mask");
    if (mask) {
      canvas.clipPath = mask;
    }
  };

  const switchSide = (newIndex) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !baseProduct) return;

    // Save current side
    const json = canvas.toJSON([
      "name",
      "selectable",
      "evented",
      "filters",
      "crossOrigin",
    ]);
    setSidesData((prev) => {
      const updated = { ...prev, [activeSideIndex]: JSON.stringify(json) };
      // Also save to draft for recovery
      localStorage.setItem(`agneya_draft_${baseProduct._id}`, JSON.stringify(updated));
      return updated;
    });

    setActiveSideIndex(newIndex);
    loadSide(newIndex);
  };

  // Update safety area visibility
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const sArea = canvas.getObjects().find((o) => o.name === "safety-area");
    if (sArea) {
      sArea.set("visible", showSafetyArea);
      canvas.renderAll();
    }
  }, [showSafetyArea]);

  const handleObjectSelection = (e) => {
    updateObjectList();
    const selected = e.selected ? e.selected[0] : null;
    if (
      selected &&
      selected.type === "image" &&
      selected.name !== "clipping-mask"
    ) {
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
    setCanvasObjects(
      [...canvas.getObjects()]
        .filter((o) => o.name !== "clipping-mask")
        .reverse(),
    );
  }, []);

  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      const json = canvas.toJSON([
        "name",
        "selectable",
        "evented",
        "filters",
        "crossOrigin",
      ]);
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
      reApplyClipPath();
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
      reApplyClipPath();
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

  // Canva-style Clipped Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.src = event.target.result;
      imgElement.onload = () => {
        const canvas = fabricCanvasRef.current;
        const img = new fabric.Image(imgElement, { crossOrigin: "anonymous" });
        img.scaleToWidth(220);

        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        setActiveImage(img);
        setActiveTab("image");
        canvas.renderAll();
        saveState();
      };
    };
    reader.readAsDataURL(file);
  };

  const addClipArt = (url) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(150);
        img.set({ crossOrigin: "anonymous" });

        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveState();
      },
      { crossOrigin: "anonymous" },
    );
  };

  const applyNeon = (enabled) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active || active.type !== "i-text") return;

    if (enabled) {
      active.set(
        "shadow",
        new fabric.Shadow({
          color: textColor,
          blur: 20,
          offsetX: 0,
          offsetY: 0,
        }),
      );
    } else {
      active.set("shadow", null);
    }
    setIsNeon(enabled);
    canvas.renderAll();
    saveState();
  };

  const applyCurve = (value) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!active || active.type !== "i-text") return;

    if (value === 0) {
      active.set("path", null);
    } else {
      const pathData = `M 0 0 Q 150 ${value * 2} 300 0`;
      active.set("path", new fabric.Path(pathData, { visible: false }));
    }
    setTextCurve(value);
    canvas.renderAll();
    saveState();
  };

  const applyFilter = (filterType) => {
    if (!activeImage) return;
    let filter =
      filterType === "grayscale"
        ? new fabric.Image.filters.Grayscale()
        : filterType === "sepia"
          ? new fabric.Image.filters.Sepia()
          : null;

    if (filter) {
      activeImage.filters = [filter];
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
      handleSaveDraft();
      setError("Please login to add to cart. Design saved as draft!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const canvas = fabricCanvasRef.current;
    const sArea = canvas.getObjects().find((o) => o.name === "safety-area");
    if (sArea) sArea.set("visible", false);

    const designDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    if (sArea) sArea.set("visible", showSafetyArea);

    const finalSides = {
      ...sidesData,
      [activeSideIndex]: JSON.stringify(
        canvas.toJSON([
          "name",
          "selectable",
          "evented",
          "filters",
          "crossOrigin",
        ]),
      ),
    };

    dispatch(
      addToCart({
        productId: baseProduct._id,
        name: baseProduct.name,
        price: totalPrice,
        customDesignUrl: designDataUrl,
        allSides: finalSides,
        quantity: 1,
      }),
    );

    alert("Added to cart successfully!");
    navigate("/shop");
  };

  const handleSaveDraft = () => {
    const canvas = fabricCanvasRef.current;
    const updatedSides = {
      ...sidesData,
      [activeSideIndex]: JSON.stringify(
        canvas.toJSON([
          "name",
          "selectable",
          "evented",
          "filters",
          "crossOrigin",
        ]),
      ),
    };
    localStorage.setItem(
      `agneya_draft_${baseProduct._id}`,
      JSON.stringify(updatedSides),
    );
    alert("Draft saved successfully!");
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleSaveDraft();
      setError("Please login to Buy Now. Design saved as draft!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const canvas = fabricCanvasRef.current;
    const designDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });

    navigate("/purchase", {
      state: {
        product: { ...baseProduct, price: totalPrice },
        customDesignUrl: designDataUrl,
        allSides: sidesData,
      },
    });
  };

  if (!baseProduct) {
    return (
      <div className="customize-page studio-theme error-state">
        <div className="error-content">
          <i className="bi bi-exclamation-triangle"></i>
          <h2>Product Not Found</h2>
          <p>
            We couldn't find the product you were customizing. Please select a
            product from the shop.
          </p>
          <button className="back-shop-btn" onClick={() => navigate("/shop")}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customize-page studio-theme">
      <Helmet>
        <title>Design Your {baseProduct.name} | Agneya Studio</title>
      </Helmet>

      <div className="studio-header">
        <button className="back-btn" onClick={() => navigate("/shop")}>
          ← Back
        </button>
        <h1 className="studio-title">
          Agneya <span>Studio</span>
        </h1>
        <div className="price-display">
          Total: <span>₹{totalPrice}</span>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="studio-main-container">
        {/* Left Panel */}
        <aside className="studio-side-panel left-panel">
          <div className="panel-header">
            <button
              className={activeTab === "layers" ? "active" : ""}
              onClick={() => setActiveTab("layers")}
            >
              Layers
            </button>
            <button
              className={activeTab === "clipart" ? "active" : ""}
              onClick={() => setActiveTab("clipart")}
            >
              ClipArt
            </button>
          </div>
          <div className="panel-content">
            {activeTab === "layers" &&
              canvasObjects.map((obj, idx) => (
                <div
                  key={idx}
                  className="layer-item"
                  onClick={() => fabricCanvasRef.current.setActiveObject(obj)}
                >
                  <i
                    className={
                      obj.type === "i-text" ? "bi bi-type" : "bi bi-image"
                    }
                  ></i>
                  <span className="layer-name">
                    {obj.type} {idx + 1}
                  </span>
                  <div className="layer-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer("up");
                      }}
                    >
                      <i className="bi bi-arrow-up-short"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fabricCanvasRef.current.remove(obj);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "clipart" && (
              <div className="clipart-grid">
                {CLIPART_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="clipart-item"
                    onClick={() => addClipArt(item.url)}
                  >
                    <img src={item.url} alt={item.name} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="studio-center-panel">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />

            {/* Side Switcher */}
            <div className="side-switcher">
              {(baseProduct.images || [baseProduct.imageUrl]).map((_, idx) => (
                <div
                  key={idx}
                  className={`side-thumb ${activeSideIndex === idx ? "active" : ""}`}
                  onClick={() => switchSide(idx)}
                >
                  <img
                    src={getImageUrl(
                      baseProduct.images?.[idx] || baseProduct.imageUrl,
                    )}
                    alt={`Side ${idx + 1}`}
                  />
                  <span>Side {idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="guide-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showSafetyArea}
                  onChange={(e) => setShowSafetyArea(e.target.checked)}
                />
                Show Print Guide
              </label>
            </div>
            <div className="zoom-controls">
              <button onClick={() => handleZoom(0.8)} title="Zoom Out">
                <i className="bi bi-zoom-out"></i> -
              </button>
              <button onClick={() => handleZoom(1.2)} title="Zoom In">
                <i className="bi bi-zoom-in"></i> +
              </button>
              <span className="tooltip-hint">(Scroll + Ctrl to Zoom, Shift to Pan)</span>
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <aside className="studio-side-panel right-panel">
          <div className="tool-section">
            <label>Add Elements</label>
            <div className="tool-grid">
              <button onClick={addText}>Add Text</button>
              <label className="tool-btn upload-label">
                Upload Image{" "}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* Text Controls */}
          <div className="tool-section">
            <label>Text Properties</label>
            <div>
              <input
                type="range"
                min="10"
                max="100"
                value={textSize}
                onChange={(e) => setTextSize(+e.target.value)}
              />
              <span>Size: {textSize}</span>
            </div>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Effects */}
          <div className="tool-section">
            <label>Text Effects</label>
            <div className="effect-grid">
              <button
                className={isNeon ? "active neon-btn" : "neon-btn"}
                onClick={() => applyNeon(!isNeon)}
              >
                Neon Glow
              </button>
            </div>
            <div className="slider-group">
              <label>Curve Text ({textCurve})</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={textCurve}
                onChange={(e) => applyCurve(+e.target.value)}
              />
            </div>
          </div>

          {/* Filters for Images */}
          {activeImage && (
            <div className="tool-section">
              <label>Image Filters</label>
              <div className="tool-grid">
                <button onClick={() => applyFilter("grayscale")}>B&W</button>
                <button onClick={() => applyFilter("sepia")}>Sepia</button>
              </div>
            </div>
          )}

          <div className="history-section">
            <button onClick={undo} disabled={history.length <= 1}>
              Undo
            </button>
            <button onClick={redo} disabled={!redoStack.length}>
              Redo
            </button>
          </div>

          <div className="action-buttons">
            <button className="finish-btn draft-btn" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button
              className="finish-btn preview-3d-btn"
              onClick={() => setShow3D(true)}
            >
              3D Preview
            </button>
            <button className="finish-btn add-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="finish-btn buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </aside>
      </div>

      {/* 3D Modal */}
      {show3D && (
        <div className="studio-modal-overlay" onClick={() => setShow3D(false)}>
          <div
            className="studio-modal 3d-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>3D Product Preview</h2>
              <button className="close-modal" onClick={() => setShow3D(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <TShirt3D fabricCanvas={fabricCanvasRef.current} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCustomize;