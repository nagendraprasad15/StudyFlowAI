import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Route protection wrapper. Restricts access to authenticated users.
 * Redirects anonymous routing attempts to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Loader size="lg" text="Verifying session credentials..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
