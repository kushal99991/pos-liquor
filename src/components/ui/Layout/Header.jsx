import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsDrawer from "components/ui/SettingsDrawer/SettingsDrawer";
import EndShiftDialog from "pages/pos/cash-register/components/actions/EndShiftDialog";
import CustomerSelectionModal from "pages/pos/cash-register/components/actions/CustomerSelectionModal";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedCustomer } from "store/slice/cart.slice";
import { Person } from "@mui/icons-material";


const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { installation } = useSelector((state) => state.pos);

  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleOpenSettings = () => {
    setSettingsDrawerOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDrawerOpen(false);
  };

  const handleCloseEndShift = () => {
    setEndShiftDialogOpen(false);
  };

  const handleSelectCustomer = (customer) => {
    dispatch(setSelectedCustomer(customer));
  };

  const { pathname } = useLocation();

  return (
    <AppBar
      position="static"
      sx={{
        px: 2,
        backgroundColor: "white",
        color: "black",
        boxShadow: "none",
        ...(pathname === "/dashboard" || pathname === "/home"
          ? { position: "absolute" }
          : { borderBottom: "1px solid #cccccc" }),
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        {/* Left: Logo as Text */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            cursor: "pointer",
            color: "black",
            "& span": { color: "red" },
          }}
          onClick={handleLogoClick}
        >
          Glory<span>POS</span>
        </Typography>

        {/* Right: Select Customer + Store Name + Icons */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Select Customer Button */}
          <IconButton
            onClick={() => setIsCustomerModalOpen(true)}
            sx={{
              backgroundColor: "#b01d39",
              color: "white",
              borderRadius: "8px",
              px: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "#702626",
              },
            }}
          >
            <Person sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Store Name */}
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ color: "#A00032" }}
          >
            {installation?.storeConfig?.name ?? "GLORYPOS DEMO STORE"}
          </Typography>

          {/* Icons */}
          <IconButton color="default">
            <ChatBubbleOutlineIcon />
          </IconButton>
          <IconButton color="default" onClick={handleOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={handleCloseSettings}
        onEndShift={() => setEndShiftDialogOpen(true)}
      />

      {/* End Shift Dialog */}
      <EndShiftDialog open={endShiftDialogOpen} onClose={handleCloseEndShift} />

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </AppBar>
  );
};

export default Header;
