
// src/User/pages/login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../shared/utils/api";
import "../style/login.css";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: email → 2: OTP → 3: profile completion
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setErrorMsg("");
  };

  // Step 1: Send OTP
  const sendOTP = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/api/auth/send-otp", { email: formData.email });

      if (res.data.success) {
        setSuccessMsg("OTP sent to your email!");
        setStep(2);
      } else {
        setErrorMsg(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      if (res.data.success) {
        if (!res.data.user.profileComplete) {
          // New user → go to profile completion
          setStep(3);
        } else {
          // Existing user → login success
          localStorage.setItem("token", res.data.token);
          navigate(location.state?.from || "/");
        }
      } else {
        setErrorMsg(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete profile (new users)
  const handleFinalSubmit = async () => {
    const requiredFields = ["fullName", "mobile", "addressLine", "city", "landmark"];
    const missing = requiredFields.find((field) => !formData[field]?.trim());

    if (missing) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      setErrorMsg("PIN code should be 6 digits");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await API.post("/api/auth/complete-profile", {
        email: formData.email,
        fullName: formData.fullName,
        mobile: formData.mobile,
        address: {
          addressLine: formData.addressLine,
          city: formData.city,
          landmark: formData.landmark,
          pincode: formData.pincode,
        },
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate(location.state?.from || "/");
      } else {
        setErrorMsg(res.data.message || "Profile completion failed");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-header">
          <h1 className="login-title">
            {step === 1 ? "Welcome Back" : step === 2 ? "Verify OTP" : "Complete Your Profile"}
          </h1>
          <p className="login-subtitle">
            {step === 1
              ? "Enter your email to continue"
              : step === 2
              ? `We sent a code to ${formData.email}`
              : "Please fill your details to finish setup"}
          </p>
        </div>

        {/* Step dots */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}></div>
          <div className={`step-dot ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}></div>
          <div className={`step-dot ${step >= 3 ? "active" : ""}`}></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
          >
            {step === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="yourname@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                    required
                  />
                </div>

                {errorMsg && <div className="error-message">{errorMsg}</div>}
                {successMsg && <div className="success-message">{successMsg}</div>}

                <button
                  onClick={sendOTP}
                  disabled={loading || !formData.email}
                  className="primary-btn"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    placeholder="______"
                    value={formData.otp}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleChange(e);
                      }
                    }}
                    className="otp-input"
                    autoFocus
                  />
                </div>

                {errorMsg && <div className="error-message">{errorMsg}</div>}

                <button
                  onClick={verifyOTP}
                  disabled={loading || formData.otp.length !== 6}
                  className="primary-btn"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>

                <div className="back-link" onClick={goBack}>
                  ← Change email
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    name="mobile"
                    type="tel"
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={(e) => {
                      if (/^\d{0,10}$/.test(e.target.value)) handleChange(e);
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line *</label>
                  <input
                    name="addressLine"
                    placeholder="House name, street, area"
                    value={formData.addressLine}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City / Town *</label>
                  <input
                    name="city"
                    placeholder="Kochi / Thiruvananthapuram"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Landmark *</label>
                  <input
                    name="landmark"
                    placeholder="Near metro station / temple"
                    value={formData.landmark}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    name="pincode"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit PIN"
                    value={formData.pincode}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) handleChange(e);
                    }}
                  />
                </div>

                {errorMsg && <div className="error-message">{errorMsg}</div>}

                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="primary-btn"
                >
                  {loading ? "Saving..." : "Complete Registration"}
                </button>

                <div className="back-link" onClick={goBack}>
                  ← Back to OTP
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;




// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../shared/utils/api";
// import "../style/login.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [step, setStep] = useState(1);
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
//       setErrorMsg(err.response?.data?.message || "Failed to send OTP. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

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
//         localStorage.setItem("token", res.data.token); // ← assuming backend returns token
//         localStorage.setItem("user", JSON.stringify(res.data.user));

//         // Redirect to intended page (from modal click)
//         const redirectData = localStorage.getItem("redirectAfterLogin");
//         let redirectPath = "/shop";
//         let redirectState = null;

//         if (redirectData) {
//           const { path, state } = JSON.parse(redirectData);
//           redirectPath = path;
//           redirectState = state;
//           localStorage.removeItem("redirectAfterLogin");
//         } else if (location.state?.from) {
//           redirectPath = location.state.from;
//         }

//         navigate(redirectPath, { state: redirectState, replace: true });
//       }
//     } catch (err) {
//       setErrorMsg(err.response?.data?.message || "Invalid OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

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

//       if (res.data.success) {
//         localStorage.setItem("token", res.data.token); // ← if backend returns token
//         localStorage.setItem("user", JSON.stringify(res.data.user));

//         const redirectData = localStorage.getItem("redirectAfterLogin");
//         let redirectPath = "/shop";
//         let redirectState = null;

//         if (redirectData) {
//           const { path, state } = JSON.parse(redirectData);
//           redirectPath = path;
//           redirectState = state;
//           localStorage.removeItem("redirectAfterLogin");
//         }

//         navigate(redirectPath, { state: redirectState, replace: true });
//       }
//     } catch (err) {
//       setErrorMsg(err.response?.data?.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <motion.div 
//         className="login-card"
//         initial={{ opacity: 0, scale: 0.9, y: 30 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.h2
//             key={step}
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {step === 1
//               ? "Login / Register"
//               : step === 2
//               ? "Verify OTP"
//               : "Complete Your Profile"}
//           </motion.h2>
//         </AnimatePresence>

//         {errorMsg && (
//           <p className="error-text" style={{ color: "red", marginBottom: "1rem" }}>
//             {errorMsg}
//           </p>
//         )}

//         {/* Step 1: Email */}
//         {step === 1 && (
//           <motion.div 
//             className="step-box"
//              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//           >
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
//           </motion.div>
//         )}

//         {/* Step 2: OTP */}
//         {step === 2 && (
//           <motion.div 
//              className="step-box"
//              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//           >
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
//           </motion.div>
//         )}

//         {/* Step 3: Profile Completion */}
//         {step === 3 && (
//           <motion.div 
//             className="step-box address-grid"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//           >
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
//           </motion.div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default Login;







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