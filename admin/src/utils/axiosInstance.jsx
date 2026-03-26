import axios from 'axios';

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const axiosInstance = axios.create({
  // baseURL: 'https://cd06b49e12b2.ngrok-free.app/api',
   baseURL: 'http://localhost:3000/api',
  // baseURL:'https://7billion.online/api',

  // baseURL: "/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutHandler) {
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
