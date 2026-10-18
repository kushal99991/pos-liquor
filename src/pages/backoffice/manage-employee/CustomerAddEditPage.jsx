import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerAddEditItemModal from "./CustomerAddEditItemModal";

const CustomerAddEditPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const mode = state?.mode === "edit" ? "edit" : "add";
    const selectedId = state?.selectedId;

    return (
        <CustomerAddEditItemModal
            open
            mode={mode}
            selectedId={selectedId}
            onClose={() => navigate(-1)}
        />
    );
};

export default CustomerAddEditPage;
