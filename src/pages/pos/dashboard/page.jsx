import React from "react";
import { Box } from "@mui/material";
import ActionButtons from "./component/ActionButtons";

const Page = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <ActionButtons />
    </Box>
  );
};

export default Page;
