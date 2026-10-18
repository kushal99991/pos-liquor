import React from "react";
import { Box, Typography } from "@mui/material";

const ComingSoon = () => {
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        🚀 Coming Soon
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 3, maxWidth: 500 }}
      >
        We’re working hard to bring you something amazing. Stay tuned for updates!
      </Typography>
    </Box>
  );
};

export default ComingSoon;
