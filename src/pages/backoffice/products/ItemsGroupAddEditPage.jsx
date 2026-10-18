import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductsAddEditItemGroupModal from "./ProductsAddEditItemGroupModal";

const ProductItemsGroupAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Determine mode and selected ID from navigation state
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.id ?? null;

  // Debug logging
  console.log("ItemsGroupAddEditPage - Location state:", {
    state,
    mode,
    selectedId,
    stateMode: state?.mode,
    stateId: state?.id,
  });

  return (
    <ProductsAddEditItemGroupModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default ProductItemsGroupAddEditPage;
