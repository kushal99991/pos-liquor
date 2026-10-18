import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CustomerSelectionModal from "./actions/CustomerSelectionModal";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedCustomer } from "store/slice/cart.slice";

export default function CheckoutDialog({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  tax,
  surcharge,
  tips,
  grandTotal,
  onPayment,
  cashPaid = 0,
}) {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [tipAmount, setTipAmount] = useState(tips || 0);
  const [tipType, setTipType] = useState(null); // 'percentage' or 'custom'
  const [tipPercentage, setTipPercentage] = useState(null); // 5, 10, 15
  const [customTipAmount, setCustomTipAmount] = useState("");

  const [cashTender, setCashTender] = useState(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const dispatch = useDispatch();
  // We can access customer from redux if needed to show selected customer, 
  // but for now just the selection functionality is requested.
  // const customer = useSelector((state) => state.cart.customer);

  const handleSelectCustomer = (customer) => {
    dispatch(setSelectedCustomer(customer));
    // No need to close dialog, customer is set in global state
  };

  const finalTotal = grandTotal + tipAmount; // Order amount - doesn't change
  const displayCashTender = cashTender / 100; // Tendered amount - user enters
  const change = Math.max(0, displayCashTender - finalTotal);

  // Calculate popular tendered amounts based on final total
  // Pattern: Exact Amount, +50, +100, Round to nearest 500, Round to nearest 1000
  const getPopularTenderedAmounts = () => {
    if (finalTotal <= 0) return [];

    const amounts = [];

    // Helper function to round up to nearest increment
    const roundUp = (value, increment) => {
      return Math.ceil(value / increment) * increment;
    };

    // 1. Exact amount
    amounts.push(finalTotal);

    // 2. Exact amount + 50
    amounts.push(finalTotal + 50);

    // 3. Exact amount + 100
    amounts.push(finalTotal + 100);

    // 4. Round to nearest 500
    const rounded500 = roundUp(finalTotal, 500);
    // Only add if it's different from the first 3 amounts
    if (rounded500 !== finalTotal &&
      rounded500 !== (finalTotal + 50) &&
      rounded500 !== (finalTotal + 100)) {
      amounts.push(rounded500);
    } else {
      // If rounded500 conflicts, use next 500 increment
      amounts.push(rounded500 + 500);
    }

    // 5. Round to nearest 1000
    const rounded1000 = roundUp(finalTotal, 1000);
    // Only add if it's different from all previous amounts
    if (rounded1000 !== finalTotal &&
      rounded1000 !== (finalTotal + 50) &&
      rounded1000 !== (finalTotal + 100) &&
      rounded1000 !== amounts[amounts.length - 1]) {
      amounts.push(rounded1000);
    } else {
      // If rounded1000 conflicts, use next 1000 increment
      amounts.push(rounded1000 + 1000);
    }

    // Return unique amounts sorted, keep exactly 5
    return [...new Set(amounts)].sort((a, b) => a - b).slice(0, 5);
  };

  const popularAmounts = getPopularTenderedAmounts();

  // Update cashTender when cashPaid prop changes (convert dollars to cents)
  useEffect(() => {
    if (cashPaid !== undefined && cashPaid > 0) {
      setCashTender(Math.round(cashPaid * 100));
    }
  }, [cashPaid]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethod("cash");
      setTipAmount(tips || 0);
      setTipType(null);
      setTipPercentage(null);
      setCustomTipAmount("");
      setCashTender(0);
    }
  }, [isOpen, tips]);

  // Calculate tip amount based on type
  useEffect(() => {
    if (tipType === "percentage" && tipPercentage !== null) {
      const calculatedTip = (subtotal * tipPercentage) / 100;
      setTipAmount(calculatedTip);
    } else if (tipType === "custom" && customTipAmount !== "") {
      const customAmount = parseFloat(customTipAmount) || 0;
      setTipAmount(customAmount);
    } else if (tipType === null) {
      setTipAmount(0);
    }
  }, [tipType, tipPercentage, customTipAmount, subtotal]);

  const handleTipPercentageSelect = (percentage) => {
    setTipType("percentage");
    setTipPercentage(percentage);
    setCustomTipAmount("");
  };

  const handleCustomTipChange = (value) => {
    setCustomTipAmount(value);
    if (value !== "") {
      setTipType("custom");
      setTipPercentage(null);
    }
  };

  const handleTipClear = () => {
    setTipType(null);
    setTipPercentage(null);
    setCustomTipAmount("");
    setTipAmount(0);
  };

  const handlePayment = () => {
    if (selectedMethod === "cash") {
      onPayment(selectedMethod, displayCashTender, tipAmount);
    } else {
      onPayment(selectedMethod, finalTotal, tipAmount);
    }
  };

  const handleNumberClick = (num) => {
    if (num === ".") {
      // Handle decimal point - convert to string, add decimal if not present
      const currentValue = (cashTender / 100).toString();
      if (!currentValue.includes(".")) {
        setCashTender((prev) => prev);
        // For decimal, we'll handle it differently - keep as is for now
      }
      return;
    }

    if (num === "00") {
      // Add two zeros - multiply by 100
      setCashTender((prev) => prev * 100);
    } else {
      // Add digit - shift left and add new digit
      setCashTender((prev) => prev * 10 + Number(num));
    }
  };

  const handleBackspace = () => {
    // Remove last digit - divide by 10 and floor
    setCashTender((prev) => Math.floor(prev / 10));
  };

  const handleClear = () => {
    setCashTender(0);
  };

  const handlePopularTender = (amount) => {
    setCashTender(Math.round(amount * 100));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen
      PaperProps={{
        className: "m-0 w-full h-full max-w-full max-h-full rounded-none overflow-hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(to right, #8b2e45, #a8415a)",
          color: "white",
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ fontSize: "1.5rem", color: "white" }}>
          Checkout
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            onClick={() => setIsCustomerModalOpen(true)}
            startIcon={<PersonIcon />}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              fontWeight: 700,
              fontSize: "13px",
              px: 2,
              py: 1,
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              },
            }}
          >
            Select Customer
          </Button>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              backgroundColor: "#721f36",
              width: 40,
              height: 40,
              "&:hover": { backgroundColor: "#5a1829" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          height: "calc(100vh - 90px)",
          maxHeight: "calc(100vh - 90px)",
          overflow: "hidden",
          display: "flex",
          "&.MuiDialogContent-root": { paddingTop: 0 },
        }}
      >
        <Box sx={{ display: "flex", width: "100%", height: "100%", gap: 0 }}>
          {/* LEFT SIDE — ORDER ITEMS & SUMMARY (40%) */}
          <Box
            sx={{
              width: "40%",
              minWidth: "40%",
              p: 3,
              backgroundColor: "#f5f5f5",
              overflowY: "auto",
              borderRight: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Order Items */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "white",
                borderRadius: 1.5,
                border: "1px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontSize: "1rem", color: "#333" }}>
                Order Items
              </Typography>
              {cartItems && cartItems.length > 0 ? (
                <TableContainer>
                  <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f0f0f0" } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#666", py: 1 }}>
                          Item
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#666", py: 1 }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#666", py: 1 }}>
                          Price
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#666", py: 1 }}>
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item, index) => {
                        const quantity = item.quantity || 1;
                        const price = item.price || item.amount || 0;
                        const total = quantity * price;
                        const unitType = item.unit_type || 'single';
                        const unitTypeLabel = unitType === 'carton' ? 'Carton' : unitType === 'pack' ? 'Pack' : 'Single';
                        const unitTypeColor = unitType === 'carton' ? '#7c3aed' : unitType === 'pack' ? '#2563eb' : '#16a34a';
                        return (
                          <TableRow key={index} hover>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.9rem", color: "#333" }}>
                                {item.name || item.title || `Item ${index + 1}`}
                              </Typography>
                              <Typography variant="caption" sx={{ color: unitTypeColor, fontWeight: 600, fontSize: "0.7rem" }}>
                                {unitTypeLabel}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Typography variant="body2" sx={{ fontSize: "0.9rem", color: "#666" }}>
                                {quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Typography variant="body2" sx={{ fontSize: "0.9rem", color: "#666" }}>
                                ${price.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.9rem", color: "#333" }}>
                                ${total.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    No items in cart
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Order Summary */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                backgroundColor: "white",
                borderRadius: 1.5,
                border: "1px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontSize: "1rem", color: "#333" }}>
                Order Summary
              </Typography>
              <Stack spacing={1.5}>
                <SummaryRow label="Subtotal" value={subtotal} />
                <SummaryRow label="Discount" value={-discount} color="success.main" />
                <SummaryRow label="Tax" value={tax} />
                <SummaryRow label="Surcharge" value={surcharge} />
                {tipAmount > 0 && (
                  <SummaryRow label="Tips" value={tipAmount} color="primary.main" />
                )}
                <Box
                  sx={{
                    pt: 1.5,
                    mt: 1,
                    borderTop: "2px solid #e0e0e0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.05rem", color: "#8b2e45" }}>
                    Total:
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.25rem", color: "#8b2e45" }}>
                    ${finalTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Tips Section */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                backgroundColor: "white",
                borderRadius: 1.5,
                border: "1px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.95rem", color: "#333" }}>
                  Tip
                </Typography>
                {tipAmount > 0 && (
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.9rem", color: "#8b2e45" }}>
                    ${tipAmount.toFixed(2)}
                  </Typography>
                )}
              </Box>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="stretch">
                  {[5, 10, 15].map((percentage) => {
                    const isSelected = tipType === "percentage" && tipPercentage === percentage;
                    return (
                      <Button
                        key={percentage}
                        variant={isSelected ? "contained" : "outlined"}
                        onClick={() => handleTipPercentageSelect(percentage)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          py: 1.25,
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          borderRadius: 1,
                          textTransform: "none",
                          ...(isSelected
                            ? {
                              backgroundColor: "#8b2e45",
                              color: "white",
                              borderColor: "#8b2e45",
                              boxShadow: "none",
                              "&:hover": { backgroundColor: "#721f36" },
                            }
                            : {
                              borderColor: "#8b2e45",
                              color: "#8b2e45",
                              backgroundColor: "white",
                              "&:hover": {
                                borderColor: "#721f36",
                                backgroundColor: "#fafafa",
                              },
                            }),
                        }}
                      >
                        {percentage}%
                      </Button>
                    );
                  })}
                  {/* Custom Tip Input - In the same row */}
                  <KeyboardTextField
                    type="number"
                    keyboardType="currency"
                    placeholder="Custom"
                    value={customTipAmount}
                    onChange={(e) => handleCustomTipChange(e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5, color: "#666", fontSize: "0.9rem" }}>$</Typography>,
                    }}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      "& .MuiOutlinedInput-root": {
                        height: "100%",
                        borderRadius: 1,
                        "& fieldset": { borderColor: "#8b2e45" },
                        "&:hover fieldset": { borderColor: "#721f36" },
                        "&.Mui-focused fieldset": { borderColor: "#8b2e45" },
                      },
                      "& .MuiInputBase-input": {
                        py: 1.25,
                        fontSize: "0.95rem",
                      },
                    }}
                  />
                </Stack>

                {tipAmount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      px: 1.5,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.95rem", color: "#333" }}>
                      Tip Amount: <span style={{ color: "#8b2e45", fontWeight: 700 }}>${tipAmount.toFixed(2)}</span>
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleTipClear}
                      size="small"
                      sx={{
                        py: 0.5,
                        px: 1.5,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        borderRadius: 1,
                        textTransform: "none",
                        borderColor: "#d0d0d0",
                        color: "#666",
                        backgroundColor: "white",
                        "&:hover": {
                          borderColor: "#8b2e45",
                          backgroundColor: "#fafafa",
                          color: "#8b2e45",
                        },
                      }}
                    >
                      Remove Tip
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>

          {/* RIGHT SIDE — PAYMENT PROCESSING (60%) */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              backgroundColor: "#ffffff",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", maxWidth: "100%" }}>
              {/* Payment Method Buttons */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  backgroundColor: "white",
                  borderRadius: 1.5,
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="body2" fontWeight={700} mb={2} sx={{ fontSize: "0.95rem", color: "#333" }}>
                  Payment Method
                </Typography>
                <Stack direction="row" spacing={2}>
                  {[
                    { key: "cash", label: "CASH", icon: <AttachMoneyIcon sx={{ fontSize: 20 }} /> },
                    { key: "card", label: "CARD", icon: <CreditCardIcon sx={{ fontSize: 20 }} /> },
                    { key: "device", label: "DEVICE", icon: <SmartphoneIcon sx={{ fontSize: 20 }} /> },
                  ].map((method) => (
                    <Button
                      key={method.key}
                      variant={selectedMethod === method.key ? "contained" : "outlined"}
                      onClick={() => setSelectedMethod(method.key)}
                      startIcon={method.icon}
                      sx={{
                        flex: 1,
                        py: 1.75,
                        fontSize: "1rem",
                        fontWeight: 700,
                        borderRadius: 1,
                        textTransform: "none",
                        ...(selectedMethod === method.key
                          ? {
                            backgroundColor: "#8b2e45",
                            color: "white",
                            borderColor: "#8b2e45",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#721f36" },
                          }
                          : {
                            borderColor: "#8b2e45",
                            color: "#8b2e45",
                            backgroundColor: "white",
                            "&:hover": {
                              borderColor: "#721f36",
                              backgroundColor: "#fafafa",
                            },
                          }),
                      }}
                    >
                      {method.label}
                    </Button>
                  ))}
                </Stack>
              </Paper>

              {/* Cash Payment Section - Only show when Cash is selected */}
              {selectedMethod === "cash" && (
                <>
                  {/* Amount Displays Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2.5,
                      width: "100%",
                    }}
                  >
                    {/* Cash Tendered Amount Display */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1.5,
                        border: "2px solid #8b2e45",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(139, 46, 69, 0.15)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        mb={1}
                        sx={{ fontSize: "0.9rem", color: "#666" }}
                      >
                        Final Total
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "2rem", sm: "2rem", md: "2rem" },
                          color: "#8b2e45",
                          lineHeight: 1.2,
                          fontFamily: "monospace",
                        }}
                      >
                        ${finalTotal.toFixed(2)}
                      </Typography>
                    </Box>
                    {/* Tendered Amount Display */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1.5,
                        border: "2px solid #8b2e45",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(139, 46, 69, 0.15)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        mb={1}
                        sx={{ fontSize: "0.9rem", color: "#666" }}
                      >
                        Tendered Amount
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "2rem", sm: "2rem", md: "2rem" },
                          color: "#8b2e45",
                          lineHeight: 1.2,
                          fontFamily: "monospace",
                        }}
                      >
                        ${displayCashTender.toFixed(2)}
                      </Typography>
                    </Box>
                    {/* Change Amount Display */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1.5,
                        border: "2px solid #8b2e45",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(139, 46, 69, 0.15)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        mb={1}
                        sx={{ fontSize: "0.9rem", color: "#666" }}
                      >
                        Change
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "2rem", sm: "2rem", md: "2rem" },
                          color: change > 0 ? "#2e7d32" : "#8b2e45",
                          lineHeight: 1.2,
                          fontFamily: "monospace",
                        }}
                      >
                        ${change.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Popular Tendered */}
                  <Box
                    sx={{
                      p: 2.5,
                      backgroundColor: "white",
                      borderRadius: 1.5,
                      border: "1px solid #e0e0e0",
                      flexShrink: 0,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      mr={1.5}
                      sx={{ fontSize: "0.9rem", color: "#666" }}
                    >
                      Popular tendered
                    </Typography>
                    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                      {popularAmounts.map((amount) => {
                        const isSelected =
                          Math.abs(displayCashTender - amount) < 0.01;
                        return (
                          <Button
                            key={amount}
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => handlePopularTender(amount)}
                            sx={{
                              minWidth: "auto",
                              px: 2.5,
                              py: 0.75,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              borderRadius: 1,
                              textTransform: "none",
                              ...(isSelected
                                ? {
                                  backgroundColor: "#8b2e45",
                                  borderColor: "#8b2e45",
                                  color: "white",
                                  boxShadow: "none",
                                  "&:hover": {
                                    backgroundColor: "#721f36",
                                  },
                                }
                                : {
                                  borderColor: "#d0d0d0",
                                  color: "#333",
                                  backgroundColor: "white",
                                  "&:hover": {
                                    borderColor: "#8b2e45",
                                    backgroundColor: "#fafafa",
                                  },
                                }),
                            }}
                          >
                            ${amount.toFixed(2)}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Numeric Keypad */}
                  <Box
                    sx={{
                      backgroundColor: "#4c4c4c",
                      p: 2.5,
                      borderRadius: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      flexShrink: 0,
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Row 1: 1, 2, 3 */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        mb: 2,
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      {["1", "2", "3"].map((num) => (
                        <KeypadButton
                          key={num}
                          label={num}
                          onClick={() => handleNumberClick(num)}
                        />
                      ))}
                    </Box>

                    {/* Row 2: 4, 5, 6 */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        mb: 2,
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      {["4", "5", "6"].map((num) => (
                        <KeypadButton
                          key={num}
                          label={num}
                          onClick={() => handleNumberClick(num)}
                        />
                      ))}
                    </Box>

                    {/* Row 3: 7, 8, 9 */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        mb: 2,
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      {["7", "8", "9"].map((num) => (
                        <KeypadButton
                          key={num}
                          label={num}
                          onClick={() => handleNumberClick(num)}
                        />
                      ))}
                    </Box>

                    {/* Row 4: 0, Clear, Back */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      <KeypadButton
                        label="0"
                        onClick={() => handleNumberClick("0")}
                      />
                      <KeypadButton
                        label="Clear"
                        onClick={handleClear}
                        variant="red"
                      />
                      <KeypadButton
                        label={<ArrowBackIcon sx={{ fontSize: 24 }} />}
                        onClick={handleBackspace}
                      />
                    </Box>
                  </Box>

                  {/* Confirm Payment Button */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      onClick={handlePayment}
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={displayCashTender < finalTotal}
                      sx={{
                        py: 1.5,
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        backgroundColor: "#28a745",
                        borderRadius: 1.5,
                        textTransform: "none",
                        boxShadow: "0 2px 8px rgba(40, 167, 69, 0.3)",
                        "&:hover": {
                          backgroundColor: "#218838",
                          boxShadow: "0 4px 12px rgba(40, 167, 69, 0.4)",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "#cccccc",
                          color: "#666666",
                          boxShadow: "none",
                        },
                      }}
                    >
                      PAY ${finalTotal.toFixed(2)}
                    </Button>
                  </Box>
                </>
              )}

              {/* Non-Cash Payment - Show Pay Button */}
              {selectedMethod && selectedMethod !== "cash" && (
                <Box sx={{ flexShrink: 0 }}>
                  <Button
                    onClick={handlePayment}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      py: 2.5,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      backgroundColor: "#8b2e45",
                      borderRadius: 1.5,
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(139, 46, 69, 0.3)",
                      "&:hover": {
                        backgroundColor: "#721f36",
                        boxShadow: "0 4px 12px rgba(139, 46, 69, 0.4)",
                      },
                    }}
                  >
                    Pay ${finalTotal.toFixed(2)}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <CustomerSelectionModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </Dialog>
  );
}

/* --- Helper components --- */
function SummaryRow({ label, value, color, bold = false }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: bold ? 1.5 : 1,
        px: bold ? 0.5 : 0,
        borderBottom: bold ? "2px solid #e0e0e0" : "none",
        mb: bold ? 1 : 0,
      }}
    >
      <Typography
        variant={bold ? "body1" : "body2"}
        fontWeight={bold ? 700 : 500}
        sx={{
          fontSize: bold ? "1.05rem" : "0.9rem",
          color: bold ? "#8b2e45" : "#666",
        }}
      >
        {label}:
      </Typography>
      <Typography
        variant={bold ? "body1" : "body2"}
        fontWeight={bold ? 700 : 600}
        sx={{
          color: color || (bold ? "#8b2e45" : "#333"),
          fontSize: bold ? "1.25rem" : "0.95rem",
          textAlign: "right",
        }}
      >
        {value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`}
      </Typography>
    </Box>
  );
}

function KeypadButton({ label, onClick, variant = "white", disabled = false }) {
  const getStyles = () => {
    switch (variant) {
      case "green":
        return {
          bgcolor: "#28a745",
          color: "#ffffff",
          "&:hover": { bgcolor: "#218838" },
        };
      case "red":
        return {
          bgcolor: "#c62828",
          color: "#ffffff",
          "&:hover": { bgcolor: "#a02020" },
        };
      case "grey":
        return {
          bgcolor: "#6c757d",
          color: "#ffffff",
          "&:hover": { bgcolor: "#5a6268" },
        };
      default:
        return {
          bgcolor: "#ffffff",
          color: "#8b2e45",
          "&:hover": { bgcolor: "#f5f5f5" },
        };
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        fontSize: typeof label === "string" && label.length > 3 ? "1rem" : "1.5rem",
        fontWeight: 700,
        borderRadius: 1.5,
        minHeight: { xs: 50, sm: 60 },
        height: { xs: 60, sm: 60 },
        width: "100%",
        maxWidth: "100%",
        textTransform: typeof label === "string" ? "uppercase" : "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        ...getStyles(),
        "&:hover": {
          ...getStyles()["&:hover"],
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        },
        "&.Mui-disabled": {
          bgcolor: "#cccccc",
          color: "#666666",
          boxShadow: "none",
        },
      }}
    >
      {label}
    </Button>
  );
}
