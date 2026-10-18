import React from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardCashRegister from "assets/images/dashboard/cash-register.svg"
import DashboardTimeCard from "assets/images/dashboard/time-card.svg"
import DashboardItemManagement from "assets/images/dashboard/iem-management.svg"
import DashboardInventoryManagement from "assets/images/dashboard/inventory-management.svg"
import DashboardCustomerLoyaltyPRG from "assets/images/dashboard/customer-loylty.svg"
import DashboardReports from "assets/images/dashboard/reports.svg"
import DashboardBackOffice from "assets/images/dashboard/back-office.svg"
import DashboardItemHistory from "assets/images/dashboard/item-history.svg"

const ActionButtons = () => {
  const navigate = useNavigate();
  const actions = [
    { id: "cashRegister", link: '/pos/cash-register', label: "Cash Register", icon: <img src={DashboardCashRegister} alt="Cash Register" className="max-w-20" /> },
    { id: "clockin", link: '/clockin', label: "Time Card", icon: <img src={DashboardTimeCard} alt="Time Card" className="max-w-20" /> },
    { id: "items", link: '/pos/cash-register/items', label: "Item Management", icon: <img src={DashboardItemManagement} alt="Item Management" className="max-w-20" /> },
    { id: "resume", link: '/resume', label: "Inventory Management", icon: <img src={DashboardInventoryManagement} alt="Inventory Management" className="max-w-20" /> },
    { id: "clockout", link: '/clockout', label: "Customer/Loyalty PRG", icon: <img src={DashboardCustomerLoyaltyPRG} alt="Customer/Loyalty PRG" className="max-w-20" /> },
    { id: "reports", link: '/reports', label: "Reports", icon: <img src={DashboardReports} alt="Reports" className="max-w-20" /> },
    { id: "backoffice", link: '/backoffice', label: "Back Office", icon: <img src={DashboardBackOffice} alt="Back Office" className="max-w-20" /> },
    { id: "itemhistory", link: '/itemhistory', label: "Item History", icon: <img src={DashboardItemHistory} alt="Item History" className="max-w-20" /> },
  ];

  const handleActionClick = (link) => {
    navigate(link)
  };

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      sx={{ mt: 5, px: 2, maxWidth: "900px" }}
    >
      {actions.map((action) => (
        <Grid item xs={3} key={action.id}>
          <Paper
            elevation={3}
            sx={{
              border: "2px solid #c62828",
              borderRadius: 2,
              width: { xs: 150, sm: 120, md: 200 },   // responsive width
              height: { xs: 150, sm: 120, md: 200 },
              mx: "auto",   // center inside grid column
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                borderColor: "#b71c1c",
              },
            }}
          >
            <Button
              fullWidth
              onClick={() => handleActionClick(action.link)}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textTransform: "none",
                color: "#333",
                "&:hover": {
                  bgcolor: "#ffe6e6",
                  color: "error.main",
                  transform: "scale(1.03)",
                },
              }}
            >
              <Box sx={{ color: "primary.main", mb: 2 }}>{action.icon}</Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ fontSize: "0.95rem", textAlign: "center", textTransform: "uppercase" }}
              >
                {action.label}
              </Typography>
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ActionButtons;
