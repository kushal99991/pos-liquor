import { useMemo, useState } from "react";
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, CircularProgress, Stack, InputAdornment, Button,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import SearchIcon from "@mui/icons-material/Search";
import { useGetItemHistoriesQuery } from "services/itemHistorySlice";

export default function ItemHistoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const numericInventoryId = useMemo(
    () => (inventoryId === "" ? undefined : Number(inventoryId)),
    [inventoryId]
  );

  const queryParams = useMemo(
    () => ({
      inventory_id: numericInventoryId,
      page: Number(page) || 1,
      limit: Number(pageSize) || 10, // API expects `limit` (per Swagger)
    }),
    [numericInventoryId, page, pageSize]
  );

  const { data, isLoading, isFetching } = useGetItemHistoriesQuery(
    queryParams,
    {
      skip: !inventoryId,
    }
  );

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.inventory_history)) return data.inventory_history;
    if (Array.isArray(data?.records)) return data.records; // backend returns {records: []}
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }, [data]);

  // Enforce client-side inventory_id match in case backend returns extra rows
  const itemsForView = useMemo(() => {
    if (!numericInventoryId) return items;
    return items.filter((item) => {
      const itemInvId =
        item.inventory_id ?? item.inventoryId ?? item.inventory?.id ?? null;
      return itemInvId === numericInventoryId;
    });
  }, [items, numericInventoryId]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return itemsForView.filter((item) => {
      const searchableText = `
        ${item.item_name || item.item?.name || ""}
        ${item.action || ""}
        ${item.note || ""}
        ${item.inventory_id || ""}
      `.toLowerCase();
      return !query || searchableText.includes(query);
    });
  }, [itemsForView, searchQuery]);

  const handleClearFilters = () => {
    setInventoryId("");
    setPage(1);
    setPageSize(10);
    setSearchQuery("");
  };

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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#3e3e3e" }}>
        Item History
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <KeyboardTextField
            label="Inventory ID"
            value={inventoryId}
            onChange={(e) => {
              setInventoryId(e.target.value);
              setPage(1);
            }}
            size="small"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            sx={{ minWidth: 160 }}
            placeholder="Required"
          />
          <KeyboardTextField
            label="Page"
            value={page}
            onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
            size="small"
            type="number"
            sx={{ width: 110 }}
          />
          <KeyboardTextField
            label="Page Size"
            value={pageSize}
            onChange={(e) => setPageSize(Math.max(1, Number(e.target.value) || 10))}
            size="small"
            type="number"
            sx={{ width: 130 }}
          />
          <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
            Clear
          </Button>
        </Stack>

        <Box
          sx={{
            border: "1px solid #1f2937",
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            minWidth: 250,
          }}
        >
          <KeyboardTextField
            placeholder="Search in name / action / note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="standard"
            fullWidth
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                fontSize: 14,
              },
            }}
          />
        </Box>
      </Stack>

      {!inventoryId ? (
        <Paper
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "#6b7280" }}
        >
          <Typography>Enter an Inventory ID to load history.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#070c1f" }}>
                <TableCell sx={{ color: "white" }}>Inventory ID</TableCell>
                <TableCell sx={{ color: "white" }}>Item Name</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
                <TableCell sx={{ color: "white" }}>Note</TableCell>
                <TableCell sx={{ color: "white" }}>Qty</TableCell>
                <TableCell sx={{ color: "white" }}>Prev Qty</TableCell>
                <TableCell sx={{ color: "white" }}>Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>
                      {numericInventoryId
                        ? "Item not available for this inventory ID"
                        : "No inventory history found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => (
                  <TableRow key={item.id || index} hover>
                    <TableCell>{item.inventory_id ?? "-"}</TableCell>
                    <TableCell>
                      {item.item_name ||
                        item.item?.name ||
                        item.inventory?.item?.name ||
                        "-"}
                    </TableCell>
                    <TableCell>{item.action || "-"}</TableCell>
                    <TableCell>{item.note || "-"}</TableCell>
                    <TableCell>{item.qty ?? item.quantity ?? "-"}</TableCell>
                    <TableCell>{item.old_quantity ?? item.old_qty ?? "-"}</TableCell>
                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : item.date || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

