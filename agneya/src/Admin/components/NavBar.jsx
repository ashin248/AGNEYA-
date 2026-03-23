// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "../style/nabBar.css"; 

// const AdminNavBar = ({ isOpen, setIsOpen }) => {
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: "orders", label: "Orders", path: "/admin", icon: <i className="bi bi-box-seam"></i> },
//     { id: "ready-upload", label: "Ready Products", path: "/admin/ready-upload", icon: <i className="bi bi-bag-plus"></i> },
//     { id: "custom-base", label: "Custom Bases", path: "/admin/custom-base", icon: <i className="bi bi-pencil-square"></i> },
//     { id: "analytics", label: "Analytics", path: "/admin/analytics", icon: <i className="bi bi-graph-up-arrow"></i> },
//   ];

//   const handleLogout = () => {
//     if (window.confirm("Do you want to logout from Admin Panel?")) {
//       localStorage.removeItem("adminToken");
//       localStorage.removeItem("isAdmin");
//       navigate("/admin/login", { replace: true });
//     }
//   };

//   return (
//     <aside className={`admin-sidebar ${isOpen ? "open" : "collapsed"}`}>
//       <div className="sidebar-header">
//         <h2 className="logo">
//           AGNEYA <span>Admin</span>
//         </h2>
//       </div>

//       <nav className="sidebar-nav">
//         <ul>
//           {menuItems.map((item) => (
//             <li key={item.id}>
//               <NavLink
//                 to={item.path}
//                 className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
//                 end={item.path === "/admin"}
//               >
//                 <span className="nav-icon">{item.icon}</span>
//                 <span className="nav-label">{item.label}</span>
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       <div className="sidebar-footer">
//         <button className="logout-button" onClick={handleLogout}>
//           <i className="bi bi-power"></i>
//           <span className="nav-label">Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default AdminNavBar;

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/NavBar.css";

const AdminNavBar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();


  // Navigation items using absolute paths for reliability
const menuItems = [
  { id: "dashboard", label: "Dashboard", path: "/admin", icon: <i className="bi bi-speedometer2"></i> },
  { id: "orders", label: "Orders", path: "/admin/orders", icon: <i className="bi bi-box-seam"></i> },
  { id: "ready-upload", label: "Ready Products", path: "/admin/ready-upload", icon: <i className="bi bi-bag-plus"></i> },
  { id: "custom-base", label: "Custom Bases", path: "/admin/custom-base", icon: <i className="bi bi-pencil-square"></i> },
  { id: "analytics", label: "Analytics", path: "/admin/analytics", icon: <i className="bi bi-graph-up-arrow"></i> },
];
  const handleLogout = () => {
    if (window.confirm("Do you want to logout from Admin Panel?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="logo">
          AGNEYA <span>Admin</span>
        </h2>
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <i className={`bi bi-chevron-${isOpen ? "left" : "right"}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                end={item.id === "dashboard"}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <i className="bi bi-power"></i>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNavBar;