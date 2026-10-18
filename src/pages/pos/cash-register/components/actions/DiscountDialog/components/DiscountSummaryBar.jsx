import { Box, Typography } from "@mui/material";

export default function DiscountSummaryBar({ totals }) {
  // Ensure all values are properly defined
  const originalTotal = Number(totals?.originalTotal || 0);
  const discountAmount = Number(totals?.discountAmount || 0);
  const tax = Number(totals?.tax || 0);
  const grandTotal = Number(totals?.discountGrandTotal || 0);

  return (
    <Box sx={{ backgroundColor: "#b91c1c", color: "white", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", p: 2, borderRadius: "4px", mb: 3 }}>
      {[
        { label: "ORIGINAL TOTAL", value: originalTotal },
        { label: "DISC. AMT", value: discountAmount },
        { label: "TAX", value: tax },
        { label: "GRAND TOTAL", value: grandTotal },
      ].map((item, i) => (
        <Box key={i} sx={{ textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
          <Typography fontSize="12px">{item.label}</Typography>
          <Typography fontWeight={700}>${item.value.toFixed(2)}</Typography>
        </Box>
      ))}
    </Box>
  );
}
