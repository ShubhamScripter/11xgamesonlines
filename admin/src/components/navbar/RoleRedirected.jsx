// src/components/RoleRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Update path if needed

const roleToPath = {
  admin: "/",
  subadmin: "/sub_admin",
  seniorSuper: "/senior_super",
  superAgent: "/super_agent",
  agent: "/agent",
};

const RoleRedirect = () => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return <Navigate to="/admin/login" replace />;
  }

  const path = roleToPath[user.role] || "/admin/login";
  return <Navigate to={path} replace />;
};

export default RoleRedirect;
