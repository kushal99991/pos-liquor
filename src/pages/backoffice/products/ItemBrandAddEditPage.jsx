import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemBrandAddEditModal from "./ItemBrandAddEditModal";

const ItemBrandAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.id || null;

  return (
    <ItemBrandAddEditModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default ItemBrandAddEditPage;

