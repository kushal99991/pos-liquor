import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DiscountAddEditModal from "./DiscountAddEditModal";

const DiscountAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.id || null;

  return (
    <DiscountAddEditModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default DiscountAddEditPage;

