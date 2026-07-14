import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasActiveSession, hasBusinessSession, readCurrentUser } from '../utils/currentUser';
import { canAccessAdminPanel, canAccessBusinessPanel, canAccessTravelPayAdmin, getAdminLandingPath } from '../utils/user';

const ProtectedRoute = ({ children, requireAdmin = false, requireBusiness = false, requireTravelPayAdmin = false }) => {
  const location = useLocation();
  const user = readCurrentUser();
  const isAuthenticated = hasActiveSession(user);
  const hasBusinessAccess = hasBusinessSession(user);

  if (requireBusiness && !hasBusinessAccess) {
    return <Navigate to="/business/login" replace />;
  }

  if (requireTravelPayAdmin && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !canAccessAdminPanel(user)) {
    return <Navigate to="/" replace />;
  }

  if (requireBusiness && !canAccessBusinessPanel(user)) {
    return <Navigate to="/business/login" replace />;
  }

  if (requireTravelPayAdmin && !canAccessTravelPayAdmin(user)) {
    return <Navigate to={canAccessBusinessPanel(user) ? getAdminLandingPath(user) : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
