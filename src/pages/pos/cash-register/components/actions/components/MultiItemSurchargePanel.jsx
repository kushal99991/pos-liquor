import { Box, Button, ButtonBase, Typography } from "@mui/material";
import SurchargeSummaryBar from "./SurchargeSummaryBar";

export default function MultiItemSurchargePanel({
    cartItems,
    selectedItems,
    toggleItem,
    multiItemSurchargeApplied,
    handleRemoveMultiItemSurcharge,
    handleCancelMultiItem,
    handleApplyMultiItem, // This opens the dialog to enter value
    appliedSurcharge,
}) {

    // Calculate surcharge per item based on applied surcharge
    const calculateItemSurcharge = (item) => {
        if (!appliedSurcharge || appliedSurcharge.type !== "multi_item" || !multiItemSurchargeApplied) {
            return 0;
        }

        const itemId = item.id || item.item_id;
        const isSelected = appliedSurcharge.selectedItems?.some(selectedId =>
            Number(selectedId) === Number(itemId)
        );

        if (!isSelected) {
            return 0;
        }

        // Calculate surcharge based on appliedSurcharge
        const itemTotal = (item.sale_price || item.price || 0) * (item.quantity || 1);

        if (appliedSurcharge.mode === "PERCENTAGE" || appliedSurcharge.mode === "percentage") {
            return (itemTotal * appliedSurcharge.value) / 100;
        } else if (appliedSurcharge.mode === "AMOUNT" || appliedSurcharge.mode === "amount") {
            // For amount, surcharge.value is the total surcharge for all selected items
            // Need to calculate proportion for this item
            const selectedCartItems = cartItems.filter((cartItem) => {
                const cartItemId = cartItem.id || cartItem.item_id;
                return appliedSurcharge.selectedItems?.some(selectedId =>
                    Number(selectedId) === Number(cartItemId)
                );
            });
            const originalTotal = selectedCartItems.reduce(
                (sum, cartItem) => sum + (cartItem.sale_price || cartItem.price || 0) * (cartItem.quantity || 1),
                0
            );
            const proportion = originalTotal > 0 ? itemTotal / originalTotal : 0;
            return appliedSurcharge.value * proportion;
        }

        return 0;
    };

    // Calculate totals for the summary bar
    const calculateTotals = () => {
        let originalTotal = 0;
        let surchargeAmount = 0;
        let tax = 0;

        cartItems.forEach((item) => {
            const itemPriceQty = (item.sale_price || item.price || 0) * (item.quantity || 1);
            originalTotal += itemPriceQty;

            const itemSurchargeAmount = calculateItemSurcharge(item);
            surchargeAmount += itemSurchargeAmount;

            const surchargedTotal = itemPriceQty + itemSurchargeAmount;

            // Calculate tax on surcharged price
            if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0) {
                const totalTaxRate = item.taxes.reduce((sum, taxItem) => {
                    const rate = parseFloat(taxItem.rate) || 0;
                    return sum + rate;
                }, 0);
                tax += (surchargedTotal * totalTaxRate) / 100;
            }
        });

        const grandTotal = originalTotal + surchargeAmount + tax;

        return {
            originalTotal,
            surchargeAmount,
            tax,
            surchargeGrandTotal: grandTotal,
        };
    };

    const totals = calculateTotals();

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ backgroundColor: "#000", color: "white", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", p: 1, mb: 1, fontWeight: 600 }}>
                <Typography>ITEM NAME</Typography>
                <Typography textAlign="center">QTY</Typography>
                <Typography textAlign="center">ITEM PRICE</Typography>
                <Typography textAlign="center">SURCHARGE</Typography>
                <Typography textAlign="center">TAX</Typography>
                <Typography textAlign="right">TOTAL PRICE</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3, maxHeight: "400px", overflowY: "auto" }}>
                {cartItems.map((item) => {
                    const itemId = item.id || item.item_id;
                    const isSelected = selectedItems.has(Number(itemId));

                    // Calculate item price × quantity
                    const itemPriceQty = (item.sale_price || item.price || 0) * (item.quantity || 1);

                    // Calculate surcharge amount for this item
                    const itemSurchargeAmount = calculateItemSurcharge(item);

                    // Calculate surcharged total
                    const surchargedTotal = itemPriceQty + itemSurchargeAmount;

                    // Calculate tax on surcharged price
                    let itemTax = 0;
                    if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0) {
                        const totalTaxRate = item.taxes.reduce((sum, tax) => {
                            const rate = parseFloat(tax.rate) || 0;
                            return sum + rate;
                        }, 0);
                        // Tax calculated on surcharged total
                        itemTax = (surchargedTotal * totalTaxRate) / 100;
                    }

                    // Calculate total price = (ITEM PRICE * QTY) + SURCHARGE + TAX
                    const totalPrice = surchargedTotal + itemTax;

                    return (
                        <ButtonBase
                            key={itemId}
                            onClick={() => toggleItem(itemId)}
                            sx={{
                                border: isSelected ? "2px solid #b91c1c" : "1px solid #d1d5db",
                                backgroundColor: isSelected ? "#fef2f2" : "white",
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                p: 2,
                            }}
                        >
                            <Typography>{item.name}</Typography>
                            <Typography textAlign="center">{item.quantity?.toString().padStart(2, "0") || "01"}</Typography>
                            <Typography textAlign="center">${itemPriceQty.toFixed(2)}</Typography>
                            <Typography textAlign="center">${itemSurchargeAmount.toFixed(2)}</Typography>
                            <Typography textAlign="center">${itemTax.toFixed(2)}</Typography>
                            <Typography textAlign="right">${totalPrice.toFixed(2)}</Typography>
                        </ButtonBase>
                    );
                })}
            </Box>

            <SurchargeSummaryBar totals={totals} />

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}>
                <Button
                    onClick={handleRemoveMultiItemSurcharge}
                    disabled={!multiItemSurchargeApplied}
                    variant="contained"
                    sx={{
                        backgroundColor: multiItemSurchargeApplied ? "#000" : "#9ca3af",
                        color: "white",
                        fontWeight: 700,
                    }}
                >
                    REMOVE
                </Button>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button onClick={handleCancelMultiItem} variant="contained" sx={{ backgroundColor: "#374151", color: "white", fontWeight: 700 }}>
                        CANCEL SELECTION
                    </Button>

                    <Button
                        onClick={handleApplyMultiItem}
                        disabled={selectedItems.size === 0}
                        variant="contained"
                        sx={{
                            backgroundColor: selectedItems.size > 0 ? "#b91c1c" : "#9ca3af",
                            color: "white",
                            fontWeight: 700,
                            "&:hover": { backgroundColor: selectedItems.size > 0 ? "#991b1b" : "#9ca3af" }
                        }}
                    >
                        SELECT SURCHARGE
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
