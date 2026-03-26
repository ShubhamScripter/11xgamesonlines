import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const ProtectedRoute = () => {
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();

  if (!token) {
    dispatch(logout()); // Clear any invalid session
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;