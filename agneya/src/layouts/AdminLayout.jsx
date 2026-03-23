// src/Admin/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import AdminNavBar from "../Admin/components/NavBar"; // Your sidebar (NavBar.jsx)
import "./AdminSidebar.css"; // Your CSS file for layout/sidebar styling

import { motion, AnimatePresence } from "framer-motion";
import { pageTransition } from "../shared/animations/framerVariants";

const AdminLayout = () => {
  // Sidebar toggle state (open/close)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if user is authenticated as admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const location = useLocation();

  // Redirect to login if not admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Handle responsive sidebar (mobile vs desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false); // Mobile: collapsed by default
      } else {
        setIsSidebarOpen(true); // Desktop: open by default
      }
    };

    // Run on mount
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`admin-layout-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar (your AdminNavBar component) */}
      <AdminNavBar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main content area */}
      <main className="admin-main-content">
        {/* Inner wrapper for padding/max-width */}
        <div className="admin-content-inner">
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
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;





// // src/Admin/layouts/AdminLayout.jsx
// import React, { useState, useEffect } from "react";
// import { Outlet, Navigate, useLocation } from "react-router-dom";
// import AdminNavBar from "../Admin/components/NavBar"; // your sidebar component
// import "./AdminSidebar.css"; // your CSS file (create if missing)

// const AdminLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const location = useLocation();

//   // Check if admin is logged in (using localStorage flag)
//   const isAdmin = localStorage.getItem("isAdmin") === "true";

//   // Redirect to login if not authenticated
//   if (!isAdmin) {
//     return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
//   }

//   // Handle sidebar responsive behavior
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth <= 768) {
//         setIsSidebarOpen(false); // default close in mobile
//       } else {
//         setIsSidebarOpen(true); // open in desktop
//       }
//     };

//     // Initial check
//     handleResize();

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className={`admin-layout-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
//       {/* Sidebar (Admin Navigation) */}
//       <AdminNavBar 
//         isOpen={isSidebarOpen} 
//         setIsOpen={setIsSidebarOpen} 
//       />

//       {/* Main Content Area */}
//       <main className="admin-main-content">
//         <div className="admin-content-inner">
//           {/* All admin pages render here via Outlet */}
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminLayout;