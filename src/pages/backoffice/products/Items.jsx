import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import {
  useGetItemsQuery,
  useDeleteItemMutation,
} from "services/itemSlice";
import toast from "react-hot-toast";

export default function ItemsManagement() {
  const Navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // API hooks
  const { data, isLoading, isFetching } = useGetItemsQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

  // Extract items from API response
  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  // Group items with their variants (variants may come nested or as separate rows with parent_id)
  const groupedItems = useMemo(() => {
    const map = new Map();
    const order = [];

    const addVariantToGroup = (parentId, variant) => {
      if (!variant) return;
      const entry = map.get(parentId) || { parent: null, variants: [] };
      const isDuplicate = variant.id
        ? entry.variants.some((existing) => existing.id === variant.id)
        : false;

      if (!isDuplicate) {
        entry.variants.push(variant);
      }
      map.set(parentId, entry);
    };

    items.forEach((item) => {
      if (!item) return;

      const parentId = item.parent_id || item.id;
      if (parentId && !order.includes(parentId)) {
        order.push(parentId);
      }

      if (item.parent_id) {
        addVariantToGroup(item.parent_id, item);
        return;
      }

      const entry = map.get(item.id) || { parent: null, variants: [] };
      entry.parent = item;
      map.set(item.id, entry);

      if (Array.isArray(item.variants)) {
        item.variants.forEach((variant) => addVariantToGroup(item.id, variant));
      }
    });

    return order
      .map((id) => {
        const entry = map.get(id);
        if (!entry) return null;
        return { ...entry, parentId: id };
      })
      .filter((entry) => entry && (entry.parent || entry.variants?.length));
  }, [items]);

  // ⭐ Filtered Items with variants nested under parents
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matchesStatus = (entity) => {
      if (!entity) return false;
      if (statusFilter === "All") return true;
      return statusFilter === "active" ? entity.is_active : !entity.is_active;
    };

    const matchesSearch = (entity) => {
      if (!entity) return false;
      if (!query) return true;

      const searchableText = `
        ${entity.name}
        ${entity.sku}
        ${entity.upc}
        ${entity.type}
        ${entity.category_id}
        ${entity.unit_cost}
        ${entity.retail_price}
      `.toLowerCase();

      return searchableText.includes(query);
    };

    const matchesSearchAndStatus = (entity) =>
      matchesSearch(entity) && matchesStatus(entity);

    const rows = [];

    groupedItems.forEach(({ parent, variants = [] }) => {
      const parentMatches = parent ? matchesSearchAndStatus(parent) : false;
      const variantsMatchingSearch = variants.filter(matchesSearchAndStatus);
      const variantsMatchingStatusOnly = variants.filter(matchesStatus);

      const shouldIncludeGroup =
        parentMatches || variantsMatchingSearch.length > 0;

      if (!shouldIncludeGroup) {
        return;
      }

      if (parent) {
        rows.push({ ...parent, __isVariant: false });
      }

      const variantsToRender = parentMatches
        ? variantsMatchingStatusOnly
        : variantsMatchingSearch;

      variantsToRender.forEach((variant) => {
        rows.push({ ...variant, __isVariant: true });
      });
    });

    return rows;
  }, [groupedItems, searchQuery, statusFilter]);

  const handleDeleteClick = () => {
    if (selectedRows.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    // Include variants for any selected parent item in the delete list
    const idsToDelete = new Set(selectedRows);
    selectedRows.forEach((parentId) => {
      const group = groupedItems.find((g) => g.parentId === parentId);
      if (group?.variants?.length) {
        group.variants.forEach((variant) => {
          if (variant?.id) {
            idsToDelete.add(variant.id);
          }
        });
      }
    });

    try {
      // Delete items one by one
      const deletePromises = Array.from(idsToDelete).map((id) =>
        deleteItem(id).unwrap()
      );
      await Promise.all(deletePromises);
      
      toast.success("Items deleted successfully");
      setSelectedRows([]);
      // Cache will be automatically invalidated by RTK Query
    } catch (error) {
      console.error("Error deleting items:", error);
      const errorMessage = error?.data?.detail || error?.message || "Failed to delete items";
      toast.error(errorMessage);
    } finally {
      // Always hide dialog after attempting delete
      setDeleteDialogOpen(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
          Items Management
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
                Navigate("/backoffice/products/items/addedit", { state: { mode: "add" } })
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
                Navigate("/backoffice/products/items/addedit", {
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
              variant={statusFilter === "active" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("active")}
              sx={{
                bgcolor: statusFilter === "active" ? "#47b86c" : "transparent",
                color: statusFilter === "active" ? "white" : "#47b86c",
                borderColor: "#47b86c",
              }}
            >
              Active
            </Button>

            <Button
              variant={statusFilter === "inactive" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("inactive")}
              sx={{
                bgcolor: statusFilter === "inactive" ? "#b32d3a" : "transparent",
                color: statusFilter === "inactive" ? "white" : "#b32d3a",
                borderColor: "#b32d3a",
              }}
            >
              Inactive
            </Button>

            <Button
              disabled={selectedRows.length === 0 || isDeleting}
              onClick={handleDeleteClick}
              sx={{
                px: 3,
                py: 1,
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
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* TABLE */}
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
                <TableCell sx={{ color: "white" }}>Name</TableCell>
                <TableCell sx={{ color: "white" }}>SKU</TableCell>
                <TableCell sx={{ color: "white" }}>UPC</TableCell>
                <TableCell sx={{ color: "white" }}>Category</TableCell>
                <TableCell sx={{ color: "white" }}>Type</TableCell>
                <TableCell sx={{ color: "white" }}>Unit Cost</TableCell>
                <TableCell sx={{ color: "white" }}>Retail Price</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isFetching && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No items found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => {
                  const isVariant = item.__isVariant;
                  const isChecked = !isVariant && selectedRows.includes(item.id);
                  const rowKey = item.id
                    ? `${isVariant ? "variant" : "item"}-${item.id}`
                    : `row-${index}`;

                  return (
                    <TableRow
                      key={rowKey}
                      hover={!isVariant}
                      selected={!isVariant && isChecked}
                      onClick={
                        !isVariant ? () => toggleSelect(item.id) : undefined
                      }
                      sx={{
                        cursor: isVariant ? "default" : "pointer",
                        backgroundColor: isVariant ? "rgba(0,0,0,0.02)" : "inherit",
                      }}
                    >
                      <TableCell>
                        {!isVariant && (
                          <Checkbox
                            checked={isChecked}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelect(item.id)}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          sx={{ pl: isVariant ? 4 : 0 }}
                        >
                          {statusDot(item.is_active)}
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: isVariant ? 600 : 700,
                              color: isVariant ? "#374151" : "inherit",
                            }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>{item.sku || "-"}</TableCell>
                      <TableCell>{item.upc || "-"}</TableCell>
                      <TableCell>{item.category_id || "-"}</TableCell>
                      <TableCell>{item.type || "-"}</TableCell>
                      <TableCell>${item.unit_cost || 0}</TableCell>
                      <TableCell>${item.retail_price || 0}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Items"
        description="Are you sure you want to delete the selected items?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
