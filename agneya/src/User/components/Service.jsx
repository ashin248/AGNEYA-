import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/Service.css";

const services = [
  { name: "Digital Printing", icon: "bi-printer" },
  { name: "Offset Printing", icon: "bi-layers" },
  { name: "Brochure & Catalog Printing", icon: "bi-book" },
  { name: "Business Cards & Letterheads", icon: "bi-person-vcard" },
  { name: "Label Printing", icon: "bi-tags" },
  // { name: "Acrylic Keychains & Photo Printing", icon: "bi-image" },
  { name: "Custom T-Shirt Printing", icon: "bi-palette" },
];

// Removed inline variants, using imported gravity variants instead

function Service() {
  return (
    <section className="service-section" id="service">
      <div className="service-container">
        
        {/* Animated Heading */}
        <motion.div
          className="service-heading"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Our Professional Services</h2>
          <motion.span
            className="service-underline"
            initial={{ width: 0 }}
            whileInView={{ width: 100 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Animated Grid */}
        <motion.div
          className="service-grid"
          variants={staggeredGravityContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((service, index) => (
            <motion.div
              className="service-card"
              key={index}
              variants={gravityScrollVariant}
              whileHover={{ 
                y: -12,
                transition: { duration: 0.3 }
              }}
            >
              <div className="card-shine" /> {/* Reflection effect */}
              
              <div className="icon-wrapper">
                <i className={`bi ${service.icon} service-icon`}></i>
              </div>

              <h5 className="service-title">{service.name}</h5>

              <Link to="/shop" className="service-link">
                <motion.button
                  className="service-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                  <span className="arrow">
                    <i className="bi bi-arrow-right-short"></i>
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export default Service;


