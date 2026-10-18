import { Box, InputAdornment, IconButton, Radio, RadioGroup, FormControlLabel, Button, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import {
  GridView,
  Cancel,
  Search,
  Print,
} from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import AdvancedFilterModal from './components/AdvancedFilterModal';
import PrintReceiptModal from './components/PrintReceiptModal';
import { useGetOrdersQuery } from 'services/orderSlice';
import { formatOrderStatus, getOrderStatusColor, getOrderStatusBgColor } from 'constants/orderStatus';

const CashRegisterRePrint = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('BARCODE');
  const [registerType, setRegisterType] = useState('current');
  const [anchorEl, setAnchorEl] = useState(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const {
    data: ordersData = [],
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    error: ordersError,
  } = useGetOrdersQuery();

  const errorMessage = useMemo(() => {
    if (!isOrdersError) return '';
    return (
      ordersError?.data?.detail ||
      ordersError?.data?.message ||
      ordersError?.data ||
      ordersError?.error ||
      'Unable to load orders right now.'
    );
  }, [isOrdersError, ordersError]);

  const formatDisplayDate = useCallback((value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return value;
  }, []);

  const mapOrderToTransaction = useCallback(
    (order) => {
      const toNumber = (val, fallback = 0) => {
        const num = Number(val);
        return Number.isFinite(num) ? num : fallback;
      };

      const items = Array.isArray(order?.items) ? order.items : [];
      const subtotalFromItems = items.reduce(
        (sum, item) => sum + toNumber(item?.total_amount),
        0
      );
      const subtotal = toNumber(order?.sub_total, subtotalFromItems);
      const tax = toNumber(order?.tax);
      const surcharge = toNumber(order?.surcharge);
      const discount = toNumber(order?.discount_value);
      const computedTotal = subtotal - discount + tax + surcharge;
      const total = toNumber(
        order?.total ?? order?.total_amount ?? order?.payment?.amount,
        Number.isFinite(computedTotal) ? computedTotal : 0
      );

      const mappedItems = items.map((item) => {
        const unitPrice = toNumber(
          item?.price ?? item?.item?.retail_price ?? item?.total_amount
        );
        return {
          name:
            item?.item?.name ??
            item?.name ??
            (item?.item_id ? `Item ${item.item_id}` : 'Unknown Item'),
          qty: toNumber(item?.qty ?? item?.quantity),
          price: unitPrice.toFixed(2),
        };
      });

      const paymentTypeSource =
        order?.payment_type ?? order?.payment?.method ?? 'N/A';

      const orderStatus = order?.status ?? order?.order_status ?? 'completed';
      const formattedStatus = formatOrderStatus(orderStatus);

      return {
        id: order?.id ?? crypto.randomUUID(),
        barcode:
          order?.order_number ??
          order?.receipt_number ??
          `ORDER-${order?.id ?? ''}`,
        date: order?.order_date ?? null,
        displayDate: formatDisplayDate(order?.order_date),
        salesDate: order?.sales_date ?? order?.order_date ?? null,
        subtotal,
        tax,
        surcharge,
        discount,
        total,
        customer: order?.customer ? {
          id: order.customer.id ?? null,
          name: order.customer.name ?? 'N/A',
          email: order.customer.email ?? 'N/A',
          phone: order.customer.phone ?? 'N/A',
          points: order.customer.points ?? '0',
        } : {
          id: null,
          name: 'N/A',
          email: 'N/A',
          phone: 'N/A',
          points: '0',
        },
        customerName: order?.customer?.name ?? 'N/A',
        paymentType: paymentTypeSource.toString().replace(/_/g, ' ').toUpperCase(),
        status: orderStatus,
        formattedStatus: formattedStatus,
        items: mappedItems,
      };
    },
    [formatDisplayDate]
  );

  const transactions = useMemo(() => {
    if (!Array.isArray(ordersData)) return [];
    return ordersData.map(mapOrderToTransaction);
  }, [ordersData, mapOrderToTransaction]);

  const searchOptions = [
    'BARCODE',
    'CUSTOMER NAME',
    'CUSTOMER MOBILE NUMBER',
    'LAST 4 DIGITS',
    'CARD HOLDER NAME',
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option) => {
    setAnchorEl(null);
    if (option) {
      setSearchType(option);
    }
  };

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return transactions;

    return transactions.filter((transaction) => {
      switch (searchType) {
        case 'BARCODE':
          return transaction.barcode?.toLowerCase().includes(normalizedSearch);
        case 'CUSTOMER NAME':
          return transaction.customerName?.toLowerCase().includes(normalizedSearch);
        case 'LAST 4 DIGITS':
          return transaction.barcode?.slice(-4).includes(normalizedSearch);
        default:
          return true;
      }
    });
  }, [searchType, searchValue, transactions]);

  const handlePrint = useCallback((transaction) => {
    if (!transaction) return;
    setSelectedTransaction({
      ...transaction,
      date: transaction.date ?? transaction.displayDate,
      salesDate: transaction.salesDate ?? transaction.date ?? transaction.displayDate,
    });
    setPrintModalOpen(true);
  }, []);

  const handleSearch = () => {
    console.log('Searching:', searchType, searchValue);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setSearchType('BARCODE');
    setRegisterType('current');
  };

  return (
    <Box
      className="min-h-screen bg-white"
      sx={{
        border: '6px solid #3b82f6',
        m: 0,
        p: 0,
      }}
    >
      <Box className="p-6" sx={{ backgroundColor: '#f5f5f5' }}>
        <Box className="p-6 mb-4 bg-white shadow-sm rounded">
          <Box className="flex items-center gap-4">
            <Box className="relative w-[400px]">
              <KeyboardTextField
                fullWidth
                placeholder="Barcode"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={handleMenuOpen} edge="start" sx={{ p: 0.5 }}>
                        <GridView sx={{ fontSize: 24, color: '#f59e0b' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: searchValue && (
                    <InputAdornment position="end">
                      <IconButton edge="end" sx={{ p: 0.5 }} onClick={() => setSearchValue('')}>
                        <Cancel sx={{ fontSize: 24, color: '#dc2626' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc2626',
                    },
                  },
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleMenuClose()}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    mt: 0.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    minWidth: '280px',
                  },
                }}
              >
                {searchOptions.map((option) => (
                  <MenuItem
                    key={option}
                    onClick={() => handleMenuClose(option)}
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      py: 1.5,
                      px: 3,
                      color: '#1f2937',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                backgroundColor: '#dc2626',
                '&:hover': { backgroundColor: '#b91c1c' },
                minWidth: '80px',
                height: '56px',
                boxShadow: 'none',
                borderRadius: '4px',
              }}
            >
              <Search sx={{ fontSize: 28, color: 'white' }} />
            </Button>

            <RadioGroup
              row
              value={registerType}
              onChange={(e) => setRegisterType(e.target.value)}
              sx={{ ml: 4 }}
            >
              <FormControlLabel
                value="current"
                control={
                  <Radio
                    sx={{
                      color: '#dc2626',
                      '&.Mui-checked': { color: '#dc2626' },
                    }}
                  />
                }
                label={
                  <span className="font-bold text-[15px] text-gray-800">
                    CURRENT REGISTER
                  </span>
                }
              />
              <FormControlLabel
                value="all"
                control={
                  <Radio
                    sx={{
                      color: '#dc2626',
                      '&.Mui-checked': { color: '#dc2626' },
                    }}
                  />
                }
                label={
                  <span className="font-bold text-[15px] text-gray-800">
                    ALL REGISTER
                  </span>
                }
                sx={{ ml: 2 }}
              />
            </RadioGroup>

            <Box className="ml-auto flex gap-4">
              <Button
                variant="contained"
                onClick={handleResetFilters}
                sx={{
                  backgroundColor: '#b91c1c',
                  '&:hover': { backgroundColor: '#991b1b' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  px: 4,
                  height: '48px',
                  boxShadow: 'none',
                  borderRadius: '4px',
                }}
              >
                RESET FILTERS
              </Button>
              <Button
                variant="contained"
                onClick={() => setAdvancedFilterOpen(true)}
                sx={{
                  backgroundColor: '#b91c1c',
                  '&:hover': { backgroundColor: '#991b1b' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  px: 4,
                  height: '48px',
                  boxShadow: 'none',
                  borderRadius: '4px',
                }}
              >
                ADVANCE FILTER
              </Button>
            </Box>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            border: '3px solid #1f2937',
            boxShadow: 'none',
            borderRadius: 0,
            maxHeight: 'calc(100vh - 300px)',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  BARCODE
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  TRANSACTION DATE
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  SUBTOTAL
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  TAX
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  DISCOUNT
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  TOTAL
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  CUSTOMER
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  PAYMENT TYPE
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  STATUS
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >

                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isOrdersFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    sx={{
                      textAlign: 'center',
                      fontSize: '14px',
                      padding: '24px',
                      color: '#1f2937',
                    }}
                  >
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    sx={{
                      textAlign: 'center',
                      fontSize: '14px',
                      padding: '24px',
                      color: '#b91c1c',
                    }}
                  >
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    sx={{
                      textAlign: 'center',
                      fontSize: '14px',
                      padding: '24px',
                      color: '#1f2937',
                    }}
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: '2px solid #1f2937',
                    }}
                  >
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      {transaction.barcode}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      {transaction.displayDate}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      ${transaction.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      ${transaction.tax.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      ${transaction.discount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      ${transaction.total.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      {transaction.customerName}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      {transaction.paymentType}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '2px solid #e5e7eb',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#1f2937',
                        padding: '16px',
                      }}
                    >
                      <Chip
                        label={transaction.formattedStatus || formatOrderStatus(transaction.status)}
                        sx={{
                          backgroundColor: getOrderStatusBgColor(transaction.status),
                          color: getOrderStatusColor(transaction.status),
                          fontWeight: 600,
                          fontSize: '12px',
                          height: '28px',
                          border: `1px solid ${getOrderStatusColor(transaction.status)}`,
                          '& .MuiChip-label': {
                            padding: '0 8px',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '14px',
                        color: '#1f2937',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handlePrint(transaction)}
                        sx={{ color: '#1f2937' }}
                      >
                        <Print />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AdvancedFilterModal
        open={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
      />

      <PrintReceiptModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        transaction={selectedTransaction}
      />
    </Box>
  );
};

export default CashRegisterRePrint;
