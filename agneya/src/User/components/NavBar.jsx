
// src/User/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { staggeredGravityContainer, gravityScrollVariant } from "../../shared/animations/framerVariants";
import API from "../../shared/utils/api"; // your axios instance
import "../style/NavBar.css";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Load user from backend session (express-session)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await API.get("/api/auth/me"); // gets current session user from backend
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          // Optional: save to localStorage (for faster initial load)
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();

    // Re-check when storage changes (multi-tab support)
    window.addEventListener("storage", fetchCurrentUser);
    return () => window.removeEventListener("storage", fetchCurrentUser);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Do you really want to logout?")) return;

    try {
      await API.post("/api/auth/logout"); // destroy backend session
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
      setMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback: clear in frontend
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Orders", href: "/my-orders" },
  ];

  // Loading state (optional spinner or skeleton)
  if (loadingUser) {
    return (
      <nav className="user-navbar">
        <div className="user-nav-container">
          <div className="user-logo">AGNEYA<span className="accent-dot">.</span></div>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav 
      className={`user-navbar ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-active" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="user-nav-container">
        
        {/* Logo */}
        <Link to="/" className="user-logo" onClick={() => setMenuOpen(false)}>
          AGNEYA<span className="accent-dot">.</span>
        </Link>

        {/* Navigation Links */}
        <motion.ul 
          className={`user-nav-links ${menuOpen ? "active" : ""}`}
          variants={staggeredGravityContainer}
          initial="hidden"
          animate="visible"
        >
          {navLinks.map((item) => (
            <motion.li key={item.name} className="user-nav-item" variants={gravityScrollVariant}>
              <NavLink
                to={item.href}
                className={({ isActive }) => (isActive ? "user-nav-link active" : "user-nav-link")}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            </motion.li>
          ))}

          {/* Mobile-only Login/Logout */}
          <motion.li className="user-nav-item mobile-only" variants={gravityScrollVariant}>
            {user ? (
              <button className="logout-btn-mob" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="login-btn-mob" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </motion.li>
        </motion.ul>

        {/* Desktop Actions */}
        <motion.div 
          className="user-nav-actions"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {user ? (
            <div className="user-profile-nav desktop-only">
              <span className="user-name-text">Hi, {user.fullName?.split(" ")[0] || "User"}</span>
              <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link-desktop desktop-only">
              Login / Register
            </Link>
          )}

          {/* Hamburger Menu */}
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default NavBar;






// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, NavLink } from "react-router-dom";
// import "../style/NavBar.css";

// function NavBar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch (e) {
//         localStorage.removeItem("user");
//       }
//     }

//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleLogout = () => {
//     if (window.confirm("Logout")) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       setUser(null);
//       navigate("/login");
//       setMenuOpen(false);
//     }
//   };

//   const navLinks = [
//     { name: "Home", href: "/" },
//     { name: "Shop", href: "/shop" },
//     { name: "Orders", href: "/my-orders" },
//   ];

//   return (
//     <nav className={`navbar ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-active" : ""}`}>
//       <div className="navbar-container">
        
//         {/* Logo Section */}
//         <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
//           AGNEYA<span className="gold-dot">.</span>
//         </Link>

//         {/* Navigation Links */}
//         <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
//           {navLinks.map((item) => (
//             <li key={item.name} className="nav-item">
//               <NavLink 
//                 to={item.href} 
//                 className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
//                 onClick={() => setMenuOpen(false)}
//               >
//                 {item.name}
//               </NavLink>
//             </li>
//           ))}
          
//           {/* Mobile Only Login/Logout */}
//           <li className="nav-item mobile-only">
//             {user ? (
//               <button className="logout-btn-mob" onClick={handleLogout}>Logout</button>
//             ) : (
//               <Link to="/login" className="login-btn-mob" onClick={() => setMenuOpen(false)}>
//                 Login
//               </Link>
//             )}
//           </li>
//         </ul>

//         {/* Desktop Actions */}
//         <div className="nav-actions">
//           {user ? (
//             <div className="user-profile-nav desktop-only">
//               <span className="user-name-text">Hi, {user.fullName?.split(" ")[0] || "User"}</span>
//               <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
//                 <i className="bi bi-box-arrow-right"></i>
//               </button>
//             </div>
//           ) : (
//             <Link to="/login" className="login-link-desktop desktop-only">Login / Register</Link>
//           )}

//           {/* Hamburger Menu Icon */}
//           <button 
//             className={`hamburger ${menuOpen ? "active" : ""}`} 
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle navigation"
//           >
//             <span className="line"></span>
//             <span className="line"></span>
//             <span className="line"></span>
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default NavBar;