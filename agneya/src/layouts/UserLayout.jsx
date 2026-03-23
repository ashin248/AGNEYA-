import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../User/components/NavBar";
import { pageTransition } from "../shared/animations/framerVariants";
import "./UserLayout.css";

const UserLayout = () => {
  const location = useLocation();

  return (
    <div className="user-layout-container">
      <NavBar />
      <main className="user-main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UserLayout;