import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { Search, Clear } from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { useLazyGetInventoryQuery } from "services/inventorySlice";
import useSnackbar from "hooks/useSnackbar";
import Loader from "components/elements/Loader/Loader";

const InventoryReport = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [getInventory] = useLazyGetInventoryQuery();
  
  // Filters
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        ordering: "-id",
      };
      
      if (isActive !== "") params.is_active = isActive === "true";

      const response = await getInventory(params);
      
      if (response?.error) {
        openSnackbar(
          response?.error?.data?.detail ||
            response?.error?.data?.message ||
            response?.error?.message ||
            "Failed to fetch inventory",
          "error"
        );
        setInventoryData([]);
      } else {
        const rawData = response?.data;
        const normalizedItems = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.results)
          ? rawData.results
          : Array.isArray(rawData?.items)
          ? rawData.items
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];
        
        setInventoryData(normalizedItems);
        
        if (normalizedItems.length === 0) {
          openSnackbar("No inventory data found", "info");
        }
      }
    } catch (error) {
      openSnackbar("An error occurred while fetching inventory", "error");
      setInventoryData([]);
    } finally {
      setIsLoading(false);
    }
  }, [getInventory, openSnackbar, isActive]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Calculate stock overview data
  const stockOverviewData = useMemo(() => {
    const stats = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      onOrder: 0,
    };

    inventoryData.forEach((inventoryItem) => {
      const item = inventoryItem.item || inventoryItem;
      const stock = inventoryItem.stock ?? inventoryItem.quantity ?? inventoryItem.qty ?? 0;
      const reorderLevel = item?.reorder_level ?? item?.reorder_point ?? 20;

      if (stock === 0) {
        stats.outOfStock++;
      } else if (stock <= reorderLevel) {
        stats.lowStock++;
      } else {
        stats.inStock++;
      }
      // On Order can be determined if there's a pending order status
      // For now, we'll calculate it as items with stock > reorderLevel but have been recently ordered
      if (stock > reorderLevel && stock <= reorderLevel * 2) {
        stats.onOrder++;
      }
    });

    const total = stats.inStock + stats.lowStock + stats.outOfStock + stats.onOrder;
    if (total === 0) return [];

    return [
      {
        name: "In Stock",
        value: stats.inStock,
        percentage: total > 0 ? Math.round((stats.inStock / total) * 100) : 0,
        color: "#1E90FF",
      },
      {
        name: "Low Stock",
        value: stats.lowStock,
        percentage: total > 0 ? Math.round((stats.lowStock / total) * 100) : 0,
        color: "#FFA500",
      },
      {
        name: "Out of Stock",
        value: stats.outOfStock,
        percentage: total > 0 ? Math.round((stats.outOfStock / total) * 100) : 0,
        color: "#FF0000",
      },
      {
        name: "On Order",
        value: stats.onOrder,
        percentage: total > 0 ? Math.round((stats.onOrder / total) * 100) : 0,
        color: "#00C49F",
      },
    ];
  }, [inventoryData]);

  // Get the largest percentage for center display
  const centerPercentage = useMemo(() => {
    if (stockOverviewData.length === 0) return { value: "0%", color: "#FFA500" };
    const maxItem = stockOverviewData.reduce((max, item) => 
      item.percentage > max.percentage ? item : max
    );
    return { value: `${maxItem.percentage}%`, color: maxItem.color };
  }, [stockOverviewData]);

  // Generate monthly inventory trends data (mock data - can be replaced with actual API data)
  const monthlyTrendsData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const totalStock = inventoryData.reduce((sum, item) => {
      const stock = item.stock ?? item.quantity ?? item.qty ?? 0;
      return sum + stock;
    }, 0);
    
    // Generate mock data based on total inventory
    const baseReceived = Math.floor(totalStock / 12);
    const baseSold = Math.floor(totalStock / 15);
    
    return months.map((month, index) => ({
      month,
      stockReceived: baseReceived + Math.floor(Math.random() * 200) + (index * 30),
      stockSold: baseSold + Math.floor(Math.random() * 150) + (index * 25),
    }));
  }, [inventoryData]);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return inventoryData
      .filter((inventoryItem) => {
        const item = inventoryItem.item || inventoryItem;
        const stock = inventoryItem.stock ?? inventoryItem.quantity ?? inventoryItem.qty ?? 0;
        const reorderLevel = item?.reorder_level ?? item?.reorder_point ?? 20;
        return stock > 0 && stock <= reorderLevel;
      })
      .slice(0, 10)
      .map((inventoryItem) => {
        const item = inventoryItem.item || inventoryItem;
        return {
          id: inventoryItem.id,
          item: item?.name || "N/A",
          sku: item?.sku || "N/A",
          stock: inventoryItem.stock ?? inventoryItem.quantity ?? inventoryItem.qty ?? 0,
          reorderLevel: item?.reorder_level ?? item?.reorder_point ?? 20,
          supplier: item?.supplier || "N/A",
        };
      });
  }, [inventoryData]);

  // Calculate category breakdown
  const categoryBreakdownData = useMemo(() => {
    const categoryMap = {};
    
    inventoryData.forEach((inventoryItem) => {
      const item = inventoryItem.item || inventoryItem;
      const categoryName = item?.category_name || item?.category?.name || "Uncategorized";
      const stock = inventoryItem.stock ?? inventoryItem.quantity ?? inventoryItem.qty ?? 0;
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }
      categoryMap[categoryName] += stock;
    });

    const colors = ["#1E90FF", "#FFA500", "#00C49F", "#FF0000", "#9370DB"];
    let colorIndex = 0;

    return Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[colorIndex++ % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [inventoryData]);

  // Filter data client-side based on search
  const filteredInventoryData = useMemo(() => {
    let filtered = inventoryData;

    if (isActive !== "") {
      const activeFilter = isActive === "true";
      filtered = filtered.filter((inventoryItem) => {
        const item = inventoryItem.item || inventoryItem;
        const itemIsActive = item?.is_active !== undefined 
          ? item.is_active 
          : (inventoryItem.is_active !== undefined ? inventoryItem.is_active : true);
        return itemIsActive === activeFilter;
      });
    }

    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter((inventoryItem) => {
        const item = inventoryItem.item || inventoryItem;
        const itemName = (item?.name || inventoryItem.name || "").toLowerCase();
        const itemDescription = (item?.description || inventoryItem.description || "").toLowerCase();
        const itemSku = (item?.sku || "").toLowerCase();
        const itemId = String(inventoryItem.id || "").toLowerCase();
        
        return (
          itemName.includes(searchLower) ||
          itemDescription.includes(searchLower) ||
          itemSku.includes(searchLower) ||
          itemId.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [inventoryData, search, isActive]);

  const handleClearFilters = () => {
    setSearch("");
    setIsActive("");
  };

  return (
    <Box
      className="min-h-[calc(100vh-65px)] bg-white"
      sx={{
        m: 0,
        p: 0,
      }}
    >
      <Box className="p-6" sx={{ backgroundColor: "#f5f5f5", overflowY: "auto", height: "calc(100vh - 65px)" }}>
        {/* Header */}
        <Box className="flex items-center justify-between gap-4 mb-6">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/reports")}
              sx={{
                backgroundColor: "#8b3735",
                color: "white",
                width: 48,
                height: 48,
                borderRadius: "50px",
                "&:hover": { backgroundColor: "#7a2f2d" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              Inventory Report
            </Typography>
          </Box>

          {/* Filters Section */}
          <Box className="flex items-center gap-2">
            <KeyboardTextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Item Name / SKU / UPC"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ width: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={handleClearFilters}
              startIcon={<Clear />}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Loader />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* First Row: Stock Overview (40%) and Monthly Trends (60%) */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
              {/* Stock Overview Donut Chart - 40% width */}
              <Box sx={{ width: { xs: "100%", md: "40%" } }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}>
                    Stock Overview
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: "330px", height: "330px", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stockOverviewData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            stroke="none"
                          >
                            {stockOverviewData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Pie
                            data={[{ value: 100 }]}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={75}
                            fill="#F5F5F5"
                            stroke="none"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "32px",
                            fontWeight: 700,
                            color: centerPercentage.color,
                          }}
                        >
                          {centerPercentage.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ ml: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                      {stockOverviewData.map((item, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "4px",
                              backgroundColor: item.color,
                            }}
                          />
                          <Typography sx={{ fontSize: "14px", color: "#1a1a1a" }}>
                            {item.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Monthly Inventory Trends - 60% width */}
              <Box sx={{ width: { xs: "100%", md: "60%" } }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}>
                    Monthly Inventory Trends
                  </Typography>
                  <Box sx={{ width: "100%", height: "330px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stockReceived" fill="#1E90FF" name="Stock Received" />
                        <Line
                          type="monotone"
                          dataKey="stockSold"
                          stroke="#FFA500"
                          strokeWidth={3}
                          dot={{ fill: "#FFA500", r: 4 }}
                          name="Stock Sold"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* Second Row: Low Stock Items (60%) and Category Breakdown (40%) */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
              {/* Low Stock Items Table - 60% width */}
              <Box sx={{ width: { xs: "100%", md: "60%" } }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}>
                    Low Stock Items
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                            Item
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                            SKU
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                            Stock
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lowStockItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No low stock items
                            </TableCell>
                          </TableRow>
                        ) : (
                          lowStockItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.item}</TableCell>
                              <TableCell>{item.sku}</TableCell>
                              <TableCell>{item.stock}</TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    display: "inline-block",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: "#FF0000",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  LOW STOCK
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* Category Breakdown - 40% width */}
              <Box sx={{ width: { xs: "100%", md: "40%" } }}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}>
                    Category Breakdown
                  </Typography>
                  <Box sx={{ width: "100%", height: "330px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBreakdownData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1E90FF">
                          {categoryBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* Third Row: Item Details Table - 100% width */}
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}>
                  Item Details
                </Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "13px",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          Item
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "13px",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          SKU
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "13px",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          Stock
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "13px",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          Reorder Level
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          Supplier
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInventoryData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{
                              textAlign: "center",
                              fontSize: "14px",
                              padding: "24px",
                              color: "#1f2937",
                            }}
                          >
                            No inventory data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventoryData.slice(0, 100).map((inventoryItem) => {
                          const item = inventoryItem.item || inventoryItem;
                          const stock = inventoryItem.stock ?? inventoryItem.quantity ?? inventoryItem.qty ?? 0;
                          const reorderLevel = item?.reorder_level ?? item?.reorder_point ?? 20;

                          return (
                            <TableRow
                              key={inventoryItem.id}
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
                                }}
                              >
                                {item?.name || "N/A"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderRight: "2px solid #e5e7eb",
                                  fontSize: "14px",
                                  color: "#1f2937",
                                }}
                              >
                                {item?.sku || "N/A"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderRight: "2px solid #e5e7eb",
                                  fontSize: "14px",
                                  color: "#1f2937",
                                }}
                              >
                                {stock}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderRight: "2px solid #e5e7eb",
                                  fontSize: "14px",
                                  color: "#1f2937",
                                }}
                              >
                                {reorderLevel} units
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: "14px",
                                  color: "#1f2937",
                                }}
                              >
                                {item?.supplier || "N/A"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InventoryReport;
