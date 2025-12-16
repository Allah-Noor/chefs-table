import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RouteGuard Component
 * Acts as a wrapper for protected routes.
 * It checks the authentication state; if the user is not logged in,
 * it redirects to the login page. Otherwise, it renders the requested content.
 */
const RouteGuard = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RouteGuard;