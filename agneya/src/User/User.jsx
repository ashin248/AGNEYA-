import React from "react";
import "./style/User.css"; 

// Importing sub-components for the User landing page
import Hero from './components/Hero';
import Service from "./components/Service";
import About from './components/About';
import Contact from './components/Contact';

const User = () => {
  return (
    <main className="user-main-page">
      <Hero />  
      <Service />
      <About />
      <Contact />
    </main>
  );
}

export default User;