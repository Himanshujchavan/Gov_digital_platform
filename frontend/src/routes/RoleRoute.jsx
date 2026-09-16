import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDefaultDashboard } from '../utils/roleGuards';

export function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    // Redirect to their respective role dashboard
    return <Navigate to={getDefaultDashboard(user?.role)} replace />;
  }

  return children;
}
