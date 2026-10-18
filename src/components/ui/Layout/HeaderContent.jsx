import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@mui/material";
// import POSBG from "assets/images/pos-background.jpg";
import Header from "./Header";
import ReprintHeader from "./ReprintHeader";

const HeaderContent = () => {
  const location = useLocation();
  const isReprintPage = location.pathname === "/pos/cash-register/reprint";
  const isHiddenHeader = ["/pos/cash-register/items"].includes(location.pathname);
  
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh"
      }}
    >
      {
        !isHiddenHeader && (
          <>
            {isReprintPage ? <ReprintHeader /> : <Header />}
          </>
        )
      }
       <Outlet />
    </Box>
  );
};

export default HeaderContent;