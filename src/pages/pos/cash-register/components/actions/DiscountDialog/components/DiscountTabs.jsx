import { Button, Box } from "@mui/material";
import { DiscountType } from "constants/discount";

export default function DiscountTabs({ activeTab, setActiveTab }) {
  return (
    <Box sx={{ display: "flex", mb: 3 }}>
      <Button
        onClick={() => setActiveTab(DiscountType.PERCENTAGE)}
        sx={{
          flex: 1,
          backgroundColor: activeTab === DiscountType.PERCENTAGE ? "#b91c1c" : "#000000",
          color: "white",
          fontWeight: 700,
          borderRadius: 0,
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
          fontWeight: 700,
          borderRadius: 0,
        }}
      >
        AMOUNT ($)
      </Button>
    </Box>
  );
}
