import axios from 'axios';

const API = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:6060',
  withCredentials: true, 
});

// Automatically attach the JWT token from localStorage to every request
API.interceptors.request.use((req) => {
  const isAdminRoute = 
    req.url.includes("/api/admin") || 
    req.url.includes("/api/custom-orders") ||
    req.url.includes("/api/products") ||
    req.url.includes("/api/orders");
  
  // Use adminToken only for admin routes, otherwise use regular user token
  const token = isAdminRoute 
    ? (localStorage.getItem("adminToken") || localStorage.getItem("token"))
    : localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle global 401 errors (e.g. User no longer exists, Token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || "";
      if (msg.includes("User no longer exists") || msg.includes("token failed")) {
        console.warn("Session invalid - Logging out:", msg);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("isAdmin");
        
        // Only redirect if we are not already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (url) => {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://localhost:6060")) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6060';
    return url.replace("http://localhost:6060", backendUrl);
  }
  return url;
};

export default API;
