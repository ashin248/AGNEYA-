import React from "react";
import { motion } from "framer-motion";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/Contact.css";

function Contact() {
  // Removed local variants hooks, replacing with shared gravity variants
  return (
    <section className="contact-section" id="contact">
      <motion.div 
        className="contact-container"
        variants={staggeredGravityContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Contact Info Group */}
        <motion.div className="contact-info" variants={gravityScrollVariant}>
          <h3 className="section-subtitle">Get In Touch</h3>
          <div className="info-grid">
            <motion.a href="#" whileHover={{ x: 10 }} className="info-card">
              <div className="icon-box"><i className="bi bi-geo-alt-fill"></i></div>
              <div className="info-text">
                <span>Location</span>
                <p>123 Industrial Area, City Name</p>
              </div>
            </motion.a>

            <motion.a href="tel:+919876543210" whileHover={{ x: 10 }} className="info-card">
              <div className="icon-box"><i className="bi bi-telephone-fill"></i></div>
              <div className="info-text">
                <span>Phone</span>
                <p>+91-9876543210</p>
              </div>
            </motion.a>

            <motion.a href="mailto:info@agneya.com" whileHover={{ x: 10 }} className="info-card">
              <div className="icon-box"><i className="bi bi-envelope-fill"></i></div>
              <div className="info-text">
                <span>Email</span>
                <p>info@agneya.com</p>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Why Choose Group */}
        <motion.div className="why-choose-box" variants={gravityScrollVariant}>
          <h3 className="why-title">
            <i className="bi bi-shield-check"></i> Why Agneya?
          </h3>
          <ul className="why-list">
            {[
              "Reliable & On-Time Delivery",
              "Experienced Technical Team",
              "Affordable Bulk Pricing",
              "Strict Quality Control"
            ].map((text, i) => (
              <li key={i}>
                <i className="bi bi-check2-circle"></i> {text}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mission Group */}
        <motion.div className="mission-box" variants={gravityScrollVariant}>
          <div className="mission-card">
            <h3 className="mission-title">Our Mission</h3>
            <p>
              To provide innovative, cost-effective, and high-quality printing
              solutions that help businesses grow and communicate effectively.
            </p>
            <div className="mission-quote-icon">
              <i className="bi bi-quote"></i>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}

export default Contact;


