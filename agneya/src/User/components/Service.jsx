import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/Service.css";

const services = [
  { 
    name: "MUG PRINTING", 
    icon: "bi-cup-hot" 
  },
  { 
    name: "ACRYLIC PHOTOFRAMES", 
    icon: "bi-image" 
  },
  { 
    name: "Brochures & Catalog Printing", 
    icon: "bi-journal-text" 
  },
  { 
    name: "Business Cards & Letterheads", 
    icon: "bi-card-heading" 
  },
  { 
    name: "Label Printing", 
    icon: "bi-sticky" 
  },
  { 
    name: "Custom T-Shirt Printing", 
    icon: "bi-person-badge" 
  },
];



// const services = [
//   { name: "MUG PRINTING", icon: "bi-printer" },
//   { name: "ACRYLIC PHOTOFRAMES", icon: "bi-layers" },
//   { name: "Brochures & Catalog Printing", icon: "bi-book" },
//   { name: "Business Cards & Letterheads", icon: "bi-person-vcard" },
//   { name: "Label Printing", icon: "bi-tags" },
//   { name: "Custom T-Shirt Printing", icon: "bi-palette" },
// ];

function Service() {
  return (
    <>
      <section className="service-section" id="service">
        <div className="service-container">
          
          {/* Section Heading */}
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

          {/* Service Cards Grid */}
          <motion.div
            className="service-grid"
            variants={staggeredGravityContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {services.map((service, index) => (
              <motion.div 
                className="service-card-wrapper" 
                key={index} 
                variants={gravityScrollVariant}
              >
                <div className="hanging-thread">
                  <div className="nail"></div>
                </div>

                <div className="service-card">
                  <div className="card-shine" /> 
                  <div className="icon-wrapper">
                    <i className={`bi ${service.icon} service-icon`}></i>
                  </div>
                  <h5 className="service-title">{service.name}</h5>
                  <Link to="/shop" className="service-link">
                    <button className="service-btn">
                      shop new
                      <span className="arrow">
                        <i className="bi bi-arrow-right-short"></i>
                      </span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- DELIVERY JOURNEY ANIMATION SECTION --- */}
      <section className="delivery-journey-section">
        <div className="journey-container">
          {/* <h3 className="journey-title">The Agneya Delivery Journey</h3> */}
          
          <div className="journey-track-wrapper">
            <div className="journey-line"></div>
            
            <div className="journey-points">
              {/* Point 1: Factory */}
              <div className="point">
                <div className="icon-circle"><i className="bi bi-building-gear"></i></div>
                <span>Agneya Factory</span>
              </div>

              {/* Point 2: Hub / Post Office */}
              <div className="point">
                <div className="icon-circle"><i className="bi bi-mailbox"></i></div>
                <span>Hub Center</span>
              </div>

              {/* Point 3: Home */}
              <div className="point">
                <div className="icon-circle"><i className="bi bi-house-heart"></i></div>
                <span>Your Doorstep</span>
              </div>
            </div>

            {/* 🚚 Moving Van */}
            <div className="moving-van">
              <i className="bi bi-truck"></i>
              <div className="van-wheel-1"></div>
              <div className="van-wheel-2"></div>
            </div>

            {/* 📦 Dropping Parcel */}
            <div className="dropping-parcel">
              <i className="bi bi-box-seam"></i>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Service;


// // src/components/Service.jsx
// import React from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
// import "../style/Service.css";

// const services = [
//   { name: "Digital Printing", icon: "bi-printer" },
//   { name: "Offset Printing", icon: "bi-layers" },
//   { name: "Brochures & Catalog Printing", icon: "bi-book" },
//   { name: "Business Cards & Letterheads", icon: "bi-person-vcard" },
//   { name: "Label Printing", icon: "bi-tags" },
//   { name: "Custom T-Shirt Printing", icon: "bi-palette" },
// ];

// function Service() {
//   return (
//     <section className="service-section" id="service">
//       <div className="service-container">
        
//         {/* Animated Heading */}
//         <motion.div
//           className="service-heading"
//           initial={{ opacity: 0, y: -20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8 }}
//         >
//           <h2>Our Professional Services</h2>
//           <motion.span
//             className="service-underline"
//             initial={{ width: 0 }}
//             whileInView={{ width: 100 }}
//             transition={{ duration: 1, delay: 0.5 }}
//           />
//         </motion.div>

//         {/* Animated Grid */}
//         <motion.div
//           className="service-grid"
//           variants={staggeredGravityContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.2 }}
//         >
//           {services.map((service, index) => (
            
//             /* പുതിയ WRAPPER: നൂലും കാർഡും ഇതിനകത്താണ് */
//             <motion.div 
//               className="service-card-wrapper" 
//               key={index} 
//               variants={gravityScrollVariant}
//             >
              
//               {/* മുകളിൽ കെട്ടിത്തൂക്കുന്ന നൂലും ആണിയുo */}
//               <div className="hanging-thread">
//                 <div className="nail"></div>
//               </div>

//               {/* SERVICE CARD (Removed Framer Hover to let CSS handle the falling effect) */}
//               <div className="service-card">
//                 <div className="card-shine" /> 
                
//                 <div className="icon-wrapper">
//                   <i className={`bi ${service.icon} service-icon`}></i>
//                 </div>

//                 <h5 className="service-title">{service.name}</h5>

//                 <Link to="/shop" className="service-link">
//                   <button className="service-btn">
//                     View Details
//                     <span className="arrow">
//                       <i className="bi bi-arrow-right-short"></i>
//                     </span>
//                   </button>
//                 </Link>
//               </div>

//             </motion.div>
//           ))}
//         </motion.div>

//       </div>
//     </section>
//   );
// }

// export default Service;



// import React from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
// import "../style/Service.css";

// const services = [
//   { name: "Digital Printing", icon: "bi-printer" },
//   { name: "Offset Printing", icon: "bi-layers" },
//   { name: "Brochures & Catalog Printing", icon: "bi-book" },
//   { name: "Business Cards & Letterheads", icon: "bi-person-vcard" },
//   { name: "Label Printing", icon: "bi-tags" },
//   { name: "Custom T-Shirt Printing", icon: "bi-palette" },
// ];

// // Removed inline variants, using imported gravity variants instead

// function Service() {
//   return (
//     <section className="service-section" id="service">
//       <div className="service-container">
        
//         {/* Animated Heading */}
//         <motion.div
//           className="service-heading"
//           initial={{ opacity: 0, y: -20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8 }}
//         >
//           <h2>Our Professional Services</h2>
//           <motion.span
//             className="service-underline"
//             initial={{ width: 0 }}
//             whileInView={{ width: 100 }}
//             transition={{ duration: 1, delay: 0.5 }}
//           />
//         </motion.div>

//         {/* Animated Grid */}
//         <motion.div
//           className="service-grid"
//           variants={staggeredGravityContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.2 }}
//         >
//           {services.map((service, index) => (
//             <motion.div
//               className="service-card"
//               key={index}
//               variants={gravityScrollVariant}
//               whileHover={{ 
//                 y: -12,
//                 transition: { duration: 0.3 }
//               }}
//             >
//               <div className="card-shine" /> {/* Reflection effect */}
              
//               <div className="icon-wrapper">
//                 <i className={`bi ${service.icon} service-icon`}></i>
//               </div>

//               <h5 className="service-title">{service.name}</h5>

//               <Link to="/shop" className="service-link">
//                 <motion.button
//                   className="service-btn"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   View Details
//                   <span className="arrow">
//                     <i className="bi bi-arrow-right-short"></i>
//                   </span>
//                 </motion.button>
//               </Link>
//             </motion.div>
//           ))}
//         </motion.div>

//       </div>
//     </section>
//   );
// }

// export default Service;


