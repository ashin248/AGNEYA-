// src/components/Hero.jsx (Updated Markup with Lightning and Sparks)
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import { useAuth } from "../../shared/context/AuthContext";
import "../style/Hero.css";

function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="hero-bg-glow" />

      {/* --- നിങ്ങൾ ആവശ്യപ്പെട്ട ഇടിവെട്ടും തീപ്പൊരിയും --- */}
      <div className="hero-lightning">
        {/* ഇടിവെട്ട് (Jagged lightning bolt) */}
        <div className="lightning-bolt"></div>
        {/* മിന്നൽ പിണർ (Lightning flash) */}
        <div className="lightning-flash"></div>
        {/* ഇടിവെട്ടിന്റെ അറ്റത്തെ തീപ്പൊരി (Spark at the strike point) */}
        <div className="lightning-spark"></div>
      </div>
      {/* ------------------------------------- */}

      <motion.div
        className="hero-container"
        variants={staggeredGravityContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="hero-background-elements">
          {/* Floating Particles */}
          <div className="hero-particles">
            {[...Array(6)].map((_, i) => <span key={i}></span>)}
          </div>

          {/* Gliding Birds */}
          <div className="hero-birds">
            <div className="bird bird-1"></div>
            <div className="bird bird-2"></div>
            <div className="bird bird-3"></div>
          </div>
        </div>

        <motion.div className="hero-badge" variants={gravityScrollVariant}>
          <span className="badge-dot"></span>
          <h5 className="hero-badge-Heading">Premium Printing Solutions</h5>
        </motion.div>

        <div className="hero-heading">
          <motion.h1 variants={gravityScrollVariant}>
            Elevate Your Brand with <br />
            <span className="brand-highlight">AGNEYA</span> <br />
            <span className="sub-heading">Precision in Every Print</span>
          </motion.h1>
        </div>

        <motion.div className="hero-description" variants={gravityScrollVariant}>
          <p>
            Experience the fusion of technology and creativity.
            From high-end commercial printing to custom branding
            solutions, we bring your visions to life with unmatched quality.
          </p>
        </motion.div>

        <motion.div className="hero-features" variants={gravityScrollVariant}>
          <span className="feature-item">✦ High-Speed</span>
          <span className="feature-item">✦ Custom Design</span>
          <span className="feature-item">✦ Global Delivery</span>
        </motion.div>

        <motion.div className="hero-actions" variants={gravityScrollVariant}>
          <Link to="/shop">
            <motion.button
              className="primary-btn"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Online
            </motion.button>
          </Link>

          {!isAuthenticated && (
            <Link to="/login">
              <motion.button
                className="primary-btn"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
          )}

          <motion.button
            className="secondary-btn"
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Get a Quote
          </motion.button>
        </motion.div>

      </motion.div>
    </section>
  );
}

export default Hero;











// // src/components/Hero.jsx
// import React, { useState, useEffect } from "react"; // Fixed import!
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
// import "../style/Hero.css";

// function Hero() {
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);

//   return (
//     <section className="hero-section" id="home">
//       <div className="hero-bg-glow" />

//       <motion.div
//         className="hero-container"
//         variants={staggeredGravityContainer}
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.2 }}
//       >

//         {/* --- Background Animations --- */}
//         <div className="hero-background-elements">
//           {/* Floating Particles */}
//           <div className="hero-particles">
//             {[...Array(6)].map((_, i) => <span key={i}></span>)}
//           </div>

//           {/* Gliding Birds */}
//           <div className="hero-birds">
//             <div className="bird bird-1"></div>
//             <div className="bird bird-2"></div>
//             <div className="bird bird-3"></div>
//           </div>
//         </div>
//         {/* --------------------------- */}

//         <motion.div className="hero-badge" variants={gravityScrollVariant}>
//           <span className="badge-dot"></span>
//           <h5 className="hero-badge-Heading">Premium Printing Solutions</h5>
//         </motion.div>

//         <div className="hero-heading">
//           <motion.h1 variants={gravityScrollVariant}>
//             Elevate Your Brand with <br />
//             <span className="brand-highlight">AGNEYA</span> <br />
//             <span className="sub-heading">Precision in Every Print</span>
//           </motion.h1>
//         </div>

//         <motion.div className="hero-description" variants={gravityScrollVariant}>
//           <p>
//             Experience the fusion of technology and creativity.
//             From high-end commercial printing to custom branding
//             solutions, we bring your visions to life with unmatched quality.
//           </p>
//         </motion.div>

//         <motion.div className="hero-features" variants={gravityScrollVariant}>
//           <span className="feature-item">✦ High-Speed</span>
//           <span className="feature-item">✦ Custom Design</span>
//           <span className="feature-item">✦ Global Delivery</span>
//         </motion.div>

//         <motion.div className="hero-actions" variants={gravityScrollVariant}>

//           <Link to="/shop">
//             <motion.button
//               className="primary-btn"
//               whileHover={{ scale: 1.05, y: -5 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Shop Online
//             </motion.button>
//           </Link>

//           <Link to="/login">
//             <motion.button
//               className="primary-btn"
//               whileHover={{ scale: 1.05, y: -5 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Login
//             </motion.button>
//           </Link>

//           {/* <motion.button
//             className="secondary-btn"
//             whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", y: -5 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Get a Quote
//           </motion.button> */}

//         </motion.div>

//       </motion.div>
//     </section>
//   );
// }

// export default Hero;






// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
// import "../style/Hero.css";

// function Hero() {
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);

//   // Removed inline variants, using imported gravity variants instead
//   return (
//     <section className="hero-section" id="home">
//       <div className="hero-bg-glow" />

//       <motion.div
//         className="hero-container"
//         variants={staggeredGravityContainer}
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.2 }}
//       >

//         <div className="hero-particles">
//           {[...Array(6)].map((_, i) => <span key={i}></span>)}
//         </div>

//         <motion.div className="hero-badge" variants={gravityScrollVariant}>
//           <span className="badge-dot"></span>
//           <h5 className="hero-badge-Heading">Premium Printing Solutions</h5>
//         </motion.div>

//         <div className="hero-heading">
//           <motion.h1 variants={gravityScrollVariant}>
//             Elevate Your Brand with <br />
//             <span className="brand-highlight">AGNEYA</span> <br />
//             <span className="sub-heading">Precision in Every Print</span>
//           </motion.h1>
//         </div>

//         <motion.div className="hero-description" variants={gravityScrollVariant}>
//           <p>
//             Experience the fusion of technology and creativity.
//             From high-end commercial printing to custom branding
//             solutions, we bring your visions to life with unmatched quality.
//           </p>
//         </motion.div>

//         <motion.div className="hero-features" variants={gravityScrollVariant}>
//           <span className="feature-item">✦ High-Speed</span>
//           <span className="feature-item">✦ Custom Design</span>
//           <span className="feature-item">✦ Global Delivery</span>
//         </motion.div>

//         <motion.div className="hero-actions" variants={gravityScrollVariant}>

//           <Link to="/shop">
//             <motion.button
//               className="primary-btn"
//               whileHover={{ scale: 1.05, y: -5 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Shop Online
//             </motion.button>
//           </Link>

//           <Link to="/login">
//             <motion.button
//               className="primary-btn"
//               whileHover={{ scale: 1.05, y: -5 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Login
//             </motion.button>
//           </Link>

//           <motion.button
//             className="secondary-btn"
//             whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", y: -5 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Get a Quote
//           </motion.button>

//         </motion.div>

//       </motion.div>
//     </section>
//   );
// }
// export default Hero;



