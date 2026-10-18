import React from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardReports from "assets/images/dashboard/reports.svg";

const ReportsPage = () => {
  const navigate = useNavigate();

  const reports = [
    {
      id: "inventory",
      link: "/reports/inventory",
      label: "Inventory",
      icon: <img src={DashboardReports} alt="Inventory Report" className="max-w-20" />,
    },
    {
      id: "revenue",
      link: "/reports/revenue",
      label: "Revenue",
      icon: <img src={DashboardReports} alt="Revenue Report" className="max-w-20" />,
    },
    {
      id: "end-shift",
      link: "/reports/end-shift",
      label: "End Shift",
      icon: <img src={DashboardReports} alt="End Shift Report" className="max-w-20" />,
    },
  ];

  const handleReportClick = (link) => {
    navigate(link);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 65px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="center"
        sx={{ px: 2, maxWidth: "900px" }}
      >
        {reports.map((report) => (
          <Grid item xs={3} key={report.id}>
            <Paper
              elevation={3}
              sx={{
                border: "2px solid #c62828",
                borderRadius: 2,
                width: { xs: 150, sm: 120, md: 200 },
                height: { xs: 150, sm: 120, md: 200 },
                mx: "auto",
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
                onClick={() => handleReportClick(report.link)}
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
                <Box sx={{ color: "primary.main", mb: 2 }}>{report.icon}</Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    fontSize: "0.95rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {report.label}
                </Typography>
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsPage;

