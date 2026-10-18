import { useMemo, useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Box,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetItemsQuery } from "services/itemSlice";

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0); // Reset to first page on search

      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set("search", searchInput);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      limit,
      offset: page * limit,
    };

    if (statusFilter === "active") {
      params.is_active = true;
    } else if (statusFilter === "inactive") {
      params.is_active = false;
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [page, limit, statusFilter, searchQuery]);

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
  } = useGetItemsQuery(queryParams);

  const items = useMemo(() => {
    if (!itemsData) return [];
    if (Array.isArray(itemsData)) return itemsData;
    if (Array.isArray(itemsData?.data)) return itemsData.data;
    return [];
  }, [itemsData]);

  const totalCount = itemsData?.total || items.length;
  const totalPages = Math.ceil(totalCount / limit);

  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setPage(0); // Reset to first page
    setSelectedRows([]); // Clear selection
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const statusDot = (isActive) => (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: isActive ? "#27ae60" : "#c0392b",
      }}
    />
  );

  const isLoading = isLoadingItems;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 700, color: "#3e3e3e" }}
      >
        Inventory Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            onClick={() =>
              navigate("/backoffice/products/inventory/addedit", {
                state: { mode: "add" },
              })
            }
            startIcon={<Plus size={16} />}
            sx={{
              bgcolor: "#b32d3a",
              color: "white",
              px: 2.5,
              "&:hover": { bgcolor: "#9b2432" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Stock
          </Button>

          <Button
            disabled={selectedRows.length !== 1}
            onClick={() =>
              selectedRows.length === 1 &&
              navigate("/backoffice/products/inventory/addedit", {
                state: { mode: "update", item_id: selectedRows[0] },
              })
            }
            sx={{
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: selectedRows.length === 1 ? "#b32d3a" : "transparent",
              color: selectedRows.length === 1 ? "white" : "#b32d3a",
              border: "1px solid #b32d3a",
            }}
          >
            Update Stock
          </Button>

          <Button
            variant={statusFilter === "active" ? "contained" : "outlined"}
            onClick={() => handleStatusFilterChange("active")}
            sx={{
              bgcolor: statusFilter === "active" ? "#47b86c" : "transparent",
              color: statusFilter === "active" ? "white" : "#47b86c",
              borderColor: "#47b86c",
              textTransform: "none",
            }}
          >
            Active
          </Button>

          <Button
            variant={statusFilter === "inactive" ? "contained" : "outlined"}
            onClick={() => handleStatusFilterChange("inactive")}
            sx={{
              bgcolor: statusFilter === "inactive" ? "#b32d3a" : "transparent",
              color: statusFilter === "inactive" ? "white" : "#b32d3a",
              borderColor: "#b32d3a",
              textTransform: "none",
            }}
          >
            Inactive
          </Button>

          <Button
            variant={statusFilter === "All" ? "contained" : "outlined"}
            onClick={() => handleStatusFilterChange("All")}
            sx={{
              bgcolor: statusFilter === "All" ? "#070c1f" : "transparent",
              color: statusFilter === "All" ? "white" : "#070c1f",
              borderColor: "#070c1f",
              textTransform: "none",
            }}
          >
            All
          </Button>
        </Stack>

        <Box display="flex" alignItems="center" gap={3}>
          <Box
            sx={{
              border: "1px solid #1f2937",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              gap: 1,
            }}
          >
            Total:
            <Box
              sx={{
                border: "1px solid #1f2937",
                px: 1,
                borderRadius: 0.5,
              }}
            >
              {totalCount}
            </Box>
          </Box>

          <Box
            sx={{
              border: "1px solid #1f2937",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              minWidth: 250,
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </Box>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#070c1f" }}>
              <TableCell sx={{ color: "white" }} />
              <TableCell sx={{ color: "white" }}>Item Name</TableCell>
              <TableCell sx={{ color: "white" }}>SKU</TableCell>
              <TableCell sx={{ color: "white" }}>UPC</TableCell>
              <TableCell sx={{ color: "white" }}>Carton Qty</TableCell>
              <TableCell sx={{ color: "white" }}>Pack Qty</TableCell>
              <TableCell sx={{ color: "white" }}>Piece Qty</TableCell>
              <TableCell sx={{ color: "white" }}>Total Pieces</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isFetchingItems && !isLoadingItems ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No items found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const isChecked = selectedRows.includes(item.id);
                const cartonQty = item?.carton_stock || 0;
                const packQty = item?.pack_stock || 0;
                const pieceQty = item?.single_stock || 0;
                const piecesPerCarton = item?.pieces_per_carton || 0;
                const piecesPerPack = item?.pieces_per_pack || 0;
                const totalPieces =
                  cartonQty * piecesPerCarton +
                  packQty * piecesPerPack +
                  pieceQty;

                return (
                  <TableRow
                    key={item.id || index}
                    hover
                    selected={isChecked}
                    onClick={() => toggleSelect(item.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {statusDot(item.is_active)}
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.name || "Unknown Item"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{item.sku || "-"}</TableCell>
                    <TableCell>{item.upc || "-"}</TableCell>
                    <TableCell>{cartonQty}</TableCell>
                    <TableCell>{packQty}</TableCell>
                    <TableCell>{pieceQty}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {totalPieces}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          px: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "#666" }}>
          Showing {page * limit + 1} to{" "}
          {Math.min((page + 1) * limit, totalCount)} of {totalCount} items
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            startIcon={<ChevronLeft size={16} />}
            sx={{
              textTransform: "none",
              borderColor: "#b32d3a",
              color: "#b32d3a",
              "&:hover": {
                borderColor: "#9b2432",
                bgcolor: "rgba(179, 45, 58, 0.04)",
              },
              "&:disabled": {
                borderColor: "#e0e0e0",
                color: "#999",
              },
            }}
          >
            Previous
          </Button>

          <Typography variant="body2" sx={{ mx: 2, fontWeight: 600 }}>
            Page {page + 1} of {totalPages || 1}
          </Typography>

          <Button
            variant="outlined"
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() =>
              setPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            endIcon={<ChevronRight size={16} />}
            sx={{
              textTransform: "none",
              borderColor: "#b32d3a",
              color: "#b32d3a",
              "&:hover": {
                borderColor: "#9b2432",
                bgcolor: "rgba(179, 45, 58, 0.04)",
              },
              "&:disabled": {
                borderColor: "#e0e0e0",
                color: "#999",
              },
            }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
