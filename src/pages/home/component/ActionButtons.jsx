import React from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";

import LoginSignIn from "assets/images/login/login-sing-in.svg"
import LoginClockIn from "assets/images/login/login-clock-in.svg"
import LoginBreak from "assets/images/login/login-break.svg"
import LoginResume from "assets/images/login/login-resume.svg"
import LoginClockOut from "assets/images/login/login-clock-out.svg"

const ActionButtons = ({ onSignIn }) => {
  const actions = [
    { id: "signin", label: "Sign In", icon: <img src={LoginSignIn} alt="Sign In" className="max-w-14" /> },
    { id: "clockin", label: "Clock In", icon: <img src={LoginClockIn} alt="Clock In" className="max-w-14" /> },
    { id: "break", label: "Break", icon: <img src={LoginBreak} alt="Break" className="max-w-14" /> },
    { id: "resume", label: "Resume", icon: <img src={LoginResume} alt="Resume" className="max-w-14" /> },
    { id: "clockout", label: "Clock Out", icon: <img src={LoginClockOut} alt="Clock Out" className="max-w-14" /> },
  ];

  const handleActionClick = (actionId) => {
    if (actionId === "signin") {
      onSignIn();
    }
    console.log(`${actionId} clicked`);
  };

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      sx={{ mt: 5, px: 2, maxWidth: "100%" }}
    >
      {actions.map((action) => (
        <Grid item xs={6} sm={4} md={2.4} key={action.id}>
          <Paper
            elevation={3}
            sx={{
              border: "2px solid #c62828",
              borderRadius: 2,
              width: 130,
              height: 130,
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
              onClick={() => handleActionClick(action.id)}
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
              <Box sx={{ color: "primary.main", mb: 1 }}>{action.icon}</Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ fontSize: "0.95rem" }}
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
