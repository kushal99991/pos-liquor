import React from "react";
import { Navigate, Outlet } from "react-router-dom";


const AdminAuthenticatedRoute = ({ user, redirectPath = "/backoffice/dashboard" }) => {
  if (user) {
      return <Navigate to={redirectPath} replace />;
    }

  return <Outlet />;
};

export default AdminAuthenticatedRoute;
