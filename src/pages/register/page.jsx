import React, { useState } from "react";
import { Box, Button, Card, Typography } from "@mui/material";

const Keypad = () => {
  const [pin, setPin] = useState("");

  const handleKeyPress = (value) => {
    if (value === "clear") {
      setPin("");
    } else if (value === "enter") {
      console.log("Entered PIN:", pin);
    } else {
      if (pin.length < 4) setPin((prev) => prev + value);
    }
  };

  const keypadNumbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["clear", "0", "enter"],
  ];

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* PIN display */}
      <Box className="flex gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            className="w-10 h-10 border-2 border-gray-400 flex items-center justify-center rounded bg-white"
          >
            <Typography variant="h6">{pin[i] || ""}</Typography>
          </Box>
        ))}
      </Box>

      {/* Keypad */}
      <Card className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <Box className="grid grid-cols-3 gap-4">
          {keypadNumbers.flat().map((key) => (
            <Button
              key={key}
              variant="contained"
              onClick={() => handleKeyPress(key)}
              className={`h-16 w-16 rounded-md ${
                key === "enter"
                  ? "bg-red-600 hover:bg-red-700"
                  : key === "clear"
                  ? "bg-gray-400 hover:bg-gray-500"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {key === "clear" ? "✕" : key === "enter" ? "ENTER" : key}
            </Button>
          ))}
        </Box>
      </Card>

      {/* Action Buttons */}
      <Box className="flex gap-4 mt-8">
        {["Sign In", "Clock In", "Break", "Resume", "Clock Out"].map(
          (action) => (
            <Card
              key={action}
              className="px-6 py-4 text-center shadow-lg rounded-lg border border-gray-300 hover:shadow-xl transition"
            >
              <Button variant="text" className="flex flex-col items-center">
                {/* Placeholder icon */}
                <Box className="w-8 h-8 bg-blue-500 rounded-full mb-2" />
                <Typography className="font-medium">{action}</Typography>
              </Button>
            </Card>
          )
        )}
      </Box>
    </Box>
  );
};

export default Keypad;
