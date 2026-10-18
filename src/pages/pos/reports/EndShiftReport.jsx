import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { useLazyGetShiftReportQuery } from "services/shiftSlice";
import { useSelector } from "react-redux";
import useSnackbar from "hooks/useSnackbar";
import Loader from "components/elements/Loader/Loader";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const EndShiftReport = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const storeId = useSelector((state) => state.pos.installation.storeId);
  const [shiftData, setShiftData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const [getShiftReport] = useLazyGetShiftReportQuery();

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format dates for API - use start of day for start, end of day for end
  const getFormattedDates = useCallback(() => {
    if (!startDate || !endDate) return { start: "", end: "" };
    
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    
    return {
      start: formatDateTime(start),
      end: formatDateTime(end),
    };
  }, [startDate, endDate]);

  const fetchDailyData = useCallback(async (start, end) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const days = [];
    const currentDate = new Date(startDateObj);
    
    // Get all days in the range
    while (currentDate <= endDateObj) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      days.push({
        date: new Date(currentDate),
        start: formatDateTime(dayStart),
        end: formatDateTime(dayEnd),
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch data for each day
    const dailyPromises = days.map(async (day) => {
      try {
        const response = await getShiftReport({
          start_date: day.start,
          end_date: day.end,
        });
        
        if (response?.error || !response?.data) {
          return {
            dateObj: new Date(day.date), // Keep original date for sorting
            date: day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            net_revenue: 0,
            gross_received: 0,
            cash_collected: 0,
            total_tax_amount: 0,
            total_discount: 0,
          };
        }
        
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        return {
          dateObj: new Date(day.date), // Keep original date for sorting
          date: day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          net_revenue: parseFloat(data?.net_revenue || 0),
          gross_received: parseFloat(data?.gross_received || 0),
          cash_collected: parseFloat(data?.cash_collected || 0),
          total_tax_amount: parseFloat(data?.total_tax_amount || 0),
          total_discount: parseFloat(data?.total_discount || 0),
        };
      } catch (error) {
        return {
          dateObj: new Date(day.date), // Keep original date for sorting
          date: day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          net_revenue: 0,
          gross_received: 0,
          cash_collected: 0,
          total_tax_amount: 0,
          total_discount: 0,
        };
      }
    });

    const dailyResults = await Promise.all(dailyPromises);
    // Sort by date chronologically (ascending order)
    const sortedData = dailyResults.sort((a, b) => {
      return a.dateObj.getTime() - b.dateObj.getTime();
    });
    
    setDailyData(sortedData);
  }, [getShiftReport]);

  const fetchShiftReport = useCallback(async () => {
    if (!startDate || !endDate) {
      return;
    }

    setIsLoading(true);
    try {
      const { start, end } = getFormattedDates();
      const response = await getShiftReport({
        start_date: start,
        end_date: end,
      });

      if (response?.error) {
        openSnackbar(
          response?.error?.data?.detail ||
            response?.error?.data?.message ||
            "Failed to fetch shift report",
          "error"
        );
        setShiftData(null);
        setDailyData([]);
      } else {
        // Handle array response - API returns array with one object
        const data = response?.data;
        if (Array.isArray(data) && data.length > 0) {
          setShiftData(data[0]);
        } else if (data && typeof data === 'object') {
          setShiftData(data);
        } else {
          setShiftData(null);
        }
        
        // Fetch daily breakdown
        await fetchDailyData(start, end);
      }
    } catch (error) {
      openSnackbar("An error occurred while fetching shift report", "error");
      setShiftData(null);
      setDailyData([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, getShiftReport, openSnackbar, fetchDailyData, getFormattedDates]);

  // Auto-generate report on initial load and when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchShiftReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return dateStr;
  };

  const formatCurrency = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  // Prepare pie chart data for payment methods
  const paymentMethodData = useMemo(() => {
    if (!shiftData) return [];
    const cash = parseFloat(shiftData.cash_collected || 0);
    const gross = parseFloat(shiftData.gross_received || 0);
    const other = Math.max(0, gross - cash);
    
    return [
      { name: "Cash", value: cash },
      { name: "Other Payment Methods", value: other },
    ];
  }, [shiftData]);

  const COLORS = ["#00C4FF", "#0088FE"];

  // Prepare stats for main chart
  const stats = useMemo(() => {
    if (!shiftData) return [];
    return [
      {
        title: "Net Revenue",
        amount: formatCurrency(shiftData.net_revenue),
      },
      {
        title: "Tax",
        amount: formatCurrency(shiftData.total_tax_amount),
      },
      {
        title: "Gross Received",
        amount: formatCurrency(shiftData.gross_received),
      },
    ];
  }, [shiftData]);

  // Prepare discount impact trend data
  const discountTrendData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];
    return dailyData.map(d => ({
      date: d.date,
      discount: d.total_discount || 0,
    }));
  }, [dailyData]);

  // Calculate total discount
  const totalDiscount = useMemo(() => {
    return discountTrendData.reduce((sum, item) => sum + item.discount, 0);
  }, [discountTrendData]);

  // Prepare top days by net revenue (horizontal bar chart data)
  const topDaysData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];
    // Sort by net_revenue descending and take top 5
    return [...dailyData]
      .sort((a, b) => b.net_revenue - a.net_revenue)
      .slice(0, 5)
      .map((d, index) => ({
        date: d.date,
        net_revenue: d.net_revenue || 0,
        isTop: index === 0, // First one is the top
      }));
  }, [dailyData]);

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
            {/* End Shift Report Title - 50% width */}
            <Box sx={{ width: "calc(50% - 16px)", display: "flex", alignItems: "center" }}>
              <Box
                component="h2"
                className="text-[24px] font-bold leading-[1.5] text-[#b01d39] uppercase"
              >
                End Shift Report
              </Box>
            </Box>
            {/* Date Filter Section - 50% width */}
            <Box sx={{ width: "calc(50% - 16px)", display: "flex", justifyContent: "flex-end", gap: 2, alignItems: "center" }}>
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

        {isLoading ? (
          <Box className="flex justify-center items-center p-8">
            <Loader />
          </Box>
        ) : shiftData ? (
          <Box>
            {/* Summary Cards */}
            <Box className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Paper
                elevation={2}
                className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between"
              >
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Gross Received
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: "#1f2937" }}>
                  {formatCurrency(shiftData.gross_received)}
                </Typography>
              </Paper>
              <Paper
                elevation={2}
                className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between"
              >
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Net Revenue
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: "#1f2937" }}>
                  {formatCurrency(shiftData.net_revenue)}
                </Typography>
              </Paper>
              <Paper
                elevation={2}
                className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between"
              >
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Total Tax Amount
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: "#1f2937" }}>
                  {formatCurrency(shiftData.total_tax_amount)}
                </Typography>
              </Paper>
              <Paper
                elevation={2}
                className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center justify-between"
              >
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Cash Collected
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: "#1f2937" }}>
                  {formatCurrency(shiftData.cash_collected)}
                </Typography>
              </Paper>
            </Box>

            {/* Charts Section */}
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Main Revenue Chart - Full Width */}
              <Box sx={{ width: "100%" }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box style={{ width: "100%" }}>
                    <Typography mb={2} variant="h6" className="font-semibold">
                      Revenue Overview
                    </Typography>
                    
                    <Box className="flex items-start gap-6 mb-4">
                      {stats.map((item, idx) => (
                        <Box key={idx}>
                          <Box className="flex flex-col pr-5 border-r border-gray-300">
                            <Typography fontSize={14} className="text-gray-600 text-sm font-medium">
                              {item.title}
                            </Typography>
                            <Typography fontWeight={700} className="text-xl font-semibold mt-1">
                              {item.amount}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart
                        data={dailyData.length > 0 ? dailyData.map(d => ({
                          date: d.date,
                          gross: d.gross_received,
                          revenue: d.net_revenue,
                          tax: d.total_tax_amount,
                        })) : [
                          {
                            date: "Selected Period",
                            gross: parseFloat(shiftData.gross_received || 0),
                            revenue: parseFloat(shiftData.net_revenue || 0),
                            tax: parseFloat(shiftData.total_tax_amount || 0),
                          },
                        ]}
                      >
                        <defs>
                          <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="10%" stopColor="#00C4FF" stopOpacity={0.7} />
                            <stop offset="90%" stopColor="#00C4FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Area
                          type="monotone"
                          dataKey="gross"
                          stroke="#00C4FF"
                          fillOpacity={1}
                          fill="url(#colorGross)"
                          name="Gross Received"
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} name="Net Revenue" />
                        <Line type="monotone" dataKey="tax" stroke="#FF0000" strokeWidth={2} name="Tax" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>

              {/* Bottom Row - Two 50% Width Charts */}
              <Box sx={{ width: "100%", display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                {/* Pie Chart for Payment Methods */}
                <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography mb={2} variant="h6" className="font-semibold">
                    Payment Methods Breakdown
                  </Typography>
                  <Typography mb={2} variant="body2" sx={{ color: "#6b7280" }}>
                    Net Revenue Collection
                  </Typography>
                  <Box style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
                </Box>

                {/* Discount Impact Trend Chart */}
                <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography mb={2} variant="h6" className="font-semibold">
                    Discount Impact Trend
                  </Typography>
                  <Typography mb={2} variant="body2" sx={{ color: "#6b7280" }}>
                    Total Discount: {formatCurrency(totalDiscount)}
                  </Typography>
                  <Box style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={discountTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="discount" fill="#00C4FF" name="Discount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
                </Box>

                {/* Top Days by Net Revenue Chart */}
                <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography mb={2} variant="h6" className="font-semibold">
                    Top Days by Net Revenue
                  </Typography>
                  <Box style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart 
                        data={topDaysData} 
                        layout="vertical"
                        margin={{ left: 20, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="date" type="category" width={80} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="net_revenue">
                          {topDaysData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isTop ? "#10b981" : "#00C4FF"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box className="p-8 text-center">
            <Typography variant="body1" sx={{ color: "#6b7280" }}>
              Select date range and click "Get Report" to view shift report data.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
    </LocalizationProvider>
  );
};

export default EndShiftReport;

