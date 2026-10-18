import { Box, Button, ButtonBase, Typography } from "@mui/material";
import DiscountSummaryBar from "./DiscountSummaryBar";

export default function MultiItemDiscountPanel({
  cartItems,
  selectedItems,
  toggleItem,
  totals,
  multiItemDiscountsApplied,
  handleRemoveMultiItemDiscount,
  handleCancelMultiItem,
  handleApplyMultiItem,
  handleSelectDiscount,
  appliedDiscount,
}) {
  // Calculate discount per item based on applied discount
  const calculateItemDiscount = (item) => {
    if (!appliedDiscount || appliedDiscount.discount_type !== "multi_item" || !multiItemDiscountsApplied) {
      return 0;
    }

    const itemId = item.id || item.item_id;
    const isSelected = appliedDiscount.selectedItems?.some(selectedId => 
      Number(selectedId) === Number(itemId)
    );

    if (!isSelected) {
      return 0;
    }

    // Get discount from item.discount if available, otherwise calculate from appliedDiscount
    if (item.discount !== undefined) {
      return item.discount || 0;
    }

    // Calculate discount based on appliedDiscount
    const itemTotal = (item.sale_price || item.price || 0) * (item.quantity || 1);
    
    if (appliedDiscount.discount_mode === "percentage") {
      return (itemTotal * appliedDiscount.discount_value) / 100;
    } else if (appliedDiscount.discount_mode === "amount") {
      // For amount, discount_value is the total discount for all selected items
      // Need to calculate proportion for this item
      const selectedCartItems = cartItems.filter((cartItem) => {
        const cartItemId = cartItem.id || cartItem.item_id;
        return appliedDiscount.selectedItems?.some(selectedId => 
          Number(selectedId) === Number(cartItemId)
        );
      });
      const originalTotal = selectedCartItems.reduce(
        (sum, cartItem) => sum + (cartItem.sale_price || cartItem.price || 0) * (cartItem.quantity || 1),
        0
      );
      const proportion = originalTotal > 0 ? itemTotal / originalTotal : 0;
      return appliedDiscount.discount_value * proportion;
    }

    return 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: "#000", color: "white", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", p: 1, mb: 1, fontWeight: 600 }}>
        <Typography>ITEM NAME</Typography>
        <Typography textAlign="center">QTY</Typography>
        <Typography textAlign="center">ITEM PRICE</Typography>
        <Typography textAlign="center">DISCOUNT</Typography>
        <Typography textAlign="center">TAX</Typography>
        <Typography textAlign="right">TOTAL PRICE</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
        {cartItems.map((item) => {
          const itemId = item.id || item.item_id;
          const isSelected = selectedItems.has(Number(itemId));
          
          // Calculate item price × quantity
          const itemPriceQty = (item.sale_price || item.price || 0) * (item.quantity || 1);
          
          // Calculate discount amount for this item
          const itemDiscountAmount = calculateItemDiscount(item);
          
          // Calculate discounted total
          const discountedTotal = itemPriceQty - itemDiscountAmount;
          
          // Calculate tax on discounted price
          let itemTax = 0;
          if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0) {
            const totalTaxRate = item.taxes.reduce((sum, tax) => {
              const rate = parseFloat(tax.rate) || 0;
              return sum + rate;
            }, 0);
            // Tax calculated on discounted total
            itemTax = (discountedTotal * totalTaxRate) / 100;
          }
          
          // Calculate total price = (ITEM PRICE * QTY) - DISCOUNT + TAX
          const totalPrice = discountedTotal + itemTax;
          
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
            <Typography textAlign="center">${itemDiscountAmount.toFixed(2)}</Typography>
            <Typography textAlign="center">${itemTax.toFixed(2)}</Typography>
            <Typography textAlign="right">${totalPrice.toFixed(2)}</Typography>
          </ButtonBase>
          );
        })}
      </Box>

      <DiscountSummaryBar totals={totals} />

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          onClick={handleRemoveMultiItemDiscount}
          disabled={!multiItemDiscountsApplied}
          variant="contained"
          sx={{
            backgroundColor: multiItemDiscountsApplied ? "#000" : "#9ca3af",
            color: "white",
          }}
        >
          REMOVE
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={handleCancelMultiItem} variant="contained" sx={{ backgroundColor: "#000", color: "white" }}>
            CANCEL
          </Button>
          {multiItemDiscountsApplied ? (
            <Button onClick={handleApplyMultiItem} variant="contained" sx={{ backgroundColor: "#b91c1c", color: "white" }}>
              APPLY
            </Button>
          ) : (
            <Button
              onClick={handleSelectDiscount}
              disabled={selectedItems.size === 0}
              variant="contained"
              sx={{
                backgroundColor: selectedItems.size > 0 ? "#000" : "#9ca3af",
                color: "white",
              }}
            >
              SELECT DISCOUNT
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
