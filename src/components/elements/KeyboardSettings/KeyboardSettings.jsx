import React from "react";
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleUniversalKeyboard } from "store/slice/keyboardSettings.slice";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SettingsIcon from "@mui/icons-material/Settings";

const KeyboardSettings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const useUniversalKeyboard = useSelector(
    (state) => state.keyboardSettings.useUniversalKeyboard
  );

  const handleToggle = () => {
    dispatch(toggleUniversalKeyboard());
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Keyboard Settings
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <KeyboardIcon
            sx={{
              mr: 2,
              fontSize: 32,
              color: useUniversalKeyboard
                ? theme.palette.primary.main
                : theme.palette.text.disabled,
            }}
          />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Universal Keyboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {useUniversalKeyboard
                ? "Using custom on-screen keyboard"
                : "Using hardware keyboard"}
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={useUniversalKeyboard}
              onChange={handleToggle}
              color="primary"
              size="medium"
            />
          }
          label=""
          sx={{ m: 0 }}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Note:</strong> When Universal Keyboard is enabled, all text
          input fields will use the custom on-screen keyboard. When disabled,
          you can use your hardware keyboard.
        </Typography>
      </Box>
    </Paper>
  );
};

export default KeyboardSettings;

