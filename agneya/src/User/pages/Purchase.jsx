
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../shared/utils/api";
import "../style/Purchase.css";

const Purchase = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const product = state?.product || null;
  const customDesignUrl = state?.customDesignUrl || "";
  const isCustom = !!customDesignUrl;

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Load user + validation
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
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
  }, [navigate, product]);

  // ✅ FIXED input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);

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
        cartItems: [
          {
            productId: product._id,
            name: product.name,
            price: product.price || product.basePrice || 0,
            quantity: 1,
            customDesignUrl: customDesignUrl || null,
          },
        ],
        amount: product.price || product.basePrice || 0,
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
            product,
            customDesignUrl: customDesignUrl || null,
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

      {/* Product */}
      <div className="product-preview">
        <img
          src={isCustom ? customDesignUrl : product.imageUrl}
          alt={product.name}
        />
        <div>
          <h2>{product.name}</h2>
          <p className="price">
            ₹{(product.price || product.basePrice || 0).toLocaleString("en-IN")}
          </p>
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

        <input
          name="pincode"
          value={address.pincode}
          onChange={handleChange}
          placeholder="Pincode"
        />
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