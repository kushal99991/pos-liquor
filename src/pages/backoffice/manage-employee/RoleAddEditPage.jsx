import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackOfficeAddEditItemModal from "./BackOfficeAddEditItemModal";

const RoleAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.selectedId;

  return (
    <BackOfficeAddEditItemModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default RoleAddEditPage;






