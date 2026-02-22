/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'mentor' | 'mentee' | 'admin' | ('user' | 'mentor' | 'mentee' | 'admin')[];
}

/**
 * ProtectedRoute component
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if role doesn't match
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && state.user) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = rolesArray.includes(state.user.role as any);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

export default ProtectedRoute;
