import axios from "axios";

const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  // baseURL: "/api",

  withCredentials: true, // important for cookies/session if backend uses them
});

//  Request Interceptor → Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

export const host = "ws://localhost:3000";
// export const host="https://ad.7billion.online"
// export const host = "/";


