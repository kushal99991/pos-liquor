import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackSpace from "assets/images/backspace.svg"

const OpeningBalanceDialog = ({ open, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(0); // store in cents

  // format cents to currency string
  const formatAmount = (val) => {
    return (val / 100).toFixed(2);
  };

  // number pad press
  const handleNumberClick = (val) => {
    if (val === ".") return; // skip dot, we auto-handle decimals
    if (val === "00") {
      setAmount((prev) => prev * 100);
    } else {
      setAmount((prev) => prev * 10 + Number(val));
    }
  };

  // backspace (❌ button)
  const handleBackspace = () => {
    setAmount((prev) => Math.floor(prev / 10));
  };

  // clear all (Manual button)
  const handleClear = () => setAmount(0);

  // submit value
  const handleEnter = () => {
    onSubmit(formatAmount(amount));
    setAmount(0);
    onClose();
  };
  const handleDialogClose = () => {
    setAmount(0);
    onClose();
  };

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "00"],
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        sx={{
          ".MuiPaper-root.MuiPaper-elevation": {
            maxWidth: 320,
            borderRadius: "10px",
          },
        }}
      >
        <Box className="p-2.5 text-center relative">
          <Typography
            sx={{
              fontWeight: "bold",
              color: "#8B0000",
              fontSize: "1.2rem",
            }}
          >
            Opening Balance
          </Typography>
          <CloseIcon onClick={handleDialogClose} className="p-1 absolute top-1/2 right-2.5 bg-[#8B0000] text-white rounded-full -translate-y-1/2 cursor-pointer" />
        </Box>
        <Box className="p-4 bg-[#4c4c4c]">
          <Box className="flex justify-center items-center gap-2.5 border-b-2 border-white mb-4">
            <Box className="text-[26px] font-bold text-white">$</Box>
            <Box className="text-[26px] font-bold text-white text-right">
              {formatAmount(amount)}
            </Box>
          </Box>
          <Box className="flex flex-wrap justify-center items-center gap-2.5 mb-2.5">
            {numbers.map((row, i) => (
              <React.Fragment key={i}>
                {row.map((item, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleNumberClick(item)}
                    fullWidth
                    sx={{
                      flex: "1",
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      bgcolor: "#ffffff",
                      color: "#c62828",
                      borderRadius: 2,
                      minHeight: 56,
                      minWidth: "calc(33.33% - 1rem)",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </React.Fragment>
            ))}
          </Box>
          <Box className="flex flex-wrap justify-center items-center gap-2.5">
            <Button
              onClick={handleBackspace}
              fullWidth
              sx={{
                flex: "1",
                fontSize: "1.3rem",
                fontWeight: "bold",
                bgcolor: "#ffffff",
                color: "#c62828",
                borderRadius: 2,
                minHeight: 56,
                minWidth: "calc(33.33% - 1rem)",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <img src={BackSpace} alt="BackSpace" className="w-10.5"/>
            </Button>
            <Button
              fullWidth
              onClick={handleClear}
              sx={{
                flex: "1",
                fontSize: "1rem",
                fontWeight: "bold",
                bgcolor: "#c62828",
                color: "#ffffff",
                borderRadius: 2,
                minHeight: 56,
                minWidth: "calc(33.33% - 1rem)",
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Manual
            </Button>
            <Button
              fullWidth
              onClick={handleEnter}
              sx={{
                flex: "1",
                fontSize: "1rem",
                fontWeight: "bold",
                bgcolor: "#c62828",
                color: "#ffffff",
                borderRadius: 2,
                minHeight: 56,
                minWidth: "calc(33.33% - 1rem)",
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Enter
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default OpeningBalanceDialog;
