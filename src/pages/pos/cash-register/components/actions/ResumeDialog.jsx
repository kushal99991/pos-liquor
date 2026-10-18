import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import { useCart } from "hooks";
import moment from "moment";
import { appConfig } from "config/app.config";

export default function ResumeDialog({ open, onClose, onResume }) {
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);
  const [holdTransactions, setHoldTransactions] = useState([]);
  const { resumeCart, voidCart, fetchHeldCarts } = useCart();

  useEffect(() => {
    if (open) {
      const loadCarts = async () => {
        const carts = await fetchHeldCarts();
        setHoldTransactions(carts || []);
      };
      loadCarts();
    }
  }, [open, fetchHeldCarts]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
  };


  const handleResume = async () => {
    if (!selectedTransaction) return;

    const cartData = await resumeCart(selectedTransaction.cart_id);
    if (cartData) {
      onResume?.(cartData.cart_id || selectedTransaction.cart_id);
      const carts = await fetchHeldCarts();
      setHoldTransactions(carts || []);
      setSelectedTransaction(null);
      onClose();
    }
  };

  const handleVoid = async () => {
    if (!selectedTransaction) return;

    const success = await voidCart(selectedTransaction.cart_id);
    if (success) {
      const carts = await fetchHeldCarts();
      setHoldTransactions(carts || []);
      setSelectedTransaction(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600} color="#9b1c3e">
            Resume
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: "#9b1c3e",
              color: "white",
              "&:hover": { backgroundColor: "#7d1632" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" gap={2}>
          {/* Left Side - Hold Transactions List */}
          <Box flex={1}>
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "black",
                "& .MuiTableCell-root": {
                  color: "white",
                  borderBottom: "1px solid #333",
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>NO.</TableCell>
                    <TableCell>REMARK</TableCell>
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="center">
                      <Box>
                        <div>ITEMS</div>
                        <div>HOLD DATE</div>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    backgroundColor: "#FFF",
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid #333",
                    },
                  }}
                >
                  {holdTransactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No hold transactions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    holdTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.cart_id}
                        onClick={() => handleTransactionClick(transaction)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedTransaction?.cart_id === transaction.cart_id
                              ? "#9b1c3e"
                              : "transparent",
                          "&:hover": { backgroundColor: "#7d1632" },
                          "& .MuiTableCell-root": {
                            color:
                              selectedTransaction?.cart_id ===
                              transaction.cart_id
                                ? "white"
                                : "black",
                          },
                        }}
                      >
                        <TableCell>{transaction.cart_id}</TableCell>
                        <TableCell>{transaction.remark}</TableCell>
                        <TableCell>
                          ${transaction.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography variant="body2">
                              {transaction.items.length}
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                              {moment(transaction.created_at).format(
                                appConfig.displayDateWithTimeFormat,
                              )}
                            </Typography>
                            <IconButton size="small" sx={{ color: "white" }}>
                              <PrintIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Right Side - Transaction Items */}
          {selectedTransaction && (
            <Box flex={1}>
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: "#f5f5f5",
                  border: "2px solid #ddd",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "black" }}>
                      <TableCell sx={{ color: "white" }}>SKU</TableCell>
                      <TableCell sx={{ color: "white" }}>ITEM NAME</TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        QTY
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTransaction.items.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "#f5f5f5",
                        }}
                      >
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "flex-end", gap: 2 }}>
        <Button
          onClick={handleVoid}
          variant="contained"
          size="large"
          disabled={!selectedTransaction}
          sx={{
            backgroundColor: "#dc2626",
            color: "white",
            minWidth: "150px",
            "&:hover": { backgroundColor: "#b91c1c" },
            "&:disabled": { backgroundColor: "#ccc" },
          }}
        >
          VOID
        </Button>
        <Button
          onClick={handleResume}
          variant="contained"
          size="large"
          disabled={!selectedTransaction}
          sx={{
            backgroundColor: "#9b1c3e",
            color: "white",
            minWidth: "150px",
            "&:hover": { backgroundColor: "#7d1632" },
            "&:disabled": { backgroundColor: "#ccc" },
          }}
        >
          RESUME
        </Button>
      </DialogActions>
    </Dialog>
  );
}
