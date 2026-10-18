import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Typography,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useCreateReturnMutation } from "services/orderSlice";
import useSnackbar from "hooks/useSnackbar";
import { useSelector } from "react-redux";

const ReturnCheckoutDialog = ({
  open,
  onClose,
  onComplete,
  selectedOrder,
  returnItems,
  returnSummary,
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [createReturn, { isLoading }] = useCreateReturnMutation();
  const { openSnackbar } = useSnackbar();
  const user = useSelector((state) => state.auth.user);

  const handleReturnClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmClose = () => {
    setOpenConfirm(false);
  };

  const handleConfirmReturn = async () => {
    try {
      // Prepare return payload
      const returnPayload = {
        original_order_id: selectedOrder?.id,
        order_id: selectedOrder?.order_id || selectedOrder?.id,
        return_items: returnItems.map((item) => ({
          order_item_id: item.id,
          item_id: item.item_id,
          quantity: item.returnQty,
          price: item.price,
          total: item.total,
        })),
        subtotal: returnSummary.subtotal,
        tax: returnSummary.tax,
        discount: returnSummary.discount,
        total_amount: returnSummary.total,
        return_type: "multi_item",
        reason: "Customer return",
        cashier_id: user?.id,
        cash_drawer_id: user?.drawer_id || null,
      };

      const response = await createReturn(returnPayload).unwrap();

      if (response) {
        openSnackbar("Return processed successfully!", "success");
        setOpenConfirm(false);
        onComplete?.();
      }
    } catch (error) {
      console.error("Return error:", error);
      openSnackbar(
        error?.data?.detail ||
          error?.message ||
          "Failed to process return. Please try again.",
        "error"
      );
      setOpenConfirm(false);
    }
  };

  if (!returnSummary || !returnItems || returnItems.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open && !openConfirm}
        onClose={onClose}
        fullWidth
        maxWidth="md"
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
            Return Checkout
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
            onClick={onClose}
            disabled={isLoading}
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </Button>
        </Box>

        <Box className="p-6">
          {/* Order Information */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: 700, mb: 1 }}>
              Order Information
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Order ID:</strong> {selectedOrder?.order_id || selectedOrder?.id}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Original Amount:</strong> $
              {parseFloat(selectedOrder?.total_amount || selectedOrder?.sub_total || 0).toFixed(2)}
            </Typography>
          </Box>

          {/* Return Items Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: 700, mb: 2 }}>
              Return Items ({returnItems.length})
            </Typography>
            <Stack spacing={1.5}>
              {returnItems.map((item, index) => (
            <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "#f9f9f9",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
            >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#666" }}>
                      SKU: {item.sku}
                    </Typography>
              </Box>
                  <Box sx={{ textAlign: "right", minWidth: 100 }}>
                    <Typography sx={{ fontSize: "14px", color: "#666" }}>
                      Qty: {item.returnQty} × ${item.price.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#b01d39" }}>
                      ${item.total.toFixed(2)}
                    </Typography>
              </Box>
            </Box>
          ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Financial Summary */}
          <Box sx={{ mb: 3 }}>
            <Stack spacing={2}>
              <SummaryRow label="SUBTOTAL" value={returnSummary.subtotal} />
              <SummaryRow label="TAX" value={returnSummary.tax} />
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "#fff5f5",
                  borderRadius: 2,
                  border: "2px solid #b01d39",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#b01d39",
                  }}
                >
                  RETURN AMOUNT
                </Typography>
                <Typography
                  sx={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#b01d39",
                  }}
                >
                  ${returnSummary.total.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box className="flex justify-end items-center gap-4 mt-4">
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              sx={{
                borderColor: "#666",
                color: "#666",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: "#333",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              BACK
            </Button>
            <Button
              variant="contained"
              onClick={handleReturnClick}
              disabled={isLoading}
              sx={{
                bgcolor: "#b01d39",
                color: "#fff",
                fontWeight: "bold",
                px: 6,
                py: 1.5,
                "&:hover": { bgcolor: "#702626" },
                "&:disabled": {
                  bgcolor: "#ccc",
                  color: "#666",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "PROCESS RETURN"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={handleConfirmClose}
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
        <Box className="p-8 flex flex-col justify-center items-center gap-4">
          <ErrorOutlineIcon sx={{ fontSize: 50, color: "#b01d39" }} />
          <Box className="text-[20px] font-bold text-black text-center">
            Confirm Return
          </Box>
          <Box className="text-[16px] font-medium text-black text-center">
            Are you sure you want to process a return of
            <br />
            <span style={{ color: "#b01d39", fontWeight: 700, fontSize: "20px" }}>
              ${returnSummary.total.toFixed(2)}
            </span>
            ?
          </Box>
          <Box className="text-[14px] text-gray-600 text-center">
            This will refund the customer and update inventory.
          </Box>
          <Box className="flex justify-center items-center gap-6 mt-4">
            <Button
              onClick={handleConfirmClose}
              disabled={isLoading}
              variant="outlined"
              sx={{
                borderColor: "#666",
                color: "#666",
                fontWeight: "bold",
                px: 4,
                py: 1,
                "&:hover": {
                  borderColor: "#333",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReturn}
              disabled={isLoading}
              variant="contained"
              sx={{
                bgcolor: "#b01d39",
                color: "white",
                fontWeight: "bold",
                px: 4,
                py: 1,
                "&:hover": { bgcolor: "#702626" },
                "&:disabled": {
                  bgcolor: "#ccc",
                  color: "#666",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Yes, Process Return"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

// Helper component for summary rows
const SummaryRow = ({ label, value, isNegative = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#333",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 700,
          color: isNegative ? "#28a745" : "#b01d39",
        }}
      >
        {isNegative ? "-" : ""}${value.toFixed(2)}
      </Typography>
    </Box>
  );
};

export default ReturnCheckoutDialog;
