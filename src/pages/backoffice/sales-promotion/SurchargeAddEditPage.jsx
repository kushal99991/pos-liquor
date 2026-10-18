import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SurchargeAddEditModal from "./SurchargeAddEditModal";

const SurchargeAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.id || null;

  return (
    <SurchargeAddEditModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default SurchargeAddEditPage;

