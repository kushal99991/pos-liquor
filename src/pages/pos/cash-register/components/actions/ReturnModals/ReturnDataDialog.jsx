import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import useSnackbar from "hooks/useSnackbar";

const ReturnDataDialog = ({ open, selectedOrder, onClose, onProceedToCheckout }) => {
  const [items, setItems] = useState([]);
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    if (selectedOrder) {
      // Check if any items are already returned
      const hasReturnedItems = selectedOrder.items.some(
        (item) => item.refund_status === true
      );

      // Store original quantity as maxQty for each item
      const itemsWithMax = selectedOrder.items.map((item) => {
        const refundedQty = item.refunded_qty || 0;
        const originalQty = item.qty || 0;
        const isRefunded = item.refund_status === true;
        
        // If any items are already returned, only allow selection of active items
        // Calculate remaining quantity (original - already refunded) for active items
        // For already returned items, maxQty is 0
        const remainingQty = isRefunded ? 0 : Math.max(0, originalQty - refundedQty);

        return {
          ...item,
          maxQty: remainingQty, // Store remaining quantity (0 for returned items, original - refunded for active)
          originalQty: originalQty, // Store original quantity
          refundedQty: refundedQty, // Store already refunded quantity
          returnQty: 0, // Initialize return quantity to 0
          selected: false, // Initialize as not selected
          isRefunded: isRefunded, // Flag for already returned items
          isActive: !isRefunded, // Flag for active (non-refunded) items
        };
      });

      // If any items are already returned, filter to show only active items
      // Otherwise, show all items
      const filteredItems = hasReturnedItems
        ? itemsWithMax.filter((item) => item.isActive)
        : itemsWithMax;

      setItems(filteredItems);
    }
  }, [selectedOrder]);

  const handleQuantityChange = (id, type) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (type === "inc") {
            // Don't allow increasing beyond original order quantity
            return {
              ...item,
              returnQty: Math.min(item.returnQty + 1, item.maxQty),
            };
          } else {
            // Don't allow decreasing below 0
            return {
              ...item,
              returnQty: Math.max(item.returnQty - 1, 0),
            };
          }
        }
        return item;
      })
    );
  };

  const handleSelectAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        // Only select active items (not already returned)
        if (item.isRefunded) return item;
        return {
          ...item,
          selected: true,
          returnQty: item.maxQty, // Set return quantity to max when selecting all
        };
      })
    );
  };

  const handleClearAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: false,
        returnQty: 0, // Reset return quantity
      }))
    );
  };

  const handleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Don't allow selection of already returned items
          if (item.isRefunded) return item;
          
          const newSelected = !item.selected;
          return {
            ...item,
            selected: newSelected,
            // If selecting and returnQty is 0, set it to maxQty
            returnQty: newSelected && item.returnQty === 0 ? item.maxQty : item.returnQty,
          };
        }
        return item;
      })
    );
  };

  const totals = useMemo(() => {
    // Only calculate totals for active (non-refunded) items
    const selectedItems = items.filter(
      (item) => item.selected && item.returnQty > 0 && !item.isRefunded
    );
    
    if (selectedItems.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
      };
    }

    // Calculate subtotal: sum of (price * returnQty) for selected items
    const subtotal = selectedItems.reduce(
      (acc, item) => acc + (parseFloat(item.price) || 0) * (item.returnQty || 0),
      0
    );

    // Calculate tax proportionally based on original order
    const originalSubtotal = parseFloat(selectedOrder?.sub_total || 0);
    const originalTax = parseFloat(selectedOrder?.tax || 0);
    const taxRate = originalSubtotal > 0 ? originalTax / originalSubtotal : 0;
    const tax = subtotal * taxRate;

    // Calculate discount proportionally if exists
    const originalDiscount = parseFloat(selectedOrder?.discount_value || 0);
    const discountRate = originalSubtotal > 0 ? originalDiscount / originalSubtotal : 0;
    const discount = subtotal * discountRate;

    // Total = Subtotal + Tax - Discount
    const total = subtotal + tax - discount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }, [items, selectedOrder]);

  const handleReturn = () => {
    // Only process active (non-refunded) items
    const selectedItems = items.filter(
      (item) => item.selected && item.returnQty > 0 && !item.isRefunded
    );

    if (selectedItems.length === 0) {
      openSnackbar("Please select at least one active item to return", "warning");
      return;
    }

    // Prepare return data
    const returnData = selectedItems.map((item) => ({
      id: item.id,
      item_id: item.item_id,
      sku: item?.item?.sku || "",
      name: item?.item?.name || "",
      price: item.price,
      originalQty: item.maxQty,
      returnQty: item.returnQty,
      total: item.price * item.returnQty,
    }));

    onProceedToCheckout(returnData, totals);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
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
            RETURN DATA (ORDER ID: {selectedOrder?.order_id || selectedOrder?.id || ""})
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
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </Button>
        </Box>
        <Box className="p-4">
          <Box className="flex justify-between items-center mb-8 mt-4">
            <Typography sx={{ fontSize: "22px" }}>
              <Box component="span" sx={{ fontWeight: "700" }}>
                ORDER ID:
              </Box>{" "}
              {selectedOrder?.order_id || selectedOrder?.id || ""}
            </Typography>
            <Typography sx={{ fontSize: "22px", color: "#b01d39" }}>
              <Box component="span" sx={{ fontWeight: "700" }}>
                RETURN AMOUNT: ${totals.total.toFixed(2)}
              </Box>
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{ height: "calc(100vh - 390px)" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "SELECT",
                    "SKU",
                    "ITEM NAME",
                    "PRICE",
                    "ORIGINAL QTY",
                    "REFUNDED QTY",
                    "AVAILABLE QTY",
                    "RETURN QTY",
                    "TOTAL",
                  ].map((head) => (
                    <TableCell
                      key={head}
                      align="center"
                      sx={{
                        bgcolor: "#000",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        borderBottom: "none",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const isDisabled = item.isRefunded;
                  const hasRefundedQty = (item.refundedQty || 0) > 0;
                  
                  return (
                    <TableRow
                      key={item.id}
                      sx={{
                        bgcolor: item.selected ? "#fff5f5" : isDisabled ? "#f5f5f5" : "transparent",
                        opacity: isDisabled ? 0.6 : 1,
                        "&:hover": { 
                          bgcolor: item.selected ? "#ffe5e5" : isDisabled ? "#f5f5f5" : "#f5f5f5" 
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Checkbox
                          checked={item.selected}
                          onChange={() => handleSelect(item.id)}
                          disabled={isDisabled}
                          sx={{
                            color: "#b01d39",
                            "&.Mui-checked": { color: "#b01d39" },
                            "&.Mui-disabled": {
                              color: "#ccc",
                            },
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            color: isDisabled ? "#999" : "#333",
                          }}
                        >
                          {item?.item?.sku || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            color: isDisabled ? "#999" : "#333",
                          }}
                        >
                          {item?.item?.name || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            color: isDisabled ? "#999" : "#333",
                          }}
                        >
                          ${item.price.toFixed(2)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: isDisabled ? "#999" : "#333",
                          }}
                        >
                          {String(item.originalQty || item.qty || 0).padStart(2, "0")}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: hasRefundedQty ? "#8b5cf6" : "#999",
                          }}
                        >
                          {String(item.refundedQty || 0).padStart(2, "0")}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: isDisabled ? "#999" : "#10b981",
                          }}
                        >
                          {String(item.maxQty).padStart(2, "0")}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box className="flex justify-center items-center gap-2">
                          <IconButton
                            onClick={() => handleQuantityChange(item.id, "dec")}
                            disabled={isDisabled || !item.selected || item.returnQty === 0}
                            sx={{
                              bgcolor: item.selected && item.returnQty > 0 && !isDisabled ? "#b01d39" : "#ccc",
                              color: "#fff",
                              "&:hover": { bgcolor: item.selected && !isDisabled ? "#702626" : "#999" },
                              width: 24,
                              height: 24,
                              "&.Mui-disabled": {
                                bgcolor: "#e0e0e0",
                                color: "#999",
                              },
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography
                            sx={{
                              minWidth: 40,
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: "16px",
                              color: item.selected && !isDisabled ? "#b01d39" : "#666",
                            }}
                          >
                            {String(item.returnQty).padStart(2, "0")}
                          </Typography>
                          <IconButton
                            onClick={() => handleQuantityChange(item.id, "inc")}
                            disabled={isDisabled || !item.selected || item.returnQty >= item.maxQty}
                            sx={{
                              bgcolor: item.selected && item.returnQty < item.maxQty && !isDisabled ? "#b01d39" : "#ccc",
                              color: "#fff",
                              "&:hover": { bgcolor: item.selected && !isDisabled ? "#702626" : "#999" },
                              width: 24,
                              height: 24,
                              "&.Mui-disabled": {
                                bgcolor: "#e0e0e0",
                                color: "#999",
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: item.selected && !isDisabled ? "#b01d39" : "#333",
                          }}
                        >
                          ${(item.price * item.returnQty).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="flex justify-between items-center mt-4">
            <Box className="flex gap-4">
              <Typography sx={{ fontSize: "16px", color: "#666" }}>
                <Box component="span" sx={{ fontWeight: "700" }}>Subtotal:</Box> ${totals.subtotal.toFixed(2)}
              </Typography>
              <Typography sx={{ fontSize: "16px", color: "#666" }}>
                <Box component="span" sx={{ fontWeight: "700" }}>Tax:</Box> ${totals.tax.toFixed(2)}
              </Typography>
              {totals.discount > 0 && (
                <Typography sx={{ fontSize: "16px", color: "#666" }}>
                  <Box component="span" sx={{ fontWeight: "700" }}>Discount:</Box> -${totals.discount.toFixed(2)}
                </Typography>
              )}
            </Box>

            <Box className="flex items-center gap-4">
            <Button
                variant="outlined"
              onClick={handleSelectAll}
              sx={{
                  borderColor: "#b01d39",
                  color: "#b01d39",
                fontWeight: "bold",
                px: 4,
                  "&:hover": { 
                    borderColor: "#702626",
                    bgcolor: "#fff5f5",
                  },
              }}
            >
              SELECT ALL
            </Button>
            <Button
                variant="outlined"
              onClick={handleClearAll}
              sx={{
                  borderColor: "#666",
                  color: "#666",
                fontWeight: "bold",
                px: 4,
                  "&:hover": { 
                    borderColor: "#333",
                    bgcolor: "#f5f5f5",
                  },
              }}
            >
              CLEAR ALL
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#b01d39",
                color: "#fff",
                fontWeight: "bold",
                  px: 6,
                "&:hover": { bgcolor: "#702626" },
                  "&:disabled": {
                    bgcolor: "#ccc",
                    color: "#666",
                  },
              }}
                onClick={handleReturn}
                disabled={items.filter(item => item.selected && item.returnQty > 0 && !item.isRefunded).length === 0}
            >
                PROCEED TO CHECKOUT
            </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ReturnDataDialog;
