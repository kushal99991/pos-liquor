import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BackspaceIcon from "@mui/icons-material/Backspace";
import KeyboardCapslockIcon from "@mui/icons-material/KeyboardCapslock";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useKeyboard } from "contexts/KeyboardContext";

const UniversalKeyboard = () => {
  const theme = useTheme();
  const { isOpen, keyboardConfig, closeKeyboard } = useKeyboard();
  const [inputValue, setInputValue] = useState("");
  const [amount, setAmount] = useState(0); // Store in cents for currency
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isShift, setIsShift] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (keyboardConfig.type === "currency" || keyboardConfig.type === "number") {
        // Initialize from value - convert to cents
        const numericValue = parseFloat(keyboardConfig.value?.toString().replace("$", "").replace(",", "")) || 0;
        setAmount(Math.round(numericValue * 100));
      } else {
        setInputValue(keyboardConfig.value || "");
      }
    }
  }, [isOpen, keyboardConfig.value, keyboardConfig.type]);

  // Format cents to currency string
  const formatAmount = (val) => {
    return (val / 100).toFixed(2);
  };

  const getKeyboardLayout = () => {
    const { type } = keyboardConfig;

    if (type === "pin" || type === "number") {
      return {
        rows: [
          ["7", "8", "9"],
          ["4", "5", "6"],
          ["1", "2", "3"],
          ["0", "."],
        ],
        showAlpha: false,
        isNumPad: true,
      };
    }

    if (type === "currency") {
      return {
        rows: [
          ["7", "8", "9"],
          ["4", "5", "6"],
          ["1", "2", "3"],
          ["0", "."],
        ],
        showAlpha: false,
        isNumPad: true,
      };
    }

    // Full Mac-style QWERTY keyboard for text/email
    const isUpperCase = isCapsLock || isShift;
    
    const symbols = {
      "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
      "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
      "-": "_", "=": "+", "[": "{", "]": "}", "\\": "|",
      ";": ":", "'": '"', ",": "<", ".": ">", "/": "?",
      "`": "~"
    };

    return {
      rows: [
        ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
        ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
      ].map((row) =>
        row.map((key) => {
          if (isUpperCase && /[a-z]/.test(key)) {
            return key.toUpperCase();
          }
          if (isShift && symbols[key]) {
            return symbols[key];
          }
          return key;
        })
      ),
      showAlpha: true,
      symbols,
    };
  };

  const handleKeyPress = (key) => {
    const { type } = keyboardConfig;
    
    if (type === "currency" || type === "number") {
      // Handle currency/number input
      if (key === ".") {
        // Decimal point - already handled in formatting
        return;
      }
      
      if (key === "00") {
        // Add two zeros - multiply by 100
        setAmount((prev) => prev * 100);
      } else {
        // Add digit - shift left and add new digit
        setAmount((prev) => prev * 10 + Number(key));
      }
    } else {
      // Handle text input
      const { maxLength } = keyboardConfig;
      
      if (maxLength && inputValue.length >= maxLength) {
        return;
      }

      setInputValue((prev) => prev + key);
      
      // Auto-disable shift after one character
      if (isShift && !isCapsLock) {
        setIsShift(false);
      }
    }
  };

  const handleBackspace = () => {
    const { type } = keyboardConfig;
    
    if (type === "currency" || type === "number") {
      // Remove last digit - divide by 10 and floor
      setAmount((prev) => Math.floor(prev / 10));
    } else {
      setInputValue((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    const { type } = keyboardConfig;
    
    if (type === "currency" || type === "number") {
      setAmount(0);
    } else {
      setInputValue("");
    }
  };

  const handleSpace = () => {
    const { maxLength } = keyboardConfig;
    if (maxLength && inputValue.length >= maxLength) {
      return;
    }
    setInputValue((prev) => prev + " ");
  };

  const handleCapsLock = () => {
    setIsCapsLock((prev) => !prev);
    setIsShift(false);
  };

  const handleShift = () => {
    if (isCapsLock) {
      setIsCapsLock(false);
    }
    setIsShift((prev) => !prev);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const { type, maxLength } = keyboardConfig;
      
      if (type === "currency" || type === "number") {
        // For numeric input, extract numbers and convert to cents
        const numericText = text.replace(/[^0-9.]/g, "");
        const numericValue = parseFloat(numericText) || 0;
        setAmount(Math.round(numericValue * 100));
      } else {
        // For text input, respect maxLength
        if (maxLength) {
          const availableSpace = maxLength - inputValue.length;
          if (availableSpace > 0) {
            setInputValue((prev) => prev + text.slice(0, availableSpace));
          }
        } else {
          setInputValue((prev) => prev + text);
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      // Clipboard access might be denied or not available
    }
  };

  const handleEnter = () => {
    const { type } = keyboardConfig;
    
    if (keyboardConfig.onValueChange) {
      if (type === "currency" || type === "number") {
        // Return formatted amount
        keyboardConfig.onValueChange(formatAmount(amount));
      } else {
        keyboardConfig.onValueChange(inputValue);
      }
    }
    closeKeyboard();
  };

  const handleClose = () => {
    setAmount(0);
    setInputValue("");
    closeKeyboard();
  };

  const layout = getKeyboardLayout();

  // Theme-aware colors that respect Redux theme
  const keyboardBg = theme.palette.mode === "dark" 
    ? "#1c1c1e"
    : "#5a5a5c";  // Darker gray to match image exactly
  
  const displayBg = theme.palette.mode === "dark"
    ? "#2c2c2e"
    : "#ffffff";
  
  const displayText = theme.palette.mode === "dark"
    ? "#ffffff"
    : "#1d1d1f";
  
  const keyBg = theme.palette.mode === "dark"
    ? "#3a3a3c"
    : "#ffffff";
  
  const keyText = theme.palette.mode === "dark"
    ? "#ffffff"
    : "#1d1d1f";
  
  const keyHoverBg = theme.palette.mode === "dark"
    ? "#48484a"
    : "#f0f0f0";
  
  const keyShadow = theme.palette.mode === "dark"
    ? "0 1px 0 rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.4)"
    : "0 1px 0 #c7c9d1, 0 2px 0 #b8bac2, 0 2px 3px rgba(0,0,0,0.15)";
  
  const actionKeyBg = theme.palette.mode === "dark"
    ? "#48484a"
    : "#d1d3d9";
  
  const actionKeyHoverBg = theme.palette.mode === "dark"
    ? "#5a5a5c"
    : "#c2c4ca";

  const specialKeyBg = theme.palette.mode === "dark"
    ? "#48484a"
    : "#d1d3d9";
    
  const enterKeyBg = theme.palette.mode === "dark"
    ? "#0a84ff"
    : "#007aff";

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={layout.isNumPad ? "xs" : "lg"}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: layout.isNumPad ? "#4c4c4c" : keyboardBg,
          maxWidth: layout.isNumPad ? "auto" : "1000px",
          boxShadow: theme.palette.mode === "dark"
            ? "0 20px 60px rgba(0,0,0,0.8)"
            : "0 20px 60px rgba(0,0,0,0.3)",
        },
      }}
    >
      {/* Header with Display */}
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
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#ffffff" }}>
          {keyboardConfig.type === "currency" ? "$" : ""}
        </Typography>
        
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#ffffff" }}>
          {(keyboardConfig.type === "currency" || keyboardConfig.type === "number") 
            ? formatAmount(amount)
            : (inputValue || "Type here...")}
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

      {/* Keyboard */}
      <Box sx={{ p: 2.5, bgcolor: layout.isNumPad ? "#4c4c4c" : keyboardBg }}>
        {layout.isNumPad ? (
          // Numeric Keypad Layout - Matches KeyboardModal exactly
          <>
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
                  onClick={() => handleKeyPress(num)}
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
                  onClick={() => handleKeyPress(num)}
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
                  onClick={() => handleKeyPress(num)}
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
                onClick={() => handleKeyPress(".")}
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
                onClick={() => handleKeyPress("0")}
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
                onClick={() => handleKeyPress("00")}
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
                mb: 2,
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

            {/* Paste button */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                onClick={handlePaste}
                fullWidth
                sx={{
                  bgcolor: "#4a4a4a",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  minHeight: 60,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#3a3a3a" },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ContentPasteIcon sx={{ fontSize: "20px" }} />
                PASTE
              </Button>
            </Box>
          </>
        ) : (
          // Full QWERTY Keyboard Layout
          <>
            {/* Row 1: Numbers and symbols */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5, justifyContent: "center" }}>
              {layout.rows[0].map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  sx={{
                    minWidth: 46,
                    maxWidth: 46,
                    minHeight: 46,
                    bgcolor: keyBg,
                    color: keyText,
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    borderRadius: "6px",
                    boxShadow: keyShadow,
                    textTransform: "none",
                    p: 0,
                    border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                    "&:hover": { 
                      bgcolor: keyHoverBg,
                      transform: "translateY(1px)",
                    },
                    "&:active": {
                      transform: "translateY(2px)",
                      boxShadow: theme.palette.mode === "dark" 
                        ? "0 0 0 rgba(0,0,0,0.3)"
                        : "0 1px 0 #c7c9d1",
                    },
                  }}
                >
                  {key}
                </Button>
              ))}
              <Button
                onClick={handleBackspace}
                sx={{
                  minWidth: 72,
                  maxWidth: 72,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { 
                    bgcolor: actionKeyHoverBg,
                    transform: "translateY(1px)",
                  },
                }}
              >
                ⌫
              </Button>
            </Box>

            {/* Row 2: QWERTY row */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5, justifyContent: "center" }}>
              <Button
                onClick={() => handleKeyPress("\t")}
                sx={{
                  minWidth: 64,
                  maxWidth: 64,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                }}
              >
                tab
              </Button>
              {layout.rows[1].map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  sx={{
                    minWidth: 46,
                    maxWidth: 46,
                    minHeight: 46,
                    bgcolor: keyBg,
                    color: keyText,
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    borderRadius: "6px",
                    boxShadow: keyShadow,
                    textTransform: "none",
                    p: 0,
                    border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                    "&:hover": { 
                      bgcolor: keyHoverBg,
                      transform: "translateY(1px)",
                    },
                  }}
                >
                  {key}
                </Button>
              ))}
            </Box>

            {/* Row 3: ASDF row */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5, justifyContent: "center" }}>
              <Button
                onClick={handleCapsLock}
                sx={{
                  minWidth: 78,
                  maxWidth: 78,
                  minHeight: 46,
                  bgcolor: isCapsLock ? actionKeyHoverBg : actionKeyBg,
                  color: keyText,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                }}
              >
                ⇪ caps
              </Button>
              {layout.rows[2].map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  sx={{
                    minWidth: 46,
                    maxWidth: 46,
                    minHeight: 46,
                    bgcolor: keyBg,
                    color: keyText,
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    borderRadius: "6px",
                    boxShadow: keyShadow,
                    textTransform: "none",
                    p: 0,
                    border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                    "&:hover": { 
                      bgcolor: keyHoverBg,
                      transform: "translateY(1px)",
                    },
                  }}
                >
                  {key}
                </Button>
              ))}
              <Button
                onClick={handleEnter}
                sx={{
                  minWidth: 86,
                  maxWidth: 86,
                  minHeight: 46,
                  bgcolor: enterKeyBg,
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  "&:hover": { 
                    bgcolor: theme.palette.mode === "dark" ? "#0070e0" : "#0051d5",
                  },
                }}
              >
                ↵ return
              </Button>
            </Box>

            {/* Row 4: ZXCV row */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5, justifyContent: "center" }}>
              <Button
                onClick={handleShift}
                sx={{
                  minWidth: 96,
                  maxWidth: 96,
                  minHeight: 46,
                  bgcolor: isShift ? actionKeyHoverBg : actionKeyBg,
                  color: keyText,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                }}
              >
                ⇧ shift
              </Button>
              {layout.rows[3].map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  sx={{
                    minWidth: 46,
                    maxWidth: 46,
                    minHeight: 46,
                    bgcolor: keyBg,
                    color: keyText,
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    borderRadius: "6px",
                    boxShadow: keyShadow,
                    textTransform: "none",
                    p: 0,
                    border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                    "&:hover": { 
                      bgcolor: keyHoverBg,
                      transform: "translateY(1px)",
                    },
                  }}
                >
                  {key}
                </Button>
              ))}
              <Button
                onClick={handleShift}
                sx={{
                  minWidth: 96,
                  maxWidth: 96,
                  minHeight: 46,
                  bgcolor: isShift ? actionKeyHoverBg : actionKeyBg,
                  color: keyText,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                }}
              >
                ⇧ shift
              </Button>
            </Box>

            {/* Bottom row: Space and modifiers */}
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
              <Button
                sx={{
                  minWidth: 50,
                  maxWidth: 50,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                }}
              >
                fn
              </Button>
              <Button
                sx={{
                  minWidth: 58,
                  maxWidth: 58,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                }}
              >
                ^ ctrl
              </Button>
              <Button
                sx={{
                  minWidth: 58,
                  maxWidth: 58,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                }}
              >
                ⌥ opt
              </Button>
              <Button
                sx={{
                  minWidth: 68,
                  maxWidth: 68,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                }}
              >
                ⌘ cmd
              </Button>
              <Button
                onClick={handleSpace}
                sx={{
                  minWidth: 340,
                  maxWidth: 340,
                  minHeight: 46,
                  bgcolor: keyBg,
                  color: keyText,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { 
                    bgcolor: keyHoverBg,
                    transform: "translateY(1px)",
                  },
                }}
              >
                {" "}
              </Button>
              <Button
                sx={{
                  minWidth: 68,
                  maxWidth: 68,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                }}
              >
                ⌘ cmd
              </Button>
              <Button
                onClick={handleClear}
                sx={{
                  minWidth: 58,
                  maxWidth: 58,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                }}
              >
                clear
              </Button>
              <Button
                onClick={handlePaste}
                sx={{
                  minWidth: 58,
                  maxWidth: 58,
                  minHeight: 46,
                  bgcolor: actionKeyBg,
                  color: keyText,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  borderRadius: "6px",
                  boxShadow: keyShadow,
                  textTransform: "none",
                  border: theme.palette.mode === "dark" ? "1px solid #48484a" : "none",
                  "&:hover": { bgcolor: actionKeyHoverBg },
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <ContentPasteIcon sx={{ fontSize: "14px" }} />
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default UniversalKeyboard;

