import axios from "axios";

const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  // baseURL: "/api",

  withCredentials: true, // important for cookies/session if backend uses them
});

// Persistent per-browser device fingerprint used to detect multi-accounting
// from a single device. Stored once and reused across sessions.
const getDeviceId = () => {
  try {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  } catch {
    return null;
  }
};

//  Request Interceptor → Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = getDeviceId();
    if (deviceId) {
      config.headers["x-device-id"] = deviceId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Response Interceptor → Auto logout if unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if user is trying to access protected routes
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/mybets', '/user/'];
      
      // Check if current path is a protected route
      const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
      
      // if (isProtectedRoute) {
      //   localStorage.removeItem("token");
      //   localStorage.removeItem("user");
      //   window.location.href = "/login";
      // }
      localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// WebSocket endpoint.
// - Explicit override: set VITE_WS_URL (e.g. wss://baajilive.com)
// - Production build: derive same-origin automatically (wss on https, ws on http)
// - Local dev: fall back to the local backend
export const host =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.PROD && typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
    : "ws://localhost:5000");


