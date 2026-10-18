import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductsAddEditItemModal from "./ProductsAddEditItemModal";

const ProductsItemsAddEditPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode === "edit" ? "edit" : "add";
  const selectedId = state?.id || null;

  return (
    <ProductsAddEditItemModal
      open
      mode={mode}
      selectedId={selectedId}
      onClose={() => navigate(-1)}
    />
  );
};

export default ProductsItemsAddEditPage;

