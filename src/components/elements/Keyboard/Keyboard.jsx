import React, { useState } from "react";
import { Box, Paper, Grid, Button } from "@mui/material";
import BackSpace from "assets/images/backspace.svg"

const Keyboard = ({ onSubmit, pinLength = 4, onClearError, error = false }) => {
  const [pin, setPin] = useState("");

  const handleNumberClick = (num) => {
    if (pin.length < pinLength) {
      onClearError()
      setPin(pin + num);
    }
  };

  const handleClear = () => setPin("");
  const handleEnter = () => {
    if (pin.length === pinLength) {
      onSubmit(pin);
      setPin("");
    }
  };

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["X", "0", "ENTER"],
  ];

  return (
    <>
      <Box className="p-7.5 bg-[#4c4c4c] w-full max-w-75 rounded-[10px]">
        <Box className="flex justify-center items-center gap-3 mb-4">
          {Array.from({ length: pinLength }).map((_, i) => (
            <Box
              key={i}
              className="p-2.5 text-[1.4rem] font-bold text-[#333333] w-full bg-[#dadada] h-14 flex justify-center items-center rounded-xs"
              sx={{
                border: error ? "2px solid #d32f2f" : "2px solid transparent",
                boxShadow: error ? "0 0 5px rgba(211,47,47,0.6)" : "none",
              }}
            >
              {pin[i] ? "•" : ""}
            </Box>
          ))}
        </Box>
        <Box className="flex flex-wrap justify-center items-center gap-2.5">
          {numbers.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item === "X" ? (
                    <Button
                      onClick={handleClear}
                      fullWidth
                      sx={{
                        flex: "1",
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        bgcolor: "#ffffff",
                        color: "#c62828",
                        borderRadius: 2,
                        minHeight: 56,
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      <img src={BackSpace} alt="BackSpace" className="w-10.5" />
                    </Button>
                  ) : item === "ENTER" ? (
                    <Button
                      onClick={handleEnter}
                      fullWidth
                      sx={{
                        flex: "1",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        bgcolor: "#c62828",
                        color: "#ffffff",
                        borderRadius: 2,
                        minHeight: 56,
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                    >
                      ENTER
                    </Button>
                  ) : (
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
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      {item}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default Keyboard;
