import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeAddEditItemModal from "./EmployeeAddEditItemModal";

const EmployeeAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.selectedId;

  return (
    <EmployeeAddEditItemModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default EmployeeAddEditPage;

