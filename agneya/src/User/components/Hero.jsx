import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/Hero.css";

function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Removed inline variants, using imported gravity variants instead
  return (
    <section className="hero-section" id="home">
      <div className="hero-bg-glow" />

      <motion.div
        className="hero-container"
        variants={staggeredGravityContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >

        <div className="hero-particles">
          {[...Array(6)].map((_, i) => <span key={i}></span>)}
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

          <Link to="/login">
            <motion.button
              className="primary-btn"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>

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



