import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
// import POSBG from "assets/images/pos-background.jpg";
import BackOfficeHeader from "./BackOfficeHeader";
import BackOfficeLayout from "./BackOfficeLayout"

const BackOfficeHeaderContent = () => {
  const location = useLocation();
  const isBackOfficeLogin = location.pathname === "/backoffice";
  console.log(isBackOfficeLogin, "isBackOfficeLogin");
  

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        overflowX: "hidden", 
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh"
      }}
    >
        {/* Render header for authenticated back-office pages only */}
        {!isBackOfficeLogin && <BackOfficeHeader />}
       {/* <Outlet /> */}
       <BackOfficeLayout />
    </Box>
  );
};

export default BackOfficeHeaderContent;
