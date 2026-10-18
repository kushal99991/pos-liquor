import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Language } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useLazyGetEndShiftReportQuery } from 'services/orderSlice';
import { useLazyGetActiveStoresQuery } from 'services/storeSlice';
import { useSelector } from 'react-redux';
import useSnackbar from 'hooks/useSnackbar';
import ClosingDrawerDialog from './ClosingDrawerDialog';

const EndShiftDialog = ({ open, onClose }) => {
  const { openSnackbar } = useSnackbar();
  const storeId = useSelector((state) => state.pos.installation.storeId);
  // Get login time from localStorage or use current time as fallback
  const getLoginTime = () => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // If login_time is stored, use it; otherwise use current time
        if (session.login_time) {
          return new Date(session.login_time);
        }
      } catch (e) {
        console.error("Error parsing session data:", e);
      }
    }
    // Fallback: if no login time found, check if there's a stored timestamp
    const loginTimestamp = localStorage.getItem("login_time");
    if (loginTimestamp) {
      return new Date(parseInt(loginTimestamp));
    }
    return new Date(); // Fallback to current time
  };

  const [startDate, setStartDate] = useState(getLoginTime());
  const [endDate, setEndDate] = useState(new Date());
  const [batch, setBatch] = useState('');
  const [register, setRegister] = useState('');
  const [openClosingDrawer, setOpenClosingDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [getEndShiftReport] = useLazyGetEndShiftReportQuery();
  const [getActiveStores] = useLazyGetActiveStoresQuery();
  const [stores, setStores] = useState([]);

  // Fetch stores when dialog opens and set dates
  useEffect(() => {
    if (open) {
      fetchStores();
      // Set START DATE to login time and END DATE to current time
      setStartDate(getLoginTime());
      setEndDate(new Date());
    }
  }, [open]);

  const fetchStores = async () => {
    try {
      const response = await getActiveStores();
      if (response?.data) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  // Extract data from API response
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

  const handleViewReport = async () => {
    if (!storeId) {
      openSnackbar('Store ID is required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Format dates as YYYY-MM-DD HH:MM:SS
      const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const params = {
        start_datetime: formatDateTime(startDate),
        end_datetime: formatDateTime(endDate),
        store_id: register || storeId,
      };

      const response = await getEndShiftReport(params);

      if (response?.error) {
        openSnackbar(response.error?.data?.detail || 'Failed to fetch end shift report', 'error');
        setReportData(null);
      } else {
        setReportData(response?.data || null);
        openSnackbar('Report loaded successfully', 'success');
        // Don't open the report dialog here - it will open from ClosingDrawerDialog Print button
      }
    } catch (error) {
      console.error('Error fetching end shift report:', error);
      openSnackbar('Failed to fetch end shift report', 'error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndShift = () => {
    setOpenClosingDrawer(true);
  };

  const handleCloseClosingDrawer = () => {
    setOpenClosingDrawer(false);
  };

  const handleFinalEndShift = () => {
    setOpenClosingDrawer(false);
    onClose();
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#f5f5f5',
            borderRadius: 0,
            maxHeight: '100vh',
            height: '100vh',
            maxWidth: '100vw',
            overflow: 'hidden',
            m: 0,
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
              py: 2,
              bgcolor: '#f5f5f5',
              minHeight: '70px',
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: '#8b1538',
                color: 'white',
                width: 48,
                height: 48,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: '#6d0f2a',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '28px',
                color: '#000000',
                letterSpacing: '1px',
              }}
            >
              GLORY<span style={{ color: '#8b1538' }}>POS</span>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: '#000', fontSize: '20px', fontWeight: 700 }}>
                {batch}
              </Typography>
              <IconButton
                sx={{
                  bgcolor: '#000',
                  color: 'white',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: '#333',
                  },
                }}
              >
                <Language />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: 'white',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#8b1538',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    START DATE
                  </Typography>
                  <DateTimePicker
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '40px',
                        fontSize: '13px',
                        bgcolor: 'white',
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#8b1538',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    END DATE
                  </Typography>
                  <DateTimePicker
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '40px',
                        fontSize: '13px',
                        bgcolor: 'white',
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#8b1538',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    BATCH
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      sx={{
                        height: '40px',
                        fontSize: '13px',
                        bgcolor: 'white',
                      }}
                    >
                      <MenuItem value="19" sx={{ fontSize: '13px' }}>19</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#8b1538',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    REGISTER
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={register}
                      onChange={(e) => setRegister(e.target.value)}
                      displayEmpty
                      sx={{
                        height: '40px',
                        fontSize: '13px',
                        bgcolor: 'white',
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: '13px', fontStyle: 'italic', color: '#999' }}>
                        &lt; Select Register &gt;
                      </MenuItem>
                      {stores.map((store) => (
                        <MenuItem key={store.id} value={store.id} sx={{ fontSize: '13px' }}>
                          {store.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1.75 }}>
                <Button
                  variant="contained"
                  onClick={handleViewReport}
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    bgcolor: '#8b1538',
                    color: 'white',
                    height: '40px',
                    fontSize: '13px',
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
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'VIEW REPORT'}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1.75 }}>
                <Button
                  variant="contained"
                  onClick={handleEndShift}
                  fullWidth
                  sx={{
                    bgcolor: '#8b1538',
                    color: 'white',
                    height: '40px',
                    fontSize: '13px',
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
                  END SHIFT
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2.5,
              bgcolor: 'white',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            <Grid container spacing={1.5}>
              {[
                { label: 'GROSS RECEIVED', value: summaryData.grossReceived },
                { label: 'TOTAL TAX', value: summaryData.totalTax },
                { label: 'NET REVENUE', value: summaryData.netRevenue },
                { label: 'TOTAL CARD', value: summaryData.totalCard },
                { label: 'TOTAL CASH', value: summaryData.totalCash },
                { label: 'TOTAL EBT', value: summaryData.totalEBT },
                { label: 'TOTAL DISCOUNT', value: summaryData.totalDiscount },
              ].map((card, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 1.714 }} key={index}>
                  <Box
                    sx={{
                      bgcolor: '#8b1538',
                      color: 'white',
                      p: 2,
                      textAlign: 'center',
                      borderRadius: '6px',
                      minHeight: '90px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      ${card.value.toFixed(2)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        lineHeight: 1.3,
                      }}
                    >
                      {card.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2.5,
              overflowY: 'auto',
              flex: 1,
              bgcolor: '#f5f5f5',
            }}
          >
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    SALES SUMMARY
                  </Typography>
                  <Box>
                    <SummaryRow label="TAXABLE" value={salesSummary.taxable} />
                    <SummaryRow label="NON-TAXABLE" value={salesSummary.nonTaxable} />
                    <SummaryRow label="NON REVENUE" value={salesSummary.nonRevenue} />
                    <SummaryRow
                      label="NET REVENUE"
                      value={salesSummary.netRevenue}
                      highlighted
                    />
                    <SummaryRow label="TOTAL TAX AMOUNT" value={salesSummary.totalTaxAmount} />
                    <SummaryRow
                      label="TOTAL CARD SURCHARGE"
                      value={salesSummary.totalCardSurcharge}
                    />
                    <SummaryRow
                      label="TOTAL ITEM SURCHARGE"
                      value={salesSummary.totalItemSurcharge}
                    />
                    <SummaryRow label="TOTAL DISCOUNT" value={salesSummary.totalDiscount} />
                    <SummaryRow label="GROSS RECEIVED" value={salesSummary.grossReceived} />
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    TAX DETAILS
                  </Typography>
                  <TableContainer>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#000' }}>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            TITLE
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            SALES AMOUNT
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            TAX AMOUNT ($)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {taxDetails.map((tax, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: '13px', py: 1.5, px: 1.5 }}>
                              {tax.title}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '13px', py: 1.5, px: 1.5 }}>
                              ${tax.salesAmount.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '13px', py: 1.5, px: 1.5 }}>
                              ${tax.taxAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    TENDER PAYMENT SUMMARY
                  </Typography>
                  <Box>
                    <SummaryRow label="CASH" value={tenderSummary.cash} />
                    <SummaryRow
                      label="GRAND TOTAL"
                      value={tenderSummary.grandTotal}
                      highlighted
                    />
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    LOTTERY SUMMARY
                  </Typography>
                  <Box>
                    <SummaryRow label="LOTTO ONLINE" value={lotterySummary.lottoOnline} />
                    <SummaryRow label="LOTTO PAYOUT" value={lotterySummary.lottoPayout} />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    STATISTICS SUMMARY
                  </Typography>
                  <TableContainer>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#000' }}>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            TITLE
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            COUNT
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: '11px',
                              py: 1.5,
                              px: 1.5,
                              borderBottom: '2px solid #e0e0e0',
                              color: 'white',
                              textTransform: 'uppercase',
                            }}
                          >
                            AMOUNT
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistics.map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: '12px', py: 0.75, px: 1.5 }}>
                              {stat.title}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: '12px', py: 0.75, px: 1.5 }}>
                              {stat.count}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '12px', py: 0.75, px: 1.5 }}>
                              ${stat.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '14px',
                      color: '#8b1538',
                      textTransform: 'uppercase',
                    }}
                  >
                    CASH DEPOSITS
                  </Typography>
                  <Box>
                    <SummaryRow
                      label="OPENING BALANCE(+)"
                      value={cashDeposits.openingBalance}
                    />
                    <SummaryRow
                      label="CASH COLLECTED(+)"
                      value={cashDeposits.cashCollected}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <ClosingDrawerDialog
        open={openClosingDrawer}
        onClose={handleCloseClosingDrawer}
        onEndShift={handleFinalEndShift}
        closingDrawerReconciliation={reportData?.closing_drawer_reconciliation}
        startDate={startDate}
        endDate={endDate}
        storeId={register || storeId}
        reportData={reportData}
        stores={stores}
        batch={batch}
      />
    </LocalizationProvider>
  );
};

const SummaryRow = ({ label, value, highlighted = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.2,
        px: 0,
        bgcolor: highlighted ? 'transparent' : 'transparent',
        borderRadius: 0,
        mb: 0.5,
      }}
    >
      <Typography
        sx={{
          fontSize: '13px',
          color: '#333',
          fontWeight: highlighted ? 700 : 500,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '13px',
          color: '#333',
          fontWeight: highlighted ? 700 : 600,
        }}
      >
        ${value.toFixed(2)}
      </Typography>
    </Box>
  );
};

export default EndShiftDialog;
