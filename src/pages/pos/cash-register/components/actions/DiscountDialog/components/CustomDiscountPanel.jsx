import { Box, Button, Typography } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/Backspace";

import DiscountTabs from "./DiscountTabs";

export default function CustomDiscountPanel({
  activeTab,
  setActiveTab,
  customValue,
  handleNumberClick,
  handleClear,
  handleBackspace,
  handleApply,
  handleRemove,
  hasAppliedDiscount,
}) {
  const buttons = ["1","2","3","4","5","6","7","8","9",".","0","00"];

  return (
    <Box sx={{ p: 3 }}>
      <DiscountTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Box sx={{ backgroundColor: "#374151", borderRadius: "8px", p: 4, maxWidth: "400px", mx: "auto" }}>
        <Box sx={{ backgroundColor: "#4b5563", borderRadius: "8px", p: 2, mb: 3, textAlign: "right" }}>
          <Typography sx={{ color: "#d1d5db", fontSize: "24px", fontWeight: 500 }}>
            {activeTab === "percentage" ? "%" : "$"} {customValue}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
          {buttons.map((btn) => (
            <Button key={btn} onClick={() => handleNumberClick(btn)} variant="contained"
              sx={{ backgroundColor: "white", color: "#b91c1c", fontSize: "24px", fontWeight: 700 }}>
              {btn}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, mt: 1.5 }}>
          <Button onClick={handleBackspace} variant="contained" sx={{ backgroundColor: "white", color: "#b91c1c" }}>
            <BackspaceIcon />
          </Button>
          <Button onClick={handleClear} variant="contained" sx={{ backgroundColor: "#b91c1c", color: "white" }}>
            CLEAR
          </Button>
          <Button onClick={handleApply} variant="contained" sx={{ backgroundColor: "#b91c1c", color: "white" }}>
            ENTER
          </Button>
        </Box>
      </Box>

      {hasAppliedDiscount && (
        <Box sx={{ mt: 3, textAlign: "left" }}>
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
        </Box>
      )}
    </Box>
  );
}
