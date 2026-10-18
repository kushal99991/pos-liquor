import React from "react";
import { Box, Switch, FormControlLabel, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleUniversalKeyboard } from "store/slice/keyboardSettings.slice";
import KeyboardIcon from "@mui/icons-material/Keyboard";

/**
 * Simple inline toggle for Universal Keyboard setting
 * Can be easily added to any settings page or dialog
 */
const KeyboardToggle = ({ compact = false }) => {
  const dispatch = useDispatch();
  const useUniversalKeyboard = useSelector(
    (state) => state.keyboardSettings.useUniversalKeyboard
  );

  const handleToggle = () => {
    dispatch(toggleUniversalKeyboard());
  };

  if (compact) {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={useUniversalKeyboard}
            onChange={handleToggle}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <KeyboardIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">Use Universal Keyboard</Typography>
          </Box>
        }
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <KeyboardIcon sx={{ mr: 1 }} />
        <Box>
          <Typography variant="body1">Universal Keyboard</Typography>
          <Typography variant="caption" color="text.secondary">
            {useUniversalKeyboard
              ? "Custom on-screen keyboard enabled"
              : "Hardware keyboard enabled"}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={useUniversalKeyboard}
        onChange={handleToggle}
        color="primary"
      />
    </Box>
  );
};

export default KeyboardToggle;

