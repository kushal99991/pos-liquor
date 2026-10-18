import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
    Box,
    DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { setSurcharge } from "store/slice/cart.slice";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import SurchargeSidebar from "./components/SurchargeSidebar";
import StandardSurchargePanel from "./components/StandardSurchargePanel";
import CustomSurchargePanel from "./components/CustomSurchargePanel";
import MultiItemSurchargePanel from "./components/MultiItemSurchargePanel";
import MultiItemSurchargeDialog from "./components/MultiItemSurchargeDialog";

import { useGetSurchargeListQuery } from "services/surchargeSlice";

export default function SurchargeDialog({ open, onClose }) {
    const dispatch = useDispatch();
    const appliedSurcharge = useSelector((state) => state.cart.surcharge);
    const cartItems = useSelector((state) => state.cart.items);
    const { data: standardSurcharges = [] } = useGetSurchargeListQuery();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingSurcharge, setPendingSurcharge] = useState(null);
    const [selectedType, setSelectedType] = useState("standard");
    const [activeTab, setActiveTab] = useState("PERCENTAGE"); // 'PERCENTAGE' or 'AMOUNT'
    const [customValue, setCustomValue] = useState("0.00");
    const [selectedStandard, setSelectedStandard] = useState(null);

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showMultiItemDialog, setShowMultiItemDialog] = useState(false);
    const [multiItemSurchargeApplied, setMultiItemSurchargeApplied] = useState(false);

    useEffect(() => {
        if (!open) return;

        // Reset or load existing
        if (appliedSurcharge && appliedSurcharge.value > 0 && appliedSurcharge.type !== "multi_item") {
            // Since we don't store "standard vs custom" and "ID" in the simple surcharge state yet, 
            // we can try to guess or just default to Custom if we can't match it.
            // For now, let's just create a simple "Custom" view loaded with the value.
            // If we wanted full persistence of ID, we'd need to update the store again.
            // For this task, "like discount" implies UI structure.
            setSelectedType("custom");
            setActiveTab(appliedSurcharge.type || "PERCENTAGE");
            setCustomValue(String(appliedSurcharge.value));
        } else if (appliedSurcharge && appliedSurcharge.type === "multi_item") {
            setSelectedType("multi_item");
            setMultiItemSurchargeApplied(true);
            const itemIds = (appliedSurcharge.selectedItems || []).map(id => Number(id));
            setSelectedItems(new Set(itemIds));
        } else {
            setSelectedType("standard");
            setActiveTab("PERCENTAGE");
            setCustomValue("0.00");
            setSelectedStandard(null);
            setSelectedItems(new Set());
            setMultiItemSurchargeApplied(false);
        }
    }, [open, appliedSurcharge]);

    const handleNumberClick = (num) => {
        if (customValue === "0.00") {
            setCustomValue(num === "." ? "0." : num);
        } else {
            setCustomValue(customValue + num);
        }
    };

    const handleClear = () => setCustomValue("0.00");

    const handleBackspace = () => {
        if (customValue.length > 1) setCustomValue(customValue.slice(0, -1));
        else setCustomValue("0.00");
    };

    // Apply Custom Surcharge
    const handleApplyCustom = () => {
        const value = parseFloat(customValue);
        if (isNaN(value) || value <= 0) return;

        setPendingSurcharge({
            type: activeTab,
            value: value,
            name: "Custom Surcharge"
        });
        setConfirmOpen(true);
    };

    // Apply Standard Surcharge
    const handleApplyStandard = () => {
        if (!selectedStandard) return;
        setPendingSurcharge({
            type: selectedStandard.type,
            value: selectedStandard.value,
            name: selectedStandard.name
        });
        setConfirmOpen(true);
    }

    const toggleItem = (itemId) => {
        const newSelected = new Set(selectedItems);
        const id = Number(itemId);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedItems(newSelected);
    };

    const handleApplyMultiItem = () => {
        setShowMultiItemDialog(true);
    };

    const handleConfirmMultiItem = (data) => {
        // data = { value, mode }
        setPendingSurcharge({
            type: "multi_item",
            value: data.value,
            mode: data.mode,
            name: "Multi-Item Surcharge",
            selectedItems: Array.from(selectedItems)
        });
        setShowMultiItemDialog(false);
        setConfirmOpen(true);
    };

    const handleCancelMultiItem = () => {
        setSelectedItems(new Set());
        setMultiItemSurchargeApplied(false);
    }

    const handleRemove = () => {
        dispatch(setSurcharge({
            type: null,
            value: 0,
            amount: 0,
            selectedItems: [],
            mode: null,
        }));
        setCustomValue("0.00");
        setSelectedStandard(null);
        setSelectedItems(new Set());
        setMultiItemSurchargeApplied(false);
        onClose();
    };

    const handleConfirmApply = () => {
        if (!pendingSurcharge) return;
        dispatch(setSurcharge({
            type: pendingSurcharge.type,
            value: pendingSurcharge.value,
            amount: 0, // Will be calculated by common.js
            selectedItems: pendingSurcharge.selectedItems || [],
            mode: pendingSurcharge.mode || null
        }));
        setConfirmOpen(false);
        setPendingSurcharge(null);
        onClose();
    };

    const handleCancelConfirm = () => {
        setConfirmOpen(false);
        setPendingSurcharge(null);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: "85vh",
                        borderRadius: 0,
                        backgroundColor: "#e5e7eb",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: "#b91c1c",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                        Surcharge
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ display: "flex", padding: 0 }}>
                    <SurchargeSidebar
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                    />

                    <Box sx={{ flex: 1, backgroundColor: "white", overflow: "auto" }}>
                        {selectedType === "standard" && (
                            <StandardSurchargePanel
                                standardSurcharges={standardSurcharges}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                selectedSurcharge={selectedStandard}
                                setSelectedSurcharge={setSelectedStandard}
                                handleApply={handleApplyStandard}
                                handleRemove={handleRemove}
                                hasAppliedSurcharge={appliedSurcharge && appliedSurcharge.value > 0 && appliedSurcharge.type !== "multi_item"}
                            />
                        )}
                        {selectedType === "custom" && (
                            <CustomSurchargePanel
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                customValue={customValue}
                                handleNumberClick={handleNumberClick}
                                handleClear={handleClear}
                                handleBackspace={handleBackspace}
                                handleApply={handleApplyCustom}
                                handleRemove={handleRemove}
                                hasAppliedSurcharge={appliedSurcharge && appliedSurcharge.value > 0 && appliedSurcharge.type !== "multi_item"}
                            />
                        )}
                        {selectedType === "multi_item" && (
                            <MultiItemSurchargePanel
                                cartItems={cartItems}
                                selectedItems={selectedItems}
                                toggleItem={toggleItem}
                                multiItemSurchargeApplied={multiItemSurchargeApplied}
                                handleRemoveMultiItemSurcharge={handleRemove}
                                handleCancelMultiItem={handleCancelMultiItem}
                                handleApplyMultiItem={handleApplyMultiItem}
                                appliedSurcharge={appliedSurcharge}
                            />
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            <MultiItemSurchargeDialog
                open={showMultiItemDialog}
                onClose={() => setShowMultiItemDialog(false)}
                selectedItemsCount={selectedItems.size}
                onApply={handleConfirmMultiItem}
            />

            <ConfirmationDialog
                open={confirmOpen}
                title="Apply Surcharge"
                description={`Are you sure you want to apply ${pendingSurcharge?.name ? pendingSurcharge.name : ''} (${pendingSurcharge?.type === 'PERCENTAGE' ? `${pendingSurcharge?.value}%` : `$${pendingSurcharge?.value}`})?`}
                onConfirm={handleConfirmApply}
                onCancel={handleCancelConfirm}
            />
        </>
    );
}
