// src/User/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { staggeredGravityContainer, gravityScrollVariant } from "../../shared/animations/framerVariants";
import { useAuth } from "../../shared/context/AuthContext";
import "../style/NavBar.css";

// Import Logo Image
import Logo from "../../../public/Agneya_Creations.png";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout, loading } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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
    await logout();
    setMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Orders", href: "/my-orders" },
  ];

  if (loading) {
    return (
      <nav className="user-navbar">
        <div className="user-nav-container">
          <div className="user-logo">
            <img src={Logo} alt="Agneya Creations" className="agneyaLogo" />
          </div>
          <div style={{ color: "#fff" }}>Loading...</div>
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
        {/* Logo - Image Only */}
        <Link to="/" className="user-logo" onClick={() => setMenuOpen(false)}>
          <img src={Logo} alt="Agneya Creations" className="agneyaLogo" />
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

          {/* Mobile Login/Logout */}
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
          <Link to="/cart" className="user-nav-cart-btn" title="View Cart">
            <i className="bi bi-bag-heart"></i>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </Link>

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








// // src/User/components/NavBar.jsx
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, NavLink } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { staggeredGravityContainer, gravityScrollVariant } from "../../shared/animations/framerVariants";
// import { useAuth } from "../../shared/context/AuthContext";
// import "../style/NavBar.css";

// import Logo from '../../../public/Agneya_Creations.png'

// function NavBar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const navigate = useNavigate();
//   const { user, logout, loading } = useAuth();
//   const cartItems = useSelector((state) => state.cart.items);
//   const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

//   // Scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleLogout = async () => {
//     if (!window.confirm("Do you really want to logout?")) return;
//     await logout();
//     setMenuOpen(false);
//   };

//   const navLinks = [
//     { name: "Home", href: "/" },
//     { name: "Shop", href: "/shop" },
//     { name: "Orders", href: "/my-orders" },
//   ];

//   // Loading state (optional spinner or skeleton)
//   if (loading) {
//     return (
//       <nav className="user-navbar">
//         <div className="user-nav-container">
//           <div className="user-logo"><img src={Logo} alt="" className="agneyaLogo" /> </div>
//           <div>Loading...</div>
//         </div>
//       </nav>
//     );
//   }

//   return (
//     <motion.nav 
//       className={`user-navbar ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-active" : ""}`}
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ type: "spring", stiffness: 100, damping: 20 }}
//     >
//       <div className="user-nav-container">
        
//         {/* Logo */}
//         <Link to="/" className="user-logo" onClick={() => setMenuOpen(false)}>
//           AGNEYA<span className="accent-dot">.</span>
//         </Link>

//         {/* Navigation Links */}
//         <motion.ul 
//           className={`user-nav-links ${menuOpen ? "active" : ""}`}
//           variants={staggeredGravityContainer}
//           initial="hidden"
//           animate="visible"
//         >
//           {navLinks.map((item) => (
//             <motion.li key={item.name} className="user-nav-item" variants={gravityScrollVariant}>
//               <NavLink
//                 to={item.href}
//                 className={({ isActive }) => (isActive ? "user-nav-link active" : "user-nav-link")}
//                 onClick={() => setMenuOpen(false)}
//               >
//                 {item.name}
//               </NavLink>
//             </motion.li>
//           ))}

//           {/* Mobile-only Login/Logout */}
//           <motion.li className="user-nav-item mobile-only" variants={gravityScrollVariant}>
//             {user ? (
//               <button className="logout-btn-mob" onClick={handleLogout}>
//                 Logout
//               </button>
//             ) : (
//               <Link to="/login" className="login-btn-mob" onClick={() => setMenuOpen(false)}>
//                 Login
//               </Link>
//             )}
//           </motion.li>
//         </motion.ul>

//         {/* Desktop Actions */}
//         <motion.div 
//           className="user-nav-actions"
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.5 }}
//         >
//           <Link to="/cart" className="user-nav-cart-btn" title="View Cart">
//             <i className="bi bi-bag-heart"></i>
//             {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
//           </Link>

//           {user ? (
//             <div className="user-profile-nav desktop-only">
//               <span className="user-name-text">Hi, {user.fullName?.split(" ")[0] || "User"}</span>
//               <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
//                 <i className="bi bi-box-arrow-right"></i>
//               </button>
//             </div>
//           ) : (
//             <Link to="/login" className="login-link-desktop desktop-only">
//               Login / Register
//             </Link>
//           )}

//           {/* Hamburger Menu */}
//           <button
//             className={`hamburger ${menuOpen ? "active" : ""}`}
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle navigation"
//           >
//             <span className="line"></span>
//             <span className="line"></span>
//             <span className="line"></span>
//           </button>
//         </motion.div>
//       </div>
//     </motion.nav>
//   );
// }

// export default NavBar;
