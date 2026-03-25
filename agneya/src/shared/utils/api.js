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
    req.url.includes("/api/products");
  
  // Use adminToken only for admin routes, otherwise use regular user token
  const token = isAdminRoute 
    ? (localStorage.getItem("adminToken") || localStorage.getItem("token"))
    : localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getImageUrl = (url) => {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://localhost:6060")) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6060';
    return url.replace("http://localhost:6060", backendUrl);
  }
  return url;
};

export default API;
