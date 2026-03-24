// src/User.jsx
import React from "react";
import { motion } from "framer-motion";
import "./style/User.css"; 

import Hero from './components/Hero';
import Service from "./components/Service";
import About from './components/About';
import Contact from './components/Contact';

const SectionWrapper = ({ children }) => {
  return (
    <motion.div
      className="section-container"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const User = () => {
  return (
    <main className="user-main-page">
      <SectionWrapper><Hero /></SectionWrapper>
      <SectionWrapper><Service /></SectionWrapper>
      <SectionWrapper><About /></SectionWrapper>
      <SectionWrapper><Contact /></SectionWrapper>
    </main>
  );
}

export default User;



















// import React from "react";
// import "./style/User.css"; 

// // Importing sub-components for the User landing page
// import Hero from './components/Hero';
// import Service from "./components/Service";
// import About from './components/About';
// import Contact from './components/Contact';

// const User = () => {
//   return (
//     <main className="user-main-page">
//       <Hero />  
//       <Service />
//       <About />
//       <Contact />
//     </main>
//   );
// }

// export default User;