import { Box, Button } from "@mui/material";

import ItemsDepartment from "assets/images/item-management/department-icon.svg";
import ItemsPriceChangeLog from "assets/images/item-management/price-change-log-icon.svg";
import ItemsHistory from "assets/images/item-management/history-icon.svg";
import ItemsAddtoGroup from "assets/images/item-management/add-to-group-icon.svg";
import ItemsRefresh from "assets/images/item-management/refresh-icon.svg";
import ItemsPrintLabel from "assets/images/item-management/print-label-icon.svg";
import ItemsTagAlong from "assets/images/item-management/tag-along-icon.svg";
import ItemsChangeUPC from "assets/images/item-management/change-UPC-icon.svg";
import ItemsChangePrice from "assets/images/item-management/change-price-icon.svg";

const ItemActionButton = () => {
  return (
    <>
      <Box className="p-4 bg-black flex justify-center align-middle gap-12 fixed bottom-0 left-0 w-full z-50 overflow-x-auto overflow-y-hidden">
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsDepartment}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Department
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsPriceChangeLog}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Price Change Log
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsHistory}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            History
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsAddtoGroup}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Add to Group
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsRefresh}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Refresh
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsPrintLabel}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Print Label
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsTagAlong}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Tag Along
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsChangeUPC}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Change UPC
          </Box>
        </Button>
        <Button
          disableRipple
          sx={{
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#c6c6c6",
            textTransform: "capitalize",
            letterSpacing: "1px",
            background: "transparent",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: "auto",
          }}
        >
          <Box component="span" className="text-[20px]">
            <img
              src={ItemsChangePrice}
              alt="Description"
              className="w-[25px] h-[25px] object-cover"
            />
          </Box>
          <Box component="span" className="text-nowrap">
            Change Price
          </Box>
        </Button>
      </Box>
    </>
  );
};

export default ItemActionButton;
