import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useDispatch, useSelector } from "react-redux";
import { toggleUniversalKeyboard } from "store/slice/keyboardSettings.slice";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";

const SettingsDrawer = ({ open, onClose, onEndShift }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { handleLogout } = useAuth();
  const useUniversalKeyboard = useSelector(
    (state) => state.keyboardSettings.useUniversalKeyboard
  );

  const handleToggleKeyboard = () => {
    dispatch(toggleUniversalKeyboard());
  };

  const handleEndShiftClick = () => {
    onClose(); // Close drawer first
    if (pathname === "/pos/cash-register") {
      // On cash register page, open End Shift dialog
      if (onEndShift) {
        onEndShift();
      }
    } else {
      // On other pages, just logout
      handleLogout();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.palette.primary.main,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsIcon />
            <Typography variant="h6" fontWeight="bold">
              Settings
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
          {/* Keyboard Settings Section */}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 600, textTransform: "uppercase" }}
          >
            Input Settings
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.02)",
              borderRadius: 2,
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)"
              }`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <KeyboardIcon
                  sx={{
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
                  <Typography variant="caption" color="text.secondary">
                    {useUniversalKeyboard
                      ? "Custom on-screen keyboard enabled"
                      : "Hardware keyboard enabled"}
                  </Typography>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={useUniversalKeyboard}
                    onChange={handleToggleKeyboard}
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          {/* Future settings sections can be added here */}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.01)",
          }}
        >
          {/* End Shift / Logout Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={pathname === "/pos/cash-register" ? <ExitToAppIcon /> : <LogoutIcon />}
            onClick={handleEndShiftClick}
            sx={{
              bgcolor: "#b01d39",
              color: "white",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "uppercase",
              borderRadius: 2,
              mb: 2,
              "&:hover": {
                bgcolor: "#8B1538",
              },
            }}
          >
            {pathname === "/pos/cash-register" ? "End Shift" : "Logout"}
          </Button>

          <Typography variant="caption" color="text.secondary" align="center" display="block">
            GloryPOS Settings v1.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;

