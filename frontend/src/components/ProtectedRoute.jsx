// import React from "react";
// import { useSelector } from "react-redux";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = () => {
//   const { user, token } = useSelector((state) => state.auth);

//   // If not logged in, redirect to /login
//   if (!user || !token) {
//     return <Navigate to="/login" replace />;
//   }

//   // If logged in, render the child route
//   return <Outlet />;
// };

// export default ProtectedRoute;

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // If no token, force logout (clear localStorage and Redux)
    if (!token) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  // If not logged in, redirect to /login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child route
  return <Outlet />;
};

export default ProtectedRoute;