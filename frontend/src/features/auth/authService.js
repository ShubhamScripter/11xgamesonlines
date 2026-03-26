import api from "../../utils/axiosConfig";

//  Login user
const login = async (userData) => {
  const response = await api.post("/auth/userlogin", userData);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

//  Register user
const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

//  Logout user
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

//change password 
const changePassword = async (userId, passwordData) => {
  const response = await api.put(`/users/change-password/${userId}`, passwordData);
  return response.data;
};

const authService = { login, register, logout, changePassword };
export default authService;
