import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "hooks/useAuth";


const AuthenticatedRoute = ({ user, redirectPath = "/dashboard" }) => {
  if (user) {
      return <Navigate to={redirectPath} replace />;
    }

  return <Outlet />;
};

export default AuthenticatedRoute;
