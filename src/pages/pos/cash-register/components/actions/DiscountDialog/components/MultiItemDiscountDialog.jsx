import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Box,
  Typography,
  ButtonBase,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import { DiscountType } from "constants/discount";

export default function MultiItemDiscountDialog({
  open,
  onClose,
  selectedItems,
  cartItems,
  favoriteDiscounts,
  onApply,
}) {
  const [activeTab, setActiveTab] = useState("favorites");
  const [customValue, setCustomValue] = useState("0.00");

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

  const handleEnter = () => {
    const value = parseFloat(customValue);
    if (isNaN(value) || value <= 0) return;

    const selectedCartItems = cartItems.filter((item) => {
      const itemId = item.id || item.item_id;
      return selectedItems.has(Number(itemId));
    });

    // Calculate original total = item price × quantity (no discount, no tax)
    const selectedTotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.sale_price || item.price || 0) * (item.quantity || 1),
      0
    );

    let discountAmount = 0;
    if (activeTab === DiscountType.PERCENTAGE) {
      // Percentage discount on total
      discountAmount = (selectedTotal * value) / 100;
    } else if (activeTab === DiscountType.AMOUNT) {
      // Flat amount discount
      discountAmount = value;
    }

    // MULTI_ITEM CUSTOM (no discount_id) => discount_mode=PERCENTAGE or AMOUNT
    onApply({
      discount_type: "multi_item",
      discount_id: null,
      discount_value: value,
      discount_mode: activeTab,
      discount_amount: discountAmount,
      selectedItems: Array.from(selectedItems),
    });

    onClose();
  };

  const handleFavoriteSelect = (discount) => {
    const selectedCartItems = cartItems.filter((item) => {
      const itemId = item.id || item.item_id;
      return selectedItems.has(Number(itemId));
    });

    // Calculate original total = item price × quantity (no discount, no tax)
    const selectedTotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.sale_price || item.price || 0) * (item.quantity || 1),
      0
    );

    let discountAmount = 0;
    if (discount.type === DiscountType.PERCENTAGE) {
      discountAmount = (selectedTotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    // MULTI_ITEM with discount_id => discount_mode=FAVOURITE, discount_calculation_type=PERCENTAGE|AMOUNT
    onApply({
      discount_type: "multi_item",
      discount_id: discount.id,
      discount_value: discount.value,
      discount_mode: DiscountType.FAVOURITE,
      discount_calculation_type: (discount.type || DiscountType.PERCENTAGE) === DiscountType.AMOUNT ? DiscountType.AMOUNT : DiscountType.PERCENTAGE,
      discount_amount: discountAmount,
      selectedItems: Array.from(selectedItems),
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          backgroundColor: "#f3f4f6",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#b91c1c",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Discount
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            backgroundColor: "#dc2626",
            borderRadius: "50%",
            padding: "4px",
            "&:hover": { backgroundColor: "#991b1b" },
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", marginBottom: "24px", gap: 0 }}>
          <Button
            onClick={() => setActiveTab("favorites")}
            sx={{
              flex: 1,
              backgroundColor:
                activeTab === "favorites" ? "#b91c1c" : "#000000",
              color: "white",
              padding: "16px 24px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: 0,
              "&:hover": {
                backgroundColor:
                  activeTab === "favorites" ? "#991b1b" : "#1f2937",
              },
            }}
          >
            FAVORITES
          </Button>
          <Button
            onClick={() => setActiveTab(DiscountType.PERCENTAGE)}
            sx={{
              flex: 1,
              backgroundColor:
                activeTab === DiscountType.PERCENTAGE ? "#b91c1c" : "#000000",
              color: "white",
              padding: "16px 24px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: 0,
              "&:hover": {
                backgroundColor:
                  activeTab === DiscountType.PERCENTAGE ? "#991b1b" : "#1f2937",
              },
            }}
          >
            PERCENTAGE (%)
          </Button>
          <Button
            onClick={() => setActiveTab(DiscountType.AMOUNT)}
            sx={{
              flex: 1,
              backgroundColor: activeTab === DiscountType.AMOUNT ? "#b91c1c" : "#000000",
              color: "white",
              padding: "16px 24px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: 0,
              "&:hover": {
                backgroundColor: activeTab === DiscountType.AMOUNT ? "#991b1b" : "#1f2937",
              },
            }}
          >
            AMOUNT ($)
          </Button>
        </Box>

        {activeTab === "favorites" ? (
          <Box sx={{ padding: "0 24px 24px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {favoriteDiscounts.map((discount) => (
                <ButtonBase
                  key={discount.id}
                  onClick={() => handleFavoriteSelect(discount)}
                  sx={{
                    width: "100%",
                    padding: "20px 24px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#b91c1c",
                      backgroundColor: "#fef2f2",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: "#374151",
                      fontSize: "15px",
                    }}
                  >
                    {discount.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "#111827",
                    }}
                  >
                    {discount.type === DiscountType.PERCENTAGE
                      ? `${Number(discount.value).toFixed(2)}%`
                      : `$${Number(discount.value).toFixed(2)}`}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ padding: "0 24px 24px" }}>
            <Box
              sx={{
                backgroundColor: "#4b5563",
                borderRadius: "8px",
                padding: "32px",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#374151",
                  borderRadius: "8px",
                  padding: "20px 24px",
                  marginBottom: "24px",
                  textAlign: "center",
                  border: "2px solid #6b7280",
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "32px",
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {activeTab === DiscountType.PERCENTAGE ? "%" : "$"} {customValue}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  ".",
                  "0",
                  "00",
                ].map((btn) => (
                  <Button
                    key={btn}
                    onClick={() => handleNumberClick(btn)}
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      color: "#b91c1c",
                      fontSize: "28px",
                      fontWeight: 700,
                      padding: "20px",
                      borderRadius: "8px",
                      minHeight: "70px",
                      "&:hover": { backgroundColor: "#f9fafb" },
                    }}
                  >
                    {btn}
                  </Button>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Button
                  onClick={handleBackspace}
                  variant="contained"
                  sx={{
                    backgroundColor: "#d1d5db",
                    color: "#b91c1c",
                    fontSize: "20px",
                    fontWeight: 700,
                    padding: "20px",
                    borderRadius: "8px",
                    minHeight: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": { backgroundColor: "#e5e7eb" },
                  }}
                >
                  <ClearIcon sx={{ fontSize: "28px" }} />
                </Button>
                <Button
                  onClick={handleClear}
                  variant="contained"
                  sx={{
                    backgroundColor: "#b91c1c",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: 700,
                    padding: "20px",
                    borderRadius: "8px",
                    minHeight: "70px",
                    "&:hover": { backgroundColor: "#991b1b" },
                  }}
                >
                  CLEAR
                </Button>
                <Button
                  onClick={handleEnter}
                  variant="contained"
                  sx={{
                    backgroundColor: "#b91c1c",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: 700,
                    padding: "20px",
                    borderRadius: "8px",
                    minHeight: "70px",
                    "&:hover": { backgroundColor: "#991b1b" },
                  }}
                >
                  ENTER
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
