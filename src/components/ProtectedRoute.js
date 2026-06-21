import React from 'react';
import { Navigate } from 'react-router-dom';
import { readCurrentUser } from '../utils/currentUser';
import { canAccessAdminPanel, canAccessBusinessPanel, canAccessTravelPayAdmin } from '../utils/user';

const ProtectedRoute = ({ children, requireAdmin = false, requireBusiness = false, requireTravelPayAdmin = false }) => {
  const user = readCurrentUser();
  const isAuthenticated = !!user?.isLoggedIn;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !canAccessAdminPanel(user)) {
    return <Navigate to="/" replace />;
  }

  if (requireBusiness && !canAccessBusinessPanel(user)) {
    return <Navigate to="/business/login" replace />;
  }

  if (requireTravelPayAdmin && !canAccessTravelPayAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
