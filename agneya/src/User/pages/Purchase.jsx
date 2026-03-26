
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../shared/utils/api";
import "../style/Purchase.css";

const Purchase = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const product = state?.product || null;
  const cartItems = state?.cartItems || (product ? [{
    productId: product._id,
    name: product.name,
    price: product.price || product.basePrice || 0,
    quantity: 1,
    imageUrl: product.imageUrl,
    customDesignUrl: state?.customDesignUrl || null
  }] : []);
  
  const totalAmount = state?.total || cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isCustom = cartItems.some(i => !!i.customDesignUrl);

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    postOffice: "",
    country: "India",
  });

  // Load user + validation
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Verify user exists on backend to catch "User no longer exists" early
    if (user) {
      API.get("/api/users/profile").catch(() => {
        // Interceptor will handle logout if 401
      });
    }

    if (!user) {
      if (product) {
        localStorage.setItem("redirectAfterLogin", JSON.stringify({ 
          path: "/purchase", 
          state: { product, customDesignUrl } 
        }));
      }
      navigate("/login", { state: { from: "/purchase" } });
      return;
    }

    if (!product) {
      navigate("/shop");
      return;
    }

    setAddress({
      fullName: user.fullName || "",
      mobile: user.mobile || "",
      addressLine: user.address?.addressLine || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      pincode: user.address?.pincode || "",
      country: "India",
    });
  }, [navigate]); // Removed product dependency

  if (cartItems.length === 0) {
    navigate("/shop");
    return null;
  }
  // ✅ FIXED input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Auto-fetch City and State when Pincode reaches 6 digits
  useEffect(() => {
    const fetchPincodeDetails = async (pin) => {
      setPincodeLoading(true);
      setPincodeError("");
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setAddress(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            postOffice: postOffice.Name
          }));
        } else {
          setPincodeError("Invalid Pincode. Please check your entry.");
          setAddress(prev => ({ ...prev, postOffice: "" }));
        }
      } catch (error) {
        console.error("Error fetching pincode:", error);
      } finally {
        setPincodeLoading(false);
      }
    };

    if (address.pincode?.length === 6) {
      fetchPincodeDetails(address.pincode);
    } else {
      setAddress(prev => ({ ...prev, postOffice: "" }));
      setPincodeError("");
    }
  }, [address.pincode]);

  const proceedPayment = async () => {
    if (
      !address.fullName.trim() ||
      !address.mobile.trim() ||
      !address.addressLine.trim()
    ) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customDesignUrl: item.customDesignUrl || null,
        })),
        amount: totalAmount,
        address,
      };

      const res = await API.post("/api/orders/create", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success && res.data.order) {
        navigate("/online-payment", {
          state: {
            orderId: res.data.order._id,
            razorpayOrderId: res.data.razorpayOrderId,
            amount: Number(res.data.order.amount),
            razorpayAmount: res.data.razorpayAmount,
            cartItems,
            totalAmount,
          },
        });
      } else {
        alert("Order creation failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return <div className="no-product">No product selected</div>;
  }

  return (
    <div className="purchase-container">
      <h1>Checkout</h1>

      {/* Products Preview */}
      <div className="checkout-products-list">
        {cartItems.map((item, idx) => (
          <div key={idx} className="product-preview-mini">
            <img
              src={item.customDesignUrl || item.imageUrl}
              alt={item.name}
            />
            <div className="mini-details">
              <h4>{item.name}</h4>
              <p>₹{item.price.toLocaleString("en-IN")} x {item.quantity}</p>
            </div>
          </div>
        ))}
        <div className="checkout-total-row">
          <span>Total Payable:</span>
          <span className="total-price">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <h3>Shipping Address</h3>

      <div className="address-form">
        <input
          name="fullName"
          value={address.fullName}
          onChange={handleChange}
          placeholder="Full Name *"
        />

        <input
          name="mobile"
          value={address.mobile}
          onChange={handleChange}
          placeholder="Mobile *"
        />
         <div style={{display: "flex", flexDirection: "column", gap: "4px", width: "100%", marginBottom: "15px"}}>
          <label style={{fontSize: "14px", fontWeight: "bold", color: "#333"}}>PIN Code {pincodeLoading && <span style={{fontSize: "0.8rem", color: "#999", fontWeight: "normal"}}>(Checking...)</span>}</label>
          <input
            name="pincode"
            value={address.pincode}
            maxLength={6}
            onChange={(e) => {
              if (/^\d{0,6}$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="6-digit PIN"
            style={{marginBottom: "0"}}
          />
          {address.postOffice && (
            <p style={{fontSize: "0.85rem", color: "#9c51b6", fontWeight: "600", marginTop: "4px"}}>
              📍 Post Office: {address.postOffice}
            </p>
          )}
          {pincodeError && <span style={{color: "red", fontSize: "0.8rem"}}>{pincodeError}</span>}
        </div>
        <input
          name="addressLine"
          value={address.addressLine}
          onChange={handleChange}
          placeholder="Address *"
        />

        <input
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
        />

        <input
          name="state"
          value={address.state}
          onChange={handleChange}
          placeholder="State"
        />
        {/* ----------------------------------------------------------------- */}


      </div>

      <button
        className="proceed-btn"
        onClick={proceedPayment}
        disabled={
          loading ||
          !address.fullName.trim() ||
          !address.mobile.trim() ||
          !address.addressLine.trim()
        }
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
};

export default Purchase;





// // src/user/pages/Purchase.jsx
// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../../shared/utils/api";
// import "../style/Purchase.css";

// const Purchase = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // Product Data
//   const product = state?.product
//     ? {
//         _id: state.product._id,
//         name: state.product.name,
//         imageUrl: state.product.imageUrl,
//         price: state.product.price || 0,
//         basePrice: state.product.basePrice || 0,
//       }
//     : null;

//   const customDesignUrl = state?.customDesignUrl || "";
//   const isCustom = !!customDesignUrl;

//   // Address State
//   const [address, setAddress] = useState({
//     fullName: "",
//     mobile: "",
//     addressLine: "",
//     city: "",
//     state: "",
//     pincode: "",
//     country: "India",
//   });

//   // Load saved user address (once)
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));

//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     if (!product) {
//       navigate("/shop");
//       return;
//     }

//     setAddress({
//       fullName: user.fullName || user.address?.fullName || "",
//       mobile: user.mobile || user.address?.mobile || "",
//       addressLine: user.address?.addressLine || "",
//       city: user.address?.city || "",
//       state: user.address?.state || "",
//       pincode: user.address?.pincode || "",
//       country: user.address?.country || "India",
//     });
//   }, [navigate, product]); // dependencies corrected

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setAddress((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const proceedPayment = async () => {
//     // Basic validation
//     if (!address.fullName.trim() || !address.mobile.trim() || !address.addressLine.trim()) {
//       alert("Please fill in Full Name, Mobile Number, and Address Line.");
//       return;
//     }

//     try {
//       const payload = {
//         productId: product._id,
//         amount: product.price || product.basePrice || 0,
//         address,
//         customDesignUrl: customDesignUrl || null,
//         quantity: 1,
//       };

//       const res = await API.post("/api/orders/create", payload, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (res.data.success && res.data.order) {
//         navigate("/online-payment", {
//           state: {
//             orderId: res.data.order._id,
//             amount: Number(res.data.order.amount),
//             product,
//             customDesignUrl: customDesignUrl || null,
//           },
//         });
//       } else {
//         alert("Order creation failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Order creation error:", err);
//       alert(err.response?.data?.message || "Failed to create order. Please try again.");
//     }
//   };

//   if (!product) {
//     return <div className="no-product">No product selected. Please go back to shop.</div>;
//   }

//   return (
//     <div className="purchase-container">
//       <h1>Checkout</h1>

//       {/* Product Preview */}
//       <div className="product-preview">
//         <img
//           src={isCustom ? customDesignUrl : product.imageUrl}
//           alt={product.name}
//           onError={(e) => (e.target.src = "/placeholder-product.jpg")}
//         />
//         <div className="product-info">
//           <h2>{product.name}</h2>
//           <p className="price">
//             ₹{(product.price || product.basePrice || 0).toLocaleString("en-IN")}
//           </p>
//         </div>
//       </div>

//       <h3>Shipping Address</h3>

//       <div className="address-form">
//         <input
//           type="text"
//           name="fullName"
//           value={address.fullName}
//           onChange={handleChange}
//           placeholder="Full Name *"
//           required
//         />

//         <input
//           type="tel"
//           name="mobile"
//           value={address.mobile}
//           onChange={handleChange}
//           placeholder="Mobile Number *"
//           required
//         />

//         <input
//           type="text"
//           name="addressLine"
//           value={address.addressLine}
//           onChange={handleChange}
//           placeholder="House No, Street, Area *"
//           required
//         />

//         <input
//           type="text"
//           name="city"
//           value={address.city}
//           onChange={handleChange}
//           placeholder="City / Town"
//         />

//         <input
//           type="text"
//           name="state"
//           value={address.state}
//           onChange={handleChange}
//           placeholder="State"
//         />

//         <input
//           type="text"
//           name="pincode"
//           value={address.pincode}
//           onChange={handleChange}
//           placeholder="PIN Code"
//         />

//         {/* Hidden country field - default India */}
//         <input type="hidden" name="country" value="India" />
//       </div>

//       <button
//         className="proceed-btn"
//         onClick={proceedPayment}
//         disabled={!address.fullName || !address.mobile || !address.addressLine}
//       >
//         Proceed to Payment
//       </button>
//     </div>
//   );
// };

// export default Purchase;