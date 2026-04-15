import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const auth = useAuth();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!auth?.isAdmin) {
    // Redirect non-admin users to home
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AdminRoute;
