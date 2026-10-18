import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InventoryAddEditModal from "./InventoryAddEditModal";

const InventoryAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "update" ? "update" : "add";
  const itemId = state?.id || null;

  console.log("InventoryAddEditPage - mode:", mode, "itemId:", itemId);

  return (
    <InventoryAddEditModal
      open
      mode={mode}
      itemId={itemId}
      onClose={() => navigate(-1)}
    />
  );
};

export default InventoryAddEditPage;
