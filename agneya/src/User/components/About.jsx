import React from "react";
import { motion } from "framer-motion";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/About.css";

function About() {
  // Animation Variants removed, using imported gravityScrollVariant
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        
        {/* Heading Animation */}
        <motion.div 
          className="about-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={gravityScrollVariant}
        >
          <h2>About Us</h2>
          <span className="about-underline"></span>
        </motion.div>

        <div className="about-content">
          
          {/* Text Content Animation */}
          <motion.div 
            className="about-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggeredGravityContainer}
          >
            <motion.h3 variants={gravityScrollVariant}>Agneya Story</motion.h3>
            
            <motion.p variants={gravityScrollVariant}>
              Agneya was established in 2026 with a mission to provide
              premium printing services using advanced digital and
              offset technology.
            </motion.p>

            <motion.p variants={gravityScrollVariant}>
              Our skilled team ensures precision, creativity, and
              customer satisfaction in every project. We serve
              corporate clients, educational institutions, retail
              businesses, and event organizers.
            </motion.p>

            <motion.div className="about-stats" variants={gravityScrollVariant}>
               <div className="stat-item">
                  <h4>100%</h4>
                  <p>Quality</p>
               </div>
               <div className="stat-item">
                  <h4>24/7</h4>
                  <p>Support</p>
               </div>
            </motion.div>
          </motion.div>

          {/* Image Animation with Hover Effect */}
          <motion.div 
            className="about-image"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={gravityScrollVariant}
          >
            <div className="image-frame">
              <img
                src="/Agneya_Creations.png"
                alt="Agneya Printing"
              />
              {/* Decorative element */}
              <div className="image-border-decoration"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default About;

