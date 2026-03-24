// src/components/About.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
import "../style/About.css";

function About() {
  const [swimmingDirection, setSwimmingDirection] = useState('right');

  const handleSwimmingCycle = () => {
    setSwimmingDirection(prev => (prev === 'right' ? 'left' : 'right'));
  };

  // മത്സ്യങ്ങൾ അങ്ങോട്ടും ഇങ്ങോട്ടും നീങ്ങാനുള്ള Framer Motion Variants
  const fishVariants = {
    swimRight: { 
      x: "100vw", 
      transition: { duration: 25, ease: "linear" } 
    },
    swimLeft: { 
      x: "-100vw", 
      transition: { duration: 25, ease: "linear" } 
    }
  };

  return (
    <section className="about-section" id="about">
      {/* 🌊 UNDERWATER BACKGROUND 🌊 */}
      <div className="underwater-world">
        
        {/* താഴെ നിൽക്കുന്ന ചെടികൾ */}
        <div className="sea-plant plant-1"></div>
        <div className="sea-plant plant-2"></div>
        <div className="sea-plant plant-3"></div>
        <div className="sea-plant plant-4"></div>
        
        {/* കുമിളകൾ */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`sea-bubble bubble-${i + 1}`}></div>
        ))}

        {/* 🐟 മത്സ്യക്കൂട്ടം 🐟 */}
        <motion.div 
          className="fish-school-container"
          variants={fishVariants}
          initial={{ x: "-50vw" }}
          animate={swimmingDirection === 'right' ? 'swimRight' : 'swimLeft'}
          onAnimationComplete={handleSwimmingCycle}
        >
          <div className={`fish-school ${swimmingDirection}`}>
            
            {/* തിളങ്ങുന്ന "AGNEYA" പേര് ഒരു കൊടി പോലെ പാറാൻ */}
            <div className="brand-fish">
              {"AGNEYA".split("").map((char, index) => (
                <span 
                  key={index} 
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* ചെറിയ മത്സ്യങ്ങൾ */}
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="fish"
                animate={{ y: [0, -10, 0], x: [0, 15, 0] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        </motion.div>

      </div>

      <div className="about-container">
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

          <motion.div 
            className="about-image"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={gravityScrollVariant}
          >
            <div className="image-frame">
              <img src="/Agneya_Creations.png" alt="Agneya Printing" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;

// import React from "react";
// import { motion } from "framer-motion";
// import { gravityScrollVariant, staggeredGravityContainer } from "../../shared/animations/framerVariants";
// import "../style/About.css";

// function About() {
//   // Animation Variants removed, using imported gravityScrollVariant
//   return (
//     <section className="about-section" id="about">
//       <div className="about-container">
        
//         {/* Heading Animation */}
//         <motion.div 
//           className="about-heading"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.5 }}
//           variants={gravityScrollVariant}
//         >
//           <h2>About Us</h2>
//           <span className="about-underline"></span>
//         </motion.div>

//         <div className="about-content">
          
//           {/* Text Content Animation */}
//           <motion.div 
//             className="about-text"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={staggeredGravityContainer}
//           >
//             <motion.h3 variants={gravityScrollVariant}>Agneya Story</motion.h3>
            
//             <motion.p variants={gravityScrollVariant}>
//               Agneya was established in 2026 with a mission to provide
//               premium printing services using advanced digital and
//               offset technology.
//             </motion.p>

//             <motion.p variants={gravityScrollVariant}>
//               Our skilled team ensures precision, creativity, and
//               customer satisfaction in every project. We serve
//               corporate clients, educational institutions, retail
//               businesses, and event organizers.
//             </motion.p>

//             <motion.div className="about-stats" variants={gravityScrollVariant}>
//                <div className="stat-item">
//                   <h4>100%</h4>
//                   <p>Quality</p>
//                </div>
//                <div className="stat-item">
//                   <h4>24/7</h4>
//                   <p>Support</p>
//                </div>
//             </motion.div>
//           </motion.div>

//           {/* Image Animation with Hover Effect */}
//           <motion.div 
//             className="about-image"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={gravityScrollVariant}
//           >
//             <div className="image-frame">
//               <img
//                 src="/Agneya_Creations.png"
//                 alt="Agneya Printing"
//               />
//               {/* Decorative element */}
//               <div className="image-border-decoration"></div>
//             </div>
//           </motion.div>

//         </div>
//       </div>
//     </section>
//   );
// }

// export default About;

