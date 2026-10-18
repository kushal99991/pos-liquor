import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  InputBase,
  Avatar,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import SettingsDrawer from "components/ui/SettingsDrawer/SettingsDrawer";

const BackOfficeHeader = () => {
  const navigate = useNavigate();
  const { isAdminLoggedIn: isLoggedIn, handleLogout, user } = useAuth();
  const { installation } = useSelector((state) => state.pos);
  const [language] = useState({
    code: "US",
    label: "English",
    flag: "https://flagcdn.com/w20/us.png",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/backoffice");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // Navigate to profile page when implemented
    // navigate("/backoffice/profile");
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    handleLogout();
  };

  const handleOpenSettings = () => {
    setSettingsDrawerOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDrawerOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return "A";
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
      <Toolbar
        disableGutters
        sx={{
          justifyContent: "space-between",
          gap: 3,
          minHeight: 72,
        }}
      >
        {/* Left: Store / brand */}
        <Box
          onClick={handleLogoClick}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: "#4a5162",
              "& span": { color: "#a00032" },
            }}
          >
            Glory<span className="text-red-500">POS</span>
          </Typography>
        </Box>

        {/* Center: Search */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            maxWidth: 520,
            mx: 2,
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f7fbff",
            px: 2.5,
            py: 0.75,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SearchIcon sx={{ color: "#9ca3af" }} fontSize="small" />
          <InputBase
            placeholder="Search here..."
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ "aria-label": "search backoffice" }}
          />
        </Paper>

        {/* Right: Language, alerts, profile */}
        <Box display="flex" alignItems="center" gap={2.5}>
          {/* Language */}
          <Box display="flex" alignItems="center" gap={1} sx={{ cursor: "pointer" }}>
            <Box
              component="img"
              src={language.flag}
              alt={language.label}
              sx={{ width: 24, height: 24, borderRadius: "50%" }}
            />
            <Typography variant="body2" sx={{ color: "#4b5563", fontWeight: 600 }}>
              {language.label}
            </Typography>
            <ArrowDropDownIcon sx={{ color: "#9ca3af" }} />
          </Box>

          {/* Notifications */}
          <IconButton color="default" sx={{ color: "#6b7280" }}>
            <Badge badgeContent={2} color="error" max={9}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          {/* User */}
          <Box display="flex" alignItems="center" gap={1.25}>
            <Typography variant="body2" sx={{ color: "#4b5563", fontWeight: 600 }}>
              {user?.name || "Admin User"}
            </Typography>
            <Box position="relative">
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  p: 0,
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "#e5e7eb",
                    color: "#111827",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
              <FiberManualRecordIcon
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  color: "#22c55e",
                  fontSize: 14,
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
              />
            </Box>
          </Box>

          {/* Avatar Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                minWidth: 180,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* Settings */}
          <IconButton color="default" sx={{ color: "#6b7280" }} onClick={handleOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Settings Drawer */}
      <SettingsDrawer 
        open={settingsDrawerOpen} 
        onClose={handleCloseSettings}
      />
    </AppBar>
  );
};

export default BackOfficeHeader;
