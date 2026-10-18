import { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const KeyboardModal = ({ open, onClose, initialValue = "0.00", onEnter }) => {
  const [amount, setAmount] = useState(0); // Store in cents

  // Format cents to currency string
  const formatAmount = (val) => {
    return (val / 100).toFixed(2);
  };

  // Initialize amount from initialValue when modal opens
  useEffect(() => {
    if (open && initialValue) {
      const numericValue = parseFloat(initialValue.toString().replace("$", "").replace(",", "")) || 0;
      setAmount(Math.round(numericValue * 100));
    } else if (open && !initialValue) {
      setAmount(0);
    }
  }, [open, initialValue]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setAmount(0);
    }
  }, [open]);

  const handleNumberClick = (num) => {
    if (num === ".") {
      // Handle decimal point - already handled in formatting
      return;
    }
    
    if (num === "00") {
      // Add two zeros - multiply by 100
      setAmount((prev) => prev * 100);
    } else {
      // Add digit - shift left and add new digit
      setAmount((prev) => prev * 10 + Number(num));
    }
  };

  const handleBackspace = () => {
    // Remove last digit - divide by 10 and floor
    setAmount((prev) => Math.floor(prev / 10));
  };

  const handleClear = () => {
    setAmount(0);
  };

  const handleEnter = () => {
    const formattedValue = formatAmount(amount);
    if (onEnter) {
      onEnter(formattedValue);
    }
    setAmount(0);
    onClose();
  };

  const handleClose = () => {
    setAmount(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#4c4c4c",
          color: "white",
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>$</Typography>
        <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
          {formatAmount(amount)}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "white",
            bgcolor: "#b01d39",
            minWidth: 32,
            minHeight: 32,
            "&:hover": { bgcolor: "#702626" },
          }}
        >
          <CloseIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      </Box>

      {/* Keypad */}
      <Box sx={{ p: 2.5, bgcolor: "#4c4c4c" }}>
        {/* Number rows */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          {["1", "2", "3"].map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              sx={{
                bgcolor: "#ffffff",
                color: "#8b2e45",
                fontSize: "1.5rem",
                fontWeight: 700,
                minHeight: 70,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              {num}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          {["4", "5", "6"].map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              sx={{
                bgcolor: "#ffffff",
                color: "#8b2e45",
                fontSize: "1.5rem",
                fontWeight: 700,
                minHeight: 70,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              {num}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          {["7", "8", "9"].map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              sx={{
                bgcolor: "#ffffff",
                color: "#8b2e45",
                fontSize: "1.5rem",
                fontWeight: 700,
                minHeight: 70,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              {num}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          <Button
            onClick={() => handleNumberClick(".")}
            sx={{
              bgcolor: "#ffffff",
              color: "#8b2e45",
              fontSize: "1.5rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            .
          </Button>
          <Button
            onClick={() => handleNumberClick("0")}
            sx={{
              bgcolor: "#ffffff",
              color: "#8b2e45",
              fontSize: "1.5rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            0
          </Button>
          <Button
            onClick={() => handleNumberClick("00")}
            sx={{
              bgcolor: "#ffffff",
              color: "#8b2e45",
              fontSize: "1.5rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            00
          </Button>
        </Box>

        {/* Action buttons */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          <Button
            onClick={handleBackspace}
            sx={{
              bgcolor: "#b01d39",
              color: "#ffffff",
              fontSize: "1.2rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#702626" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: "24px" }} />
          </Button>
          <Button
            onClick={handleClear}
            sx={{
              bgcolor: "#b01d39",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#702626" },
            }}
          >
            CLEAR
          </Button>
          <Button
            onClick={handleEnter}
            sx={{
              bgcolor: "#b01d39",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: 700,
              minHeight: 70,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#702626" },
            }}
          >
            ENTER
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default KeyboardModal;

