import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { useGetOrdersQuery } from "services/orderSlice";
import useSnackbar from "hooks/useSnackbar";
import Loader from "components/elements/Loader/Loader";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, startOfDay, endOfDay, parseISO, startOfMonth } from "date-fns";

const RevenueReport = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  
  // Date range state
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  
  // Prepare query params for date filtering
  const queryParams = useMemo(() => {
    if (!startDate || !endDate) return {};
    
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    
    return {
      start_date: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end_date: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
    };
  }, [startDate, endDate]);

  const {
    data: ordersData = [],
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    error: ordersError,
  } = useGetOrdersQuery(queryParams);

  const errorMessage = useMemo(() => {
    if (!isOrdersError) return "";
    return (
      ordersError?.data?.detail ||
      ordersError?.data?.message ||
      ordersError?.data ||
      ordersError?.error ||
      "Unable to load orders right now."
    );
  }, [isOrdersError, ordersError]);

  const formatDisplayDate = useCallback((value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return value;
  }, []);

  const toNumber = useCallback((val, fallback = 0) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  }, []);

  const calculateTotals = useMemo(() => {
    if (!Array.isArray(ordersData)) return { total: 0, tax: 0, discount: 0, count: 0, subtotal: 0 };

    const totals = ordersData.reduce(
      (acc, order) => {
        const subtotal = toNumber(order?.sub_total, 0);
        const tax = toNumber(order?.tax, 0);
        const discount = toNumber(order?.discount_value, 0);
        const total = toNumber(order?.total ?? order?.total_amount, subtotal - discount + tax);

        return {
          total: acc.total + total,
          tax: acc.tax + tax,
          discount: acc.discount + discount,
          subtotal: acc.subtotal + subtotal,
          count: acc.count + 1,
        };
      },
      { total: 0, tax: 0, discount: 0, subtotal: 0, count: 0 }
    );

    return totals;
  }, [ordersData, toNumber]);

  // Daily Revenue Trend Chart Data
  const dailyRevenueTrend = useMemo(() => {
    if (!Array.isArray(ordersData) || !startDate || !endDate) return [];

    const dailyData = {};
    const currentDate = new Date(startDate);
    
    // Initialize all dates in range with zero values
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'MMM dd');
      dailyData[dateKey] = {
        date: dateKey,
        dateObj: new Date(currentDate),
        Revenue: 0,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    ordersData.forEach((order) => {
      if (!order?.order_date) return;
      
      try {
        const orderDate = parseISO(order.order_date);
        const dateKey = format(orderDate, 'MMM dd');
        
        if (dailyData[dateKey]) {
          const subtotal = toNumber(order?.sub_total, 0);
          const tax = toNumber(order?.tax, 0);
          const discount = toNumber(order?.discount_value, 0);
          const total = toNumber(order?.total ?? order?.total_amount, subtotal - discount + tax);

          dailyData[dateKey].Revenue += total;
        }
      } catch (error) {
        console.error('Error parsing order date:', error);
      }
    });

    return Object.values(dailyData)
      .sort((a, b) => a.dateObj - b.dateObj)
      .map(item => ({
        date: item.date,
        Revenue: parseFloat(item.Revenue.toFixed(2)),
      }));
  }, [ordersData, startDate, endDate, toNumber]);

  // Revenue by Category Chart Data (Subtotal, Tax, Discount)
  const revenueByCategory = useMemo(() => {
    const totals = calculateTotals;
    
    return [
      {
        name: "Subtotal",
        value: parseFloat(totals.subtotal.toFixed(2)),
        color: "#22c55e", // green
      },
      {
        name: "Tax",
        value: parseFloat(totals.tax.toFixed(2)),
        color: "#3b82f6", // blue
      },
      {
        name: "Discount",
        value: parseFloat(totals.discount.toFixed(2)),
        color: "#f59e0b", // yellow/orange
      },
    ].filter(item => item.value > 0);
  }, [calculateTotals]);


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        className="bg-white"
        sx={{
          m: 0,
          p: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box className="p-6" sx={{ backgroundColor: "#f5f5f5", overflowY: "auto", flex: 1 }}>
          {/* Header Row: Back button, Title (50%), and Date Filter (50%) */}
          <Box className="mb-4" display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/reports")}
              sx={{
                backgroundColor: "#8b3735",
                color: "white",
                width: 48,
                height: 48,
                borderRadius: "50px",
                "&:hover": { backgroundColor: "#7a2f2d" },
                flexShrink: 0,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            {/* Revenue Report Title - 50% width */}
            <Box sx={{ width: "calc(50% - 16px)", display: "flex", alignItems: "center" }}>
              <Box
                component="h2"
                className="text-[24px] font-bold leading-[1.5] text-[#b01d39] uppercase"
              >
                Revenue Report
              </Box>
            </Box>
            {/* Date Filter Section - 50% width */}
            <Box sx={{ width: "calc(50% - 16px)", display: "flex", justifyContent: "flex-end" }}>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: KeyboardTextField }}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 150 },
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  to
                </Typography>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: KeyboardTextField }}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 150 },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Summary Section */}
          <Box className="mb-4">
            <Box className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Box className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Total Transactions
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#1f2937" }}>
                  {calculateTotals.count}
                </Typography>
              </Box>
              <Box className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Total Revenue
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#1f2937" }}>
                  ${calculateTotals.total.toFixed(2)}
                </Typography>
              </Box>
              <Box className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Total Tax
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#1f2937" }}>
                  ${calculateTotals.tax.toFixed(2)}
                </Typography>
              </Box>
              <Box className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Total Discount
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#1f2937" }}>
                  ${calculateTotals.discount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Charts Section */}
          <Box className="mb-4">
            {/* Daily Revenue Trend and Revenue by Category - 50% each */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper className="p-5 rounded-xl shadow-sm bg-white" sx={{ height: "100%" }}>
                  <Typography variant="h6" fontWeight={600} className="mb-4">
                    Daily Revenue Trend
                  </Typography>
                  <Box sx={{ width: "100%", height: 350, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyRevenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Revenue" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper className="p-5 rounded-xl shadow-sm bg-white" sx={{ height: "100%" }}>
                  <Typography variant="h6" fontWeight={600} className="mb-4">
                    Revenue by Category
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: 350, minWidth: 0 }}>
                    <Box sx={{ width: "50%", height: "100%", minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => {
                              if (percent < 0.05) return ''; // Hide label for very small slices
                              return `${(percent * 100).toFixed(1)}%`;
                            }}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {revenueByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box className="ml-6">
                      {revenueByCategory.map((item, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} mb={2}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: item.color,
                              borderRadius: "4px",
                            }}
                          />
                          <Typography variant="body2">
                            {item.name}: ${item.value.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Recent Transactions Table */}
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "calc(100vh - 400px)",
              overflow: "auto",
            }}
          >
            <Table sx={{ minWidth: 650 }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      padding: "16px",
                    }}
                  >
                    Order ID
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      padding: "16px",
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      padding: "16px",
                    }}
                  >
                    Subtotal
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      padding: "16px",
                    }}
                  >
                    Tax
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      padding: "16px",
                    }}
                  >
                    Discount
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "13px",
                      padding: "16px",
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isOrdersFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", padding: "24px" }}>
                      <Loader />
                    </TableCell>
                  </TableRow>
                ) : errorMessage ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        textAlign: "center",
                        fontSize: "14px",
                        padding: "24px",
                        color: "#b91c1c",
                      }}
                    >
                      {errorMessage}
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(ordersData) || ordersData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        textAlign: "center",
                        fontSize: "14px",
                        padding: "24px",
                        color: "#1f2937",
                      }}
                    >
                      No revenue data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersData.map((order) => {
                    const subtotal = toNumber(order?.sub_total, 0);
                    const tax = toNumber(order?.tax, 0);
                    const discount = toNumber(order?.discount_value, 0);
                    const total = toNumber(
                      order?.total ?? order?.total_amount,
                      subtotal - discount + tax
                    );

                    return (
                      <TableRow
                        key={order.id}
                        sx={{
                          "&:hover": { backgroundColor: "#f9fafb" },
                          borderBottom: "2px solid #1f2937",
                        }}
                      >
                        <TableCell
                          sx={{
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "14px",
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          {order.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "14px",
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          {formatDisplayDate(order?.order_date)}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "14px",
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          ${subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "14px",
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          ${tax.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "14px",
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          ${discount.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1f2937",
                            padding: "16px",
                          }}
                        >
                          ${total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default RevenueReport;

