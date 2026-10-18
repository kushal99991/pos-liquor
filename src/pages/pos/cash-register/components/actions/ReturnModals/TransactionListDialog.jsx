import {
  Box,
  Button,
  Dialog,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { X } from "lucide-react";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import React, { useState, useMemo, useEffect } from "react";
import { useLazyGetOrdersQuery } from "services/orderSlice";
import useSnackbar from "hooks/useSnackbar";

const TransactionListDialog = ({ open, onSelectOrder, onClose }) => {
  const [filterType, setFilterType] = useState("All");
  const [barcode, setBarcode] = useState("");
  const [orders, setOrders] = useState([]);

  const [getOrders, { isFetching }] = useLazyGetOrdersQuery();
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      if (response?.error) {
        openSnackbar(
          response.error?.data?.detail || "Failed to fetch orders",
          "error"
        );
        return;
      }

      // Normalize the response data
      const ordersData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.results)
        ? response.data.results
        : [];

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      openSnackbar("Failed to fetch orders", "error");
    }
  };

  const filteredTransactions = useMemo(() => {
    return orders.filter((order) => {
      const matchesBarcode =
        barcode === "" ||
        order.id?.toString().includes(barcode) ||
        order.order_id?.toString().includes(barcode);

      const orderStatus = order.order_status?.toLowerCase();
      const isReturnable = ["completed", "partial_refunded"].includes(orderStatus);

      return matchesBarcode && isReturnable;
    });
  }, [orders, barcode]);

  const handleSelectOrder = (order) => {
    onSelectOrder?.(order);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
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
        <Box className="px-4 p-2 flex justify-end items-center shadow-lg bg-white">
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
          <Box className="flex gap-4 mb-4 flex-wrap">
            <Box className="relative">
              <InputBase
                placeholder="Search Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                sx={{
                  border: "1px solid #000",
                  borderRadius: "8px",
                  padding: "8px 15px",
                  height: 40,
                  width: 200,
                }}
              />
              {barcode && (
                <IconButton
                  onClick={() => setBarcode("")}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#fff",
                    backgroundColor: "#b01d39",
                    borderRadius: "50%",
                    p: "3px",
                    "&:hover": { backgroundColor: "#702626" },
                  }}
                  size="small"
                >
                  <X size={15} />
                </IconButton>
              )}
            </Box>
          </Box>

          {isFetching ? (
            <Box
              className="flex justify-center items-center"
              sx={{ minHeight: 200 }}
            >
              <CircularProgress sx={{ color: "#b01d39" }} />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ height: "calc(100vh - 280px)" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "POS ORDERID",
                      "TRANSACTION DATE",
                      "ITEMS",
                      "STATUS",
                      "METHOD",
                      "AMOUNT",
                      "",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#000",
                          color: "#fff",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.order_id || order.id}</TableCell>
                      <TableCell>{formatDate(order.order_date)}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            bgcolor:
                              order.order_status?.toLowerCase() === "completed"
                                ? "#e8f5e9"
                                : order.order_status?.toLowerCase() === "refunded"
                                ? "#ffebee"
                                : "#f5f5f5",
                            color:
                              order.order_status?.toLowerCase() === "completed"
                                ? "#2e7d32"
                                : order.order_status?.toLowerCase() === "refunded"
                                ? "#c62828"
                                : "#666",
                          }}
                        >
                          {order.order_status || "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell>{order.payment_type || "CASH"}</TableCell>
                      <TableCell>
                        ${parseFloat(order.sub_total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          sx={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#fff",
                            background: "#b01d39",
                            padding: "4px",
                            minWidth: 0,
                            "&:hover": { background: "#702626" },
                          }}
                          onClick={() => handleSelectOrder(order)}
                        >
                          <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {barcode ? "No transactions found matching your search" : "No transactions available for return"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default TransactionListDialog;
