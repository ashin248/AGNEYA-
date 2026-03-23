import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../shared/utils/api";
import "../style/login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    fullName: "",
    mobile: "",
    addressLine: "",
    city: "",
    landmark: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendOTP = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      return setErrorMsg("Please enter a valid email address");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await API.post("/api/auth/send-otp", { email: formData.email.trim() });
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length < 4) {
      return setErrorMsg("Please enter a valid OTP");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/api/auth/verify-otp", {
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token); // ← assuming backend returns token
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect to intended page (from modal click)
        const redirectData = localStorage.getItem("redirectAfterLogin");
        let redirectPath = "/shop";
        let redirectState = null;

        if (redirectData) {
          const { path, state } = JSON.parse(redirectData);
          redirectPath = path;
          redirectState = state;
          localStorage.removeItem("redirectAfterLogin");
        } else if (location.state?.from) {
          redirectPath = location.state.from;
        }

        navigate(redirectPath, { state: redirectState, replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.landmark?.trim()) {
      return setErrorMsg("Landmark is mandatory");
    }
    if (!formData.fullName?.trim() || !formData.mobile?.trim()) {
      return setErrorMsg("Name and Mobile number are required");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        addressLine: formData.addressLine?.trim() || "",
        city: formData.city?.trim() || "",
        landmark: formData.landmark.trim(),
        pincode: formData.pincode?.trim() || "",
      };

      const res = await API.post("/api/auth/complete-registration", payload);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token); // ← if backend returns token
        localStorage.setItem("user", JSON.stringify(res.data.user));

        const redirectData = localStorage.getItem("redirectAfterLogin");
        let redirectPath = "/shop";
        let redirectState = null;

        if (redirectData) {
          const { path, state } = JSON.parse(redirectData);
          redirectPath = path;
          redirectState = state;
          localStorage.removeItem("redirectAfterLogin");
        }

        navigate(redirectPath, { state: redirectState, replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          <motion.h2
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1
              ? "Login / Register"
              : step === 2
              ? "Verify OTP"
              : "Complete Your Profile"}
          </motion.h2>
        </AnimatePresence>

        {errorMsg && (
          <p className="error-text" style={{ color: "red", marginBottom: "1rem" }}>
            {errorMsg}
          </p>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <motion.div 
            className="step-box"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <label>Email (Google ID preferred)</label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
            <button onClick={sendOTP} disabled={loading || !formData.email}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </motion.div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <motion.div 
             className="step-box"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <div className="success-badge">✅ Email Sent to {formData.email}</div>
            <label>Enter 6-digit OTP</label>
            <input
              name="otp"
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
              maxLength={6}
              autoFocus
            />
            <button onClick={verifyOTP} disabled={loading || !formData.otp}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </motion.div>
        )}

        {/* Step 3: Profile Completion */}
        {step === 3 && (
          <motion.div 
            className="step-box address-grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <div className="success-badge">✅ Email Verified</div>

            <input
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="mobile"
              placeholder="Mobile Number *"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
            <input
              name="addressLine"
              placeholder="House No, Street, Area"
              value={formData.addressLine}
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="City / Town *"
              value={formData.city}
              onChange={handleChange}
            />
            <input
              name="landmark"
              placeholder="Landmark (Mandatory) *"
              value={formData.landmark}
              onChange={handleChange}
              className="required-input"
              required
            />
            <input
              name="pincode"
              placeholder="PIN Code"
              value={formData.pincode}
              onChange={handleChange}
            />

            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Saving..." : "Complete Registration"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;







// // src/components/login.jsx (or wherever you place it)
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../../shared/utils/api";
// import "../style/login.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: profile
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const [formData, setFormData] = useState({
//     email: "",
//     otp: "",
//     fullName: "",
//     mobile: "",
//     addressLine: "",
//     city: "",
//     landmark: "",
//     pincode: "",
//   });

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   // Step 1: Send OTP to email
//   const sendOTP = async () => {
//     if (!formData.email || !formData.email.includes("@")) {
//       return setErrorMsg("Please enter a valid email address");
//     }

//     setLoading(true);
//     setErrorMsg("");

//     try {
//       await API.post("/api/auth/send-otp", { email: formData.email.trim() });
//       setStep(2);
//     } catch (err) {
//       setErrorMsg(
//         err.response?.data?.message || "Failed to send OTP. Try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const verifyOTP = async () => {
//     if (!formData.otp || formData.otp.length < 4) {
//       return setErrorMsg("Please enter a valid OTP");
//     }

//     setLoading(true);
//     setErrorMsg("");

//     try {
//       const res = await API.post("/api/auth/verify-otp", {
//         email: formData.email.trim(),
//         otp: formData.otp.trim(),
//       });

//       if (res.data.success) {
//         // If profile already complete → direct login
//         if (res.data.user?.profileComplete) {
//           localStorage.setItem("user", JSON.stringify(res.data.user));
//           const from = location.state?.from || "/shop";
//           navigate(from, { replace: true });
//         } else {
//           setStep(3);
//         }
//       }
//     } catch (err) {
//       setErrorMsg(
//         err.response?.data?.message || "Invalid OTP. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 3: Complete profile & register
//   const handleFinalSubmit = async () => {
//     if (!formData.landmark?.trim()) {
//       return setErrorMsg("Landmark is mandatory");
//     }
//     if (!formData.fullName?.trim() || !formData.mobile?.trim()) {
//       return setErrorMsg("Name and Mobile number are required");
//     }

//     setLoading(true);
//     setErrorMsg("");

//     try {
//       const payload = {
//         email: formData.email.trim(),
//         fullName: formData.fullName.trim(),
//         mobile: formData.mobile.trim(),
//         addressLine: formData.addressLine?.trim() || "",
//         city: formData.city?.trim() || "",
//         landmark: formData.landmark.trim(),
//         pincode: formData.pincode?.trim() || "",
//       };

//       const res = await API.post("/api/auth/complete-registration", payload);
//       // Login.jsx (verifyOTP / completeRegistration success)
//       if (res.data.success) {
//         localStorage.setItem("user", JSON.stringify(res.data.user)); // session data store
//         // if no token, session is enough
//         const from = location.state?.from || "/shop";
//         navigate(from, { replace: true });
//       }
//       // if (res.data.success) {
//       //   localStorage.setItem("user", JSON.stringify(res.data.user));

//       //   // Redirect to the page user originally tried to access (or default to shop)
//       //   const from = location.state?.from || "/shop";
//       //   navigate(from, { replace: true });
//       // }
//     } catch (err) {
//       setErrorMsg(
//         err.response?.data?.message || "Registration failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h2>
//           {step === 1
//             ? "Login / Register"
//             : step === 2
//               ? "Verify OTP"
//               : "Complete Your Profile"}
//         </h2>

//         {errorMsg && (
//           <p className="error-text" style={{ color: "red", marginBottom: "1rem" }}>
//             {errorMsg}
//           </p>
//         )}

//         {/* Step 1: Email */}
//         {step === 1 && (
//           <div className="step-box">
//             <label>Email (Google ID preferred)</label>
//             <input
//               name="email"
//               type="email"
//               placeholder="example@gmail.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               autoFocus
//             />
//             <button onClick={sendOTP} disabled={loading || !formData.email}>
//               {loading ? "Sending..." : "Send OTP"}
//             </button>
//           </div>
//         )}

//         {/* Step 2: OTP */}
//         {step === 2 && (
//           <div className="step-box">
//             <div className="success-badge">✅ Email Sent to {formData.email}</div>
//             <label>Enter 6-digit OTP</label>
//             <input
//               name="otp"
//               type="text"
//               placeholder="Enter OTP"
//               value={formData.otp}
//               onChange={handleChange}
//               required
//               maxLength={6}
//               autoFocus
//             />
//             <button onClick={verifyOTP} disabled={loading || !formData.otp}>
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </div>
//         )}

//         {/* Step 3: Profile Completion */}
//         {step === 3 && (
//           <div className="step-box address-grid">
//             <div className="success-badge">✅ Email Verified</div>

//             <input
//               name="fullName"
//               placeholder="Full Name *"
//               value={formData.fullName}
//               onChange={handleChange}
//               required
//             />
//             <input
//               name="mobile"
//               placeholder="Mobile Number *"
//               value={formData.mobile}
//               onChange={handleChange}
//               required
//             />
//             <input
//               name="addressLine"
//               placeholder="House No, Street, Area"
//               value={formData.addressLine}
//               onChange={handleChange}
//             />
//             <input
//               name="city"
//               placeholder="City / Town *"
//               value={formData.city}
//               onChange={handleChange}
//             />
//             <input
//               name="landmark"
//               placeholder="Landmark (Mandatory) *"
//               value={formData.landmark}
//               onChange={handleChange}
//               className="required-input"
//               required
//             />
//             <input
//               name="pincode"
//               placeholder="PIN Code"
//               value={formData.pincode}
//               onChange={handleChange}
//             />

//             <button
//               onClick={handleFinalSubmit}
//               disabled={loading}
//               className="primary-btn"
//             >
//               {loading ? "Saving..." : "Complete Registration"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;