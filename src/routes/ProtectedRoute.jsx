import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "hooks";

const ProtectedRoute = ({ route }) => {
  const { isLoggedIn } = useAuth();
  // const localStoreId = localStorage.getItem("store_id");

  if (!isLoggedIn) {
    return <Navigate to="/home" />;
  }
  // if (!storeId && !localStoreId) {
  //   return <Navigate to="/pos/install" replace />;
  // }

  return route.Component ? <route.Component /> : null;
};

export default ProtectedRoute;
