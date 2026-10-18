import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Checkbox, Paper, Typography, Stack, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import {
  useGetSubCategoriesQuery,
  useDeleteSubCategoryMutation,
} from "services/subCategorySlice";
import { useGetCateogriesListQuery } from "services/categorySlice";
import toast from "react-hot-toast";

export default function SubCategoryManagement() {
  const Navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isFetching } = useGetSubCategoriesQuery();
  const { data: allCategoriesData } = useGetCateogriesListQuery();
  const [deleteSubCategory, { isLoading: isDeleting }] = useDeleteSubCategoryMutation();

  // Get all categories to find parent names
  const allCategories = useMemo(() => {
    if (!allCategoriesData) return [];
    if (Array.isArray(allCategoriesData)) return allCategoriesData;
    if (Array.isArray(allCategoriesData?.data)) return allCategoriesData.data;
    return [];
  }, [allCategoriesData]);

  // Only show child categories (parent_id !== null)
  const items = useMemo(() => {
    if (!data) return [];
    const allItems = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    // Filter for child categories (parent_id is not null)
    return allItems
      .filter((item) => item.parent_id !== null && item.parent_id !== undefined)
      .map((item) => {
        // Find parent category name
        const parentCategory = allCategories.find((cat) => cat.id === item.parent_id);
        return {
          ...item,
          parent_category: parentCategory ? { name: parentCategory.name } : null,
        };
      });
  }, [data, allCategories]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const searchableText = `${item.name}`.toLowerCase();
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
      const deletePromises = selectedRows.map((id) => deleteSubCategory(id).unwrap());
      await Promise.all(deletePromises);
      toast.success("Sub-categories deleted successfully");
      setSelectedRows([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting sub-categories:", error);
      const errorMessage = error?.data?.detail || error?.message || "Failed to delete sub-categories";
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
          Sub-Category Management
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
                Navigate("/backoffice/products/subcategory/addedit", { state: { mode: "add" } })
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
                Navigate("/backoffice/products/subcategory/addedit", {
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

        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#070c1f" }}>
                <TableCell sx={{ color: "white", maxWidth: "100px" }} />
                <TableCell sx={{ color: "white" }}>Sub-Category Name</TableCell>
                <TableCell sx={{ color: "white" }}>Parent Category</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isFetching && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography>No sub-categories found</Typography>
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
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.parent_category?.name || item.parent_id || "-"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Sub-Categories"
        description="Are you sure you want to delete the selected sub-categories?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

