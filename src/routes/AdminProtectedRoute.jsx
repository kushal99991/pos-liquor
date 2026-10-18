import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "hooks";

const AdminProtectedRoute = ({ route }) => {
  const { isAdminLoggedIn } = useAuth();

  if (!isAdminLoggedIn) {
    return <Navigate to="/backoffice" replace />;
  }

  return route.Component ? <route.Component /> : null;
};

export default AdminProtectedRoute;







