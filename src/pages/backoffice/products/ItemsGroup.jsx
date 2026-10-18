import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Paper, Typography, Stack, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import {
  useGetItemGroupsQuery,
  useDeleteItemGroupMutation,
} from "services/itemGroupSlice";
import toast from "react-hot-toast";

export default function ItemsGroupManagement() {
  const Navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // API hooks
  const { data, isLoading, isFetching } = useGetItemGroupsQuery();
  const [deleteItemGroup, { isLoading: isDeleting }] = useDeleteItemGroupMutation();

  // Normalize item groups from API response
  const items = useMemo(() => {
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    const normalizeItemGroup = (item) => {
      const id =
        item.id ??
        item.item_group_id ??
        item.itemGroupId ??
        item.group_id ??
        item.groupId ??
        item.value ??
        item.key;
      const name =
        item.name ??
        item.group_name ??
        item.item_group_name ??
        item.title ??
        item.label ??
        "";
      return { ...item, id, name };
    };

    return raw.map(normalizeItemGroup).filter((item) => item.id !== undefined);
  }, [data]);

  // ⭐ Filtered Items
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const searchableText = `
        ${item.name}
      `.toLowerCase();

      return !query || searchableText.includes(query);
    });
  }, [items, searchQuery]);

  const handleDeleteClick = () => {
    if (selectedRows.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete item groups one by one
      const deletePromises = selectedRows.map((id) => deleteItemGroup(id).unwrap());
      await Promise.all(deletePromises);
      
      toast.success("Item groups deleted successfully");
      setSelectedRows([]);
      setDeleteDialogOpen(false);
      // Cache will be automatically invalidated by RTK Query
    } catch (error) {
      console.error("Error deleting item groups:", error);
      const errorMessage = error?.data?.detail || error?.message || "Failed to delete item groups";
      toast.error(errorMessage);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
    <>
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#3e3e3e" }}>
          Items Group Management
        </Typography>

        {/* TOP TOOLBAR */}
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
                Navigate("/backoffice/products/itemsgroup/addedit", { state: { mode: "add" } })
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
              Add
            </Button>

            <Button
              disabled={selectedRows.length !== 1}
              onClick={() =>
                selectedRows.length === 1 &&
                Navigate("/backoffice/products/itemsgroup/addedit", {
                  state: { mode: "edit", id: selectedRows[0] },
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
              Edit
            </Button>

            <Button
              onClick={handleDeleteClick}
              disabled={selectedRows.length === 0 || isDeleting}
              sx={{
                px: 2.5,
                py: 1.1,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: selectedRows.length ? "#b32d3a" : "transparent",
                color: selectedRows.length ? "white" : "#b32d3a",
                border: "1px solid #b32d3a",
              }}
            >
              {isDeleting ? <CircularProgress size={18} /> : <Trash2 size={18} />}
            </Button>
          </Stack>

          {/* SEARCH + TOTAL */}
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
                {items.length}
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
              <KeyboardTextField
                placeholder="Search..."
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
          </Box>
        </Box>

        {/* TABLE */}
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#070c1f" }}>
                <TableCell sx={{ color: "white", maxWidth: "100px" }} />
                <TableCell sx={{ color: "white" }}>Name</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isFetching && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography>No item groups found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = selectedRows.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      selected={isChecked}
                      onClick={() => toggleSelect(item.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ maxWidth: "100px" }}>
                        <Checkbox 
                          sx={{ padding: 0 }}
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </TableCell>

                      <TableCell>
                        {item.name}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Items"
        description="Are you sure you want to delete the selected items group?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
