import { Box, Button, ButtonBase, Typography } from "@mui/material";
import DiscountTabs from "./DiscountTabs";
import { DiscountType } from "constants/discount";

export default function StandardDiscountPanel({
  standardDiscounts,
  activeTab,
  setActiveTab,
  selectedDiscount,
  setSelectedDiscount,
  handleApply,
  handleRemove,
  hasAppliedDiscount,
}) {
  // Case-insensitive so "percentage"/"PERCENTAGE" and "amount"/"AMOUNT" both match (e.g. after resume)
  const filtered = (standardDiscounts || []).filter(
    (d) => (d.type || "").toUpperCase() === (activeTab || "").toUpperCase()
  );

  return (
    <Box sx={{ p: 3 }}>
      <DiscountTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", mb: 3 }}>
        {filtered.map((discount) => (
          <ButtonBase
            key={discount.id}
            onClick={() => setSelectedDiscount(discount)}
            sx={{
              p: "16px 20px",
              border: Number(selectedDiscount?.id) === Number(discount.id) ? "2px solid #b91c1c" : "1px solid #d1d5db",
              backgroundColor: Number(selectedDiscount?.id) === Number(discount.id) ? "#fef2f2" : "white",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 500, color: "#374151", fontSize: "14px" }}>
              {discount.name}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#111827" }}>
              {discount.type === DiscountType.PERCENTAGE ? `${discount.value.toFixed(2)}%` : `$${discount.value.toFixed(2)}`}
            </Typography>
          </ButtonBase>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {hasAppliedDiscount && (
          <Button
            onClick={handleRemove}
            variant="contained"
            sx={{
              backgroundColor: "#000",
              color: "white",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#1f2937" },
            }}
          >
            REMOVE
          </Button>
        )}
        <Box sx={{ textAlign: "right", flex: 1 }}>
          <Button
            onClick={handleApply}
            disabled={!selectedDiscount}
            variant="contained"
            sx={{
              backgroundColor: selectedDiscount ? "#7f1d1d" : "#9ca3af",
              color: "white",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#991b1b" },
            }}
          >
            APPLY
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
