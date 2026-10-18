import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "hooks";

const InstallationRoute = ({ children }) => {
  const { storeId } = useAuth();
  const localStoreId = localStorage.getItem("store_id");

  // If store is already installed → redirect to dashboard
  if (storeId || localStoreId) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise → allow installation
  return children;
};

export default InstallationRoute;
