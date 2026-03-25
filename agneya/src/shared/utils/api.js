import axios from 'axios';

const API = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:6060',
  withCredentials: true, 
});

// Automatically attach the JWT token from localStorage to every request
API.interceptors.request.use((req) => {
  // Check for adminToken first, then regular token
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
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
