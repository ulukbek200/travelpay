import React from 'react';
import { Navigate } from 'react-router-dom';
import { readCurrentUser } from '../utils/currentUser';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = readCurrentUser();
  const isAuthenticated = !!user?.isLoggedIn;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
