import { Box, Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ItemReturn from "assets/images/single-return.svg";
import ItemMultiReturn from "assets/images/multi-return.svg";
import SingleReturnConfirmDialog from "./SingleReturnConfirmDialog";
import TransactionListDialog from "./TransactionListDialog";
import ReturnDataDialog from "./ReturnDataDialog";
import ReturnCheckoutDialog from "./ReturnCheckoutDialog";
import { useState } from "react";

const SelectReturnTypeDialog = ({
  open,
  returnStep,
  setReturnStep,
  onClose,
  onSelectMulti,
  onSelectSingle,
  onRefreshItems,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnSummary, setReturnSummary] = useState(null);

  const handleSelectOrder = (order) => {
    if (order) {
      setSelectedOrder(order);
      setReturnStep("return-data");
    }
  };

  const handleProceedToCheckout = (items, summary) => {
    setReturnItems(items);
    setReturnSummary(summary);
    setReturnStep("checkout");
  };

  const handleClose = () => {
    // Reset all state when closing
    setSelectedOrder(null);
    setReturnItems([]);
    setReturnSummary(null);
    setReturnStep("select-type");
    onClose();
  };

  const handleBackToTransactionList = () => {
    setSelectedOrder(null);
    setReturnItems([]);
    setReturnSummary(null);
    setReturnStep("transaction-list");
  };

  const handleBackToReturnData = () => {
    setReturnSummary(null);
    setReturnStep("return-data");
  };

  return (
    <>
      <Dialog
        open={open && returnStep === "select-type"}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <Box className="px-4 p-2 flex justify-between items-center shadow-lg bg-white">
          <Box className="text-[20px] font-bold text-[#b01d39] uppercase">
            ITEM RETURN
          </Box>
          <Button
            sx={{
              bgcolor: "#b01d39",
              color: "white",
              minHeight: 36,
              minWidth: 36,
              borderRadius: 50,
              "&:hover": { bgcolor: "#702626" },
            }}
            onClick={handleClose}
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </Button>
        </Box>

        <Box className="p-8 flex justify-center items-center gap-4">
          <Box
            className="p-4 shadow-lg w-40 h-40 rounded-2xl flex flex-col justify-center gap-4 items-center border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
            onClick={() => setReturnStep("transaction-list")}
          >
            <img src={ItemMultiReturn} alt="Multi Return" />
            <Box className="text-[20px] font-[500] text-black">
              Multi Return
            </Box>
          </Box>

          <Box
            className="p-4 shadow-lg w-40 h-40 rounded-2xl flex flex-col justify-center gap-4 items-center border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
            onClick={() => {
              // Single return - can be implemented later
              alert("Single Return feature coming soon!");
            }}
          >
            <img src={ItemReturn} alt="Return" />
            <Box className="text-[20px] font-[500] text-black">
              Single Return
            </Box>
          </Box>
        </Box>
      </Dialog>

      <TransactionListDialog
        open={returnStep === "transaction-list"}
        onSelectOrder={handleSelectOrder}
        onClose={handleClose}
      />

      <ReturnDataDialog
        selectedOrder={selectedOrder}
        open={returnStep === "return-data"}
        onClose={handleBackToTransactionList}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <ReturnCheckoutDialog
        open={returnStep === "checkout"}
        onClose={handleBackToReturnData}
        onComplete={async () => {
          handleClose();
          // Refresh items after successful return
          if (onRefreshItems) {
            await onRefreshItems();
          }
        }}
        selectedOrder={selectedOrder}
        returnItems={returnItems}
        returnSummary={returnSummary}
      />
    </>
  );
};

export default SelectReturnTypeDialog;
