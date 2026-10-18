import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, IconButton, Grid, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { Close } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useEndShiftMutation } from 'services/orderSlice';
import { useCloseDrawerMutation, useLazyGetOpenDrawerQuery } from 'services/cashierDrawerSlice';
import { logout } from 'store/slice/auth.slice';
import { appConfig } from 'config/app.config';
import Cookies from 'js-cookie';
import useSnackbar from 'hooks/useSnackbar';

const ClosingDrawerDialog = ({ open, onClose, onEndShift, closingDrawerReconciliation = null, startDate, endDate, storeId, reportData = null, stores = [], batch = '' }) => {
  const dispatch = useDispatch();
  const { openSnackbar } = useSnackbar();
  const [endShiftMutation, { isLoading: isEndingShift }] = useEndShiftMutation();
  const [closeDrawerMutation, { isLoading: isClosingDrawer }] = useCloseDrawerMutation();
  const [getOpenDrawer] = useLazyGetOpenDrawerQuery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [drawerId, setDrawerId] = useState(null);
  // Initialize state from API response
  const [openingBalance, setOpeningBalance] = useState(0.00);
  const [cashPaidIn, setCashPaidIn] = useState(0.00);
  const [cashPaidOut, setCashPaidOut] = useState(0.00);
  const [cashDropped, setCashDropped] = useState(0.00);
  const [cashCollected, setCashCollected] = useState(0.00);
  const [houseAccountOut, setHouseAccountOut] = useState(0.00);
  const [totalCreditCard, setTotalCreditCard] = useState(0.00);
  const [totalEBT, setTotalEBT] = useState(0.00);
  const [totalChecks, setTotalChecks] = useState(0.00);
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const [pennies, setPennies] = useState(0);
  const [nickels, setNickels] = useState(0);
  const [dimes, setDimes] = useState(0);
  const [quarters, setQuarters] = useState(0);
  const [halfDollars, setHalfDollars] = useState(0);
  const [dollars, setDollars] = useState(0);

  const [twoDollars, setTwoDollars] = useState(0);
  const [fives, setFives] = useState(0);
  const [tens, setTens] = useState(0);
  const [twenties, setTwenties] = useState(0);
  const [fifties, setFifties] = useState(0);
  const [hundreds, setHundreds] = useState(0);

  // Fetch drawer ID when dialog opens
  useEffect(() => {
    if (open) {
      const fetchDrawerId = async () => {
        try {
          const response = await getOpenDrawer();
          if (response?.data?.id) {
            setDrawerId(response.data.id);
          }
        } catch (error) {
          console.error('Error fetching drawer ID:', error);
        }
      };
      fetchDrawerId();
    }
  }, [open, getOpenDrawer]);

  // Update state when closing_drawer_reconciliation data changes
  useEffect(() => {
    if (closingDrawerReconciliation) {
      setOpeningBalance(closingDrawerReconciliation.opening_balance || 0.00);
      setCashPaidIn(closingDrawerReconciliation.cash_paidin || 0.00);
      setCashPaidOut(closingDrawerReconciliation.cash_paidout || 0.00);
      setCashDropped(closingDrawerReconciliation.cash_dropped || 0.00);
      setCashCollected(closingDrawerReconciliation.cash_collected || 0.00);
      setHouseAccountOut(closingDrawerReconciliation.house_account_out || 0.00);
      setTotalCreditCard(closingDrawerReconciliation.total_credit_card || 0.00);
      setTotalEBT(closingDrawerReconciliation.total_ebt || 0.00);
    }
  }, [closingDrawerReconciliation]);

  // Use drawer_difference and cash_in_hand from API if available, otherwise calculate
  const drawerDifference = closingDrawerReconciliation?.drawer_difference ?? (openingBalance + cashPaidIn - cashPaidOut - cashDropped);
  const cashInHand = closingDrawerReconciliation?.cash_in_hand ?? (openingBalance + cashCollected);

  const totalCashBreakdown =
    pennies * 0.01 +
    nickels * 0.05 +
    dimes * 0.10 +
    quarters * 0.25 +
    halfDollars * 0.50 +
    dollars * 1.00 +
    twoDollars * 2.00 +
    fives * 5.00 +
    tens * 10.00 +
    twenties * 20.00 +
    fifties * 50.00 +
    hundreds * 100.00;

  // Extract data from API response for report dialog
  const summaryData = useMemo(() => {
    if (!reportData?.key_metrics) {
      return {
        grossReceived: 0.00,
        totalTax: 0.00,
        netRevenue: 0.00,
        totalCard: 0.00,
        totalCash: 0.00,
        totalEBT: 0.00,
        totalDiscount: 0.00,
      };
    }
    return {
      grossReceived: reportData.key_metrics.gross_received || 0.00,
      totalTax: reportData.key_metrics.total_tax || 0.00,
      netRevenue: reportData.key_metrics.net_revenue || 0.00,
      totalCard: reportData.key_metrics.total_card || 0.00,
      totalCash: reportData.key_metrics.total_cash || 0.00,
      totalEBT: reportData.key_metrics.total_ebt || 0.00,
      totalDiscount: reportData.key_metrics.total_discount || 0.00,
    };
  }, [reportData]);

  const salesSummary = useMemo(() => {
    if (!reportData?.sales_summary) {
      return {
        taxable: 0.00,
        nonTaxable: 0.00,
        nonRevenue: 0.00,
        netRevenue: 0.00,
        totalTaxAmount: 0.00,
        totalCardSurcharge: 0.00,
        totalItemSurcharge: 0.00,
        totalDiscount: 0.00,
        grossReceived: 0.00,
      };
    }
    return {
      taxable: reportData.sales_summary.taxable || 0.00,
      nonTaxable: reportData.sales_summary.non_taxable || 0.00,
      nonRevenue: reportData.sales_summary.non_revenue || 0.00,
      netRevenue: reportData.sales_summary.net_revenue || 0.00,
      totalTaxAmount: reportData.sales_summary.total_tax_amount || 0.00,
      totalCardSurcharge: reportData.sales_summary.total_card_surcharge || 0.00,
      totalItemSurcharge: reportData.sales_summary.total_item_surcharge || 0.00,
      totalDiscount: reportData.sales_summary.total_discount || 0.00,
      grossReceived: reportData.sales_summary.gross_received || 0.00,
    };
  }, [reportData]);

  const taxDetails = useMemo(() => {
    if (!reportData?.tax_details || !Array.isArray(reportData.tax_details)) {
      return [{ title: 'TAX1 (6.25 %)', salesAmount: 0.00, taxAmount: 0.00 }];
    }
    return reportData.tax_details.map((tax) => ({
      title: tax.title || 'TAX1 (6.25 %)',
      salesAmount: tax.sales_amount || 0.00,
      taxAmount: tax.tax_amount || 0.00,
    }));
  }, [reportData]);

  const tenderSummary = useMemo(() => {
    if (!reportData?.tender_payment_summary) {
      return { cash: 0.00, grandTotal: 0.00 };
    }
    return {
      cash: reportData.tender_payment_summary.cash || 0.00,
      grandTotal: reportData.tender_payment_summary.grand_total || 0.00,
    };
  }, [reportData]);

  const lotterySummary = useMemo(() => {
    if (!reportData?.lottery_summary) {
      return { lottoOnline: 0.00, lottoPayout: 0.00 };
    }
    return {
      lottoOnline: reportData.lottery_summary.lotto_online || 0.00,
      lottoPayout: reportData.lottery_summary.lotto_payout || 0.00,
    };
  }, [reportData]);

  const statistics = useMemo(() => {
    if (!reportData?.statistics_summary || !Array.isArray(reportData.statistics_summary)) {
      return [
        { title: 'TOTAL DISCOUNT', count: '00', amount: 0.00 },
        { title: 'TOTAL VOID', count: '00', amount: 0.00 },
        { title: 'TOTAL DELETE ITEM', count: '00', amount: 0.00 },
        { title: 'RETURN TRANSACTION', count: '00', amount: 0.00 },
        { title: 'TOTAL TRANSACTION', count: '00', amount: 0.00 },
        { title: 'CASHBACK', count: '00', amount: 0.0 },
        { title: 'CARD SURCHARGE', count: '00', amount: 0.00 },
        { title: 'ITEM SURCHARGE', count: '00', amount: 0.00 },
        { title: 'CASHBACK SURCHARGE', count: '00', amount: 0.00 },
        { title: 'HOUSE ACCOUNT', count: '00', amount: 0.00 },
        { title: 'TOTAL NO SALES', count: '00', amount: 0.00 },
        { title: 'TOTAL SCAN ITEM', count: '00', amount: 0.00 },
      ];
    }
    return reportData.statistics_summary.map((stat) => ({
      title: stat.title || '',
      count: String(stat.count || 0).padStart(2, '0'),
      amount: stat.amount || 0.00,
    }));
  }, [reportData]);

  const cashDeposits = useMemo(() => {
    if (!reportData?.cash_deposits) {
      return { openingBalance: 0.00, cashCollected: 0.00 };
    }
    return {
      openingBalance: reportData.cash_deposits.opening_balance || 0.00,
      cashCollected: reportData.cash_deposits.cash_collected || 0.00,
    };
  }, [reportData]);

  const handleSettleBatch = () => {
    console.log('Settle Batch clicked');
  };

  const handlePrint = () => {
    // Open the report dialog when Print button is clicked
    setOpenReportDialog(true);
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleEndShift = async () => {
    if (!startDate || !endDate || !storeId) {
      openSnackbar('Start date, end date, and store ID are required', 'error');
      return;
    }

    if (!drawerId) {
      openSnackbar('Drawer ID is required. Please ensure a drawer is open.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Format dates as ISO strings for the API
      const formatDateTimeISO = (date) => {
        if (!date) return null;
        return new Date(date).toISOString();
      };

      // Call end-shift API with parameters
      const endShiftParams = {
        start_datetime: formatDateTimeISO(startDate),
        end_datetime: formatDateTimeISO(endDate),
        store_id: storeId,
      };
      const endShiftResponse = await endShiftMutation(endShiftParams).unwrap();
      
      // Calculate close drawer parameters using values from closingDrawerReconciliation if available
      // Use direct values from API response to ensure accuracy
      const openingBal = closingDrawerReconciliation?.opening_balance ?? openingBalance;
      const cashCol = closingDrawerReconciliation?.cash_collected ?? cashCollected;
      const cashDrop = closingDrawerReconciliation?.cash_dropped ?? cashDropped;
      const cashInHandValue = closingDrawerReconciliation?.cash_in_hand ?? cashInHand;
      const drawerDiff = closingDrawerReconciliation?.drawer_difference ?? drawerDifference;
      
      // closing_amount: Total cash in hand (opening balance + cash collected)
      const closingAmount = parseFloat(cashInHandValue.toFixed(2));
      // cash_collected: Total cash collected from sales
      const cashCollectedValue = parseFloat(cashCol.toFixed(2));
      // drop_amount: Cash dropped
      const dropAmount = parseFloat(cashDrop.toFixed(2));
      // expected_cash: Opening balance + cash collected (what should be in drawer)
      const expectedCash = parseFloat((openingBal + cashCol).toFixed(2));
      // difference: Drawer difference
      const difference = parseFloat(drawerDiff.toFixed(2));

      // Call close drawer API with parameters
      const closeDrawerParams = {
        drawer_id: drawerId,
        closing_amount: closingAmount,
        cash_collected: cashCollectedValue,
        drop_amount: dropAmount,
        expected_cash: expectedCash,
        difference: difference,
      };
      const closeDrawerResponse = await closeDrawerMutation(closeDrawerParams).unwrap();
      
      // If both APIs succeed, logout the user
      // Clear Redux state
      dispatch(logout());
      
      // Clear cookies
      Cookies.remove(appConfig.tokenName);
      Cookies.remove(appConfig.domainName);
      
      // Clear localStorage
      localStorage.clear();
      
      // Show success message
      openSnackbar('Shift ended successfully. Logging out...', 'success');
      
      // Close dialogs
    if (onEndShift) {
      onEndShift();
      }
      onClose();
      
      // Redirect to login/home page after a short delay
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (error) {
      console.error('Error ending shift:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Failed to end shift. Please try again.';
      openSnackbar(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#f5f5f5',
          borderRadius: '8px',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2.5,
            bgcolor: 'white',
            borderBottom: '2px solid #e0e0e0',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '20px',
              color: '#8b1538',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            CLOSING DRAWER RECONCILIATION
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: '#8b1538',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              '&:hover': {
                bgcolor: '#6d0f2a',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            px: 4,
            py: 3,
            overflowY: 'auto',
            flex: 1,
            bgcolor: '#f5f5f5',
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InputField
                  label="OPENING BALANCE(+)"
                  value={openingBalance}
                  onChange={setOpeningBalance}
                  bgColor="white"
                />
                <InputField
                  label="CASH PAIDIN(+)"
                  value={cashPaidIn}
                  onChange={setCashPaidIn}
                  bgColor="white"
                />
                <InputField
                  label="CASH PAIDOUT(-)"
                  value={cashPaidOut}
                  onChange={setCashPaidOut}
                  bgColor="white"
                />
                <InputField
                  label="CASH DROPPED(-)"
                  value={cashDropped}
                  onChange={setCashDropped}
                  bgColor="white"
                />
                <InputField
                  label="DRAWER DIFFERENCE"
                  value={drawerDifference}
                  readOnly
                  bgColor="#d4edda"
                  textColor="#155724"
                />
                <InputField
                  label="CASH COLLECTED(+)"
                  value={cashCollected}
                  onChange={setCashCollected}
                  bgColor="white"
                />
                <InputField
                  label="CASH IN HAND"
                  value={cashInHand}
                  readOnly
                  bgColor="white"
                />

                <Box sx={{ height: '20px' }} />

                <InputField
                  label="HOUSE ACCOUNT OUT"
                  value={houseAccountOut}
                  onChange={setHouseAccountOut}
                  bgColor="white"
                />
                <InputField
                  label="TOTAL CREDIT CARD"
                  value={totalCreditCard}
                  onChange={setTotalCreditCard}
                  bgColor="white"
                />
                <InputField
                  label="TOTAL EBT"
                  value={totalEBT}
                  onChange={setTotalEBT}
                  bgColor="white"
                />
                <InputField
                  label="TOTAL CHECKS"
                  value={totalChecks}
                  onChange={setTotalChecks}
                  bgColor="white"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="PENNIES"
                      denomination="($0.01)"
                      count={pennies}
                      onCountChange={setPennies}
                      amount={pennies * 0.01}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="TWO-DOLLAR"
                      denomination="($2.00)"
                      count={twoDollars}
                      onCountChange={setTwoDollars}
                      amount={twoDollars * 2.00}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="NICKELS"
                      denomination="($0.05)"
                      count={nickels}
                      onCountChange={setNickels}
                      amount={nickels * 0.05}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="FIVE"
                      denomination="($5.00)"
                      count={fives}
                      onCountChange={setFives}
                      amount={fives * 5.00}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="DIMES"
                      denomination="($0.10)"
                      count={dimes}
                      onCountChange={setDimes}
                      amount={dimes * 0.10}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="TENS"
                      denomination="($10.00)"
                      count={tens}
                      onCountChange={setTens}
                      amount={tens * 10.00}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="QUARTERS"
                      denomination="($0.25)"
                      count={quarters}
                      onCountChange={setQuarters}
                      amount={quarters * 0.25}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="TWENTIES"
                      denomination="($20.00)"
                      count={twenties}
                      onCountChange={setTwenties}
                      amount={twenties * 20.00}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="HALF-DOLLAR"
                      denomination="($0.50)"
                      count={halfDollars}
                      onCountChange={setHalfDollars}
                      amount={halfDollars * 0.50}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="FIFTIES"
                      denomination="($50.00)"
                      count={fifties}
                      onCountChange={setFifties}
                      amount={fifties * 50.00}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="DOLLAR"
                      denomination="($1.00)"
                      count={dollars}
                      onCountChange={setDollars}
                      amount={dollars * 1.00}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <CoinInputField
                      label="HUNDREDS"
                      denomination="($100.00)"
                      count={hundreds}
                      onCountChange={setHundreds}
                      amount={hundreds * 100.00}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '16px',
                      color: '#000',
                      textTransform: 'uppercase',
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    TOTAL CASH BREAKDOWN
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '2px solid #e0e0e0',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#000',
                      }}
                    >
                      TOTAL
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#000',
                      }}
                    >
                      ${cashInHand.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            px: 4,
            py: 2.5,
            bgcolor: 'white',
            borderTop: '2px solid #e0e0e0',
          }}
        >
          <Button
            variant="contained"
            onClick={handleSettleBatch}
            sx={{
              bgcolor: '#8b1538',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#6d0f2a',
                boxShadow: 'none',
              },
            }}
          >
            Settle Batch
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
            sx={{
              bgcolor: '#000',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#333',
                boxShadow: 'none',
              },
            }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            onClick={handleEndShift}
            disabled={isProcessing || isEndingShift || isClosingDrawer}
            sx={{
              bgcolor: '#8b1538',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#6d0f2a',
                boxShadow: 'none',
              },
              '&:disabled': {
                bgcolor: '#ccc',
                color: '#666',
              },
            }}
            startIcon={isProcessing || isEndingShift || isClosingDrawer ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isProcessing || isEndingShift || isClosingDrawer ? 'Processing...' : 'End Shift'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>

    {/* Report Dialog - Opens when Print button is clicked */}
    <Dialog
      open={openReportDialog}
      onClose={handleCloseReportDialog}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '4px',
          maxWidth: '500px',
        },
      }}
    >
      <Box className="bg-white p-8">
        <style>
          {`
            @media print {
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <Box
          className="bg-white border-2 border-gray-300 p-6"
          sx={{
            fontFamily: 'Courier New, monospace',
          }}
        >
          {/* Store Info */}
          <Box className="text-center mb-4">
            <div className="font-bold text-lg">END SHIFT REPORT</div>
            <div className="text-sm">Store: {stores.find((s) => s.id === storeId)?.name || 'N/A'}</div>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Date Range */}
          <Box className="flex justify-between text-sm mb-1">
            <span>Start Date :</span>
            <span>
              {startDate?.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }) || 'N/A'}
            </span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>End Date :</span>
            <span>
              {endDate?.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }) || 'N/A'}
            </span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <Box className="flex-1">Batch : {batch || 'N/A'}</Box>
            <Box className="flex-1 text-right">Register : {storeId || 'N/A'}</Box>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Key Metrics */}
          <Box className="text-sm font-bold mb-2">KEY METRICS</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Gross Received :</span>
            <span>${summaryData.grossReceived.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Tax :</span>
            <span>${summaryData.totalTax.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Net Revenue :</span>
            <span>${summaryData.netRevenue.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Card :</span>
            <span>${summaryData.totalCard.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Cash :</span>
            <span>${summaryData.totalCash.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total EBT :</span>
            <span>${summaryData.totalEBT.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Discount :</span>
            <span>${summaryData.totalDiscount.toFixed(2)}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Sales Summary */}
          <Box className="text-sm font-bold mb-2">SALES SUMMARY</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Taxable :</span>
            <span>${salesSummary.taxable.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Non-Taxable :</span>
            <span>${salesSummary.nonTaxable.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Non Revenue :</span>
            <span>${salesSummary.nonRevenue.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-lg font-bold mb-1">
            <span>Net Revenue :</span>
            <span>${salesSummary.netRevenue.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Tax Amount :</span>
            <span>${salesSummary.totalTaxAmount.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Card Surcharge :</span>
            <span>${salesSummary.totalCardSurcharge.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Item Surcharge :</span>
            <span>${salesSummary.totalItemSurcharge.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Total Discount :</span>
            <span>${salesSummary.totalDiscount.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Gross Received :</span>
            <span>${salesSummary.grossReceived.toFixed(2)}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Tax Details */}
          {taxDetails.length > 0 && (
            <>
              <Box className="text-sm font-bold mb-2">TAX DETAILS</Box>
              <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>
              {taxDetails.map((tax, index) => (
                <Box key={index} className="mb-2">
                  <Box className="flex justify-between text-sm mb-1">
                    <span>{tax.title} :</span>
                    <span>${tax.taxAmount.toFixed(2)}</span>
                  </Box>
                  <Box className="flex justify-between text-sm mb-1">
                    <span className="ml-4">Sales Amount :</span>
                    <span>${tax.salesAmount.toFixed(2)}</span>
                  </Box>
                </Box>
              ))}
              <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>
            </>
          )}

          {/* Tender Payment Summary */}
          <Box className="text-sm font-bold mb-2">TENDER PAYMENT SUMMARY</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Cash :</span>
            <span>${tenderSummary.cash.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-lg font-bold mb-1">
            <span>Grand Total :</span>
            <span>${tenderSummary.grandTotal.toFixed(2)}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Lottery Summary */}
          <Box className="text-sm font-bold mb-2">LOTTERY SUMMARY</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Lotto Online :</span>
            <span>${lotterySummary.lottoOnline.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Lotto Payout :</span>
            <span>${lotterySummary.lottoPayout.toFixed(2)}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Statistics Summary */}
          <Box className="text-sm font-bold mb-2">STATISTICS SUMMARY</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          {statistics.map((stat, index) => (
            <Box key={index} className="flex justify-between text-sm mb-1">
              <span>{stat.title} :</span>
              <Box>
                <span className="inline-block w-12 text-center">Count: {stat.count}</span>
                <span className="inline-block w-20 text-right ml-4">${stat.amount.toFixed(2)}</span>
              </Box>
            </Box>
          ))}

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* Cash Deposits */}
          <Box className="text-sm font-bold mb-2">CASH DEPOSITS</Box>
          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Opening Balance(+) :</span>
            <span>${cashDeposits.openingBalance.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Cash Collected(+) :</span>
            <span>${cashDeposits.cashCollected.toFixed(2)}</span>
          </Box>
        </Box>

        {/* Buttons */}
        <Box className="flex justify-center gap-4 mt-6 no-print">
          <Button
            variant="contained"
            onClick={handleCloseReportDialog}
            sx={{
              backgroundColor: '#8b0000',
              '&:hover': { backgroundColor: '#6b0000' },
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '16px',
              px: 8,
              py: 1.5,
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintReport}
            sx={{
              backgroundColor: '#8b0000',
              '&:hover': { backgroundColor: '#6b0000' },
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '16px',
              px: 8,
              py: 1.5,
            }}
          >
            Print
          </Button>
        </Box>
      </Box>
    </Dialog>
    </>
  );
};

const InputField = ({ label, value, onChange, readOnly = false, bgColor = 'white', textColor = '#000' }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography
        sx={{
          fontSize: '13px',
          color: '#000',
          fontWeight: 600,
          minWidth: '180px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>:</Typography>
      <KeyboardTextField
        value={typeof value === 'number' ? `$${value.toFixed(2)}` : value}
        onChange={(e) => {
          if (!readOnly && onChange) {
            const val = parseFloat(e.target.value.replace('$', '')) || 0;
            onChange(val);
          }
        }}
        disabled={readOnly}
        size="small"
        sx={{
          flex: 1,
          maxWidth: '160px',
          '& .MuiOutlinedInput-root': {
            height: '42px',
            fontSize: '14px',
            fontWeight: 600,
            bgcolor: bgColor,
            color: textColor,
            '& input': {
              textAlign: 'center',
            },
          },
        }}
      />
    </Box>
  );
};

const CoinInputField = ({ label, denomination, count, onCountChange, amount }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: '12px',
            color: '#000',
            fontWeight: 600,
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '11px',
            color: '#666',
            fontWeight: 500,
          }}
        >
          {denomination}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>:</Typography>
      <KeyboardTextField
        value={count}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          onCountChange(val);
        }}
        type="number"
        size="small"
        sx={{
          width: '70px',
          '& .MuiOutlinedInput-root': {
            height: '38px',
            fontSize: '13px',
            bgcolor: 'white',
            '& input': {
              textAlign: 'center',
              padding: '8px',
            },
          },
        }}
      />
      <KeyboardTextField
        value={`$${amount.toFixed(2)}`}
        disabled
        size="small"
        sx={{
          width: '90px',
          '& .MuiOutlinedInput-root': {
            height: '38px',
            fontSize: '13px',
            bgcolor: 'white',
            '& input': {
              textAlign: 'center',
              padding: '8px',
            },
          },
        }}
      />
    </Box>
  );
};

export default ClosingDrawerDialog;
