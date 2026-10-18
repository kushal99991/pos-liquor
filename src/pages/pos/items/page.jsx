import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Filter,
  X,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  InputBase,
  IconButton,
  TableContainer,
  Paper,
  TablePagination,
  Checkbox,
  Typography,
} from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import AddEditItemModal from "./AddEditItemModal";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import ItemActionButton from "./ItemActionButton";
import { useNavigate } from "react-router-dom";
import {
  useLazyGetItemsQuery,
  useLazyGetItemQuery,
  useDeleteItemMutation,
} from "services/itemSlice";
import { Close } from "@mui/icons-material";

export default function ItemsManagement() {
  const Navigate = useNavigate();
  const [filterType, setFilterType] = useState("All");
  const [upcSearch, setUpcSearch] = useState("");
  const [itemNameSearch, setItemNameSearch] = useState("");
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectionMode, setSelectionMode] = useState(false);

  const [items, setItems] = useState([]);
  const [listError, setListError] = useState("");
  const [editItemData, setEditItemData] = useState(null);

  const [getItemsList, { isFetching: isItemsFetching }] = useLazyGetItemsQuery();
  const [getItemDetails] = useLazyGetItemQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

  const fetchItemsList = useCallback(async () => {
    setListError("");
    const response = await getItemsList({
      ordering: "-id", // Order by ID in descending order (newest first)
    });

    if (response?.error) {
      setItems([]);
      setListError(
        response.error?.data?.detail ||
          response.error?.data?.message ||
          response.error?.data ||
          response.error?.message ||
          "Unable to load items. Please try again."
      );
      return;
    }

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

    // Separate main items from variants
    const mainItems = normalizedItems.filter(item => !item.parent_id);
    const variants = normalizedItems.filter(item => item.parent_id);

    // Group variants by parent_id
    const variantsByParent = {};
    variants.forEach(variant => {
      const parentId = variant.parent_id;
      if (!variantsByParent[parentId]) {
        variantsByParent[parentId] = [];
      }
      variantsByParent[parentId].push(variant);
    });

    // Sort variants by ID (descending) within each parent
    Object.keys(variantsByParent).forEach(parentId => {
      variantsByParent[parentId].sort((a, b) => (b.id || 0) - (a.id || 0));
    });

    // Create a flattened list: main items with their variants nested below
    const itemsWithVariants = [];
    mainItems.forEach(item => {
      itemsWithVariants.push(item);
      // Add variants for this item
      if (variantsByParent[item.id]) {
        itemsWithVariants.push(...variantsByParent[item.id]);
      }
    });

    setItems(itemsWithVariants);
  }, [getItemsList]);

  useEffect(() => {
    fetchItemsList();
  }, [fetchItemsList]);

  const filteredItems = useMemo(() => {
    // First, identify which items directly match the filters
    const directlyMatchingItemIds = new Set();
    const variantsByParent = {};
    
    items.forEach((item) => {
      const matchesUpc = upcSearch
        ? item.sku?.toLowerCase().includes(upcSearch.toLowerCase())
        : true;
      const matchesName = itemNameSearch
        ? item.name?.toLowerCase().includes(itemNameSearch.toLowerCase())
        : true;
      const matchesType = filterType !== "All" ? item.type === filterType : true;
      
      if (matchesUpc && matchesName && matchesType) {
        directlyMatchingItemIds.add(item.id);
      }
      
      // Track variants by parent for later
      if (item.parent_id) {
        if (!variantsByParent[item.parent_id]) {
          variantsByParent[item.parent_id] = [];
        }
        variantsByParent[item.parent_id].push(item);
      }
    });

    // Include parent items if they match OR if any of their variants match
    const parentsToInclude = new Set();
    Object.keys(variantsByParent).forEach(parentId => {
      const parentIdNum = Number(parentId);
      if (directlyMatchingItemIds.has(parentIdNum)) {
        parentsToInclude.add(parentIdNum);
      } else {
        // Check if any variant of this parent matches
        const hasMatchingVariant = variantsByParent[parentId].some(variant => 
          directlyMatchingItemIds.has(variant.id)
        );
        if (hasMatchingVariant) {
          parentsToInclude.add(parentIdNum);
        }
      }
    });

    // Filter items: include main items that match or have matching variants, and variants whose parent is included
    return items.filter((item) => {
      if (item.parent_id) {
        // Variant: include if its parent is in the list (parent matches or has other matching variants)
        return parentsToInclude.has(item.parent_id);
      } else {
        // Main item: include if it matches directly OR if it has matching variants
        return directlyMatchingItemIds.has(item.id) || parentsToInclude.has(item.id);
      }
    });
  }, [filterType, itemNameSearch, items, upcSearch]);

  const handleAddClick = () => {
    setModalMode("add");
    setEditItemData(null);
    setAddEditModalOpen(true);
  };

  const handleEditClick = async () => {
    if (selectedRows.length !== 1) return;

    const itemId = selectedRows[0];
    setModalMode("edit");
    setEditItemData(null);
    setListError("");

    const response = await getItemDetails(Number(itemId));

    if (response?.error) {
      setListError(
        response.error?.data?.detail ||
          response.error?.data?.message ||
          response.error?.data ||
          response.error?.message ||
          "Unable to load item details. Please try again."
      );
      return;
    }
    const detail = response?.data?.length > 0?response?.data[0]:null

    const normalizedDetail =
      detail && typeof detail === "object"
        ? { ...detail, id: detail.id ?? Number(itemId) }
        : detail;

    if (!normalizedDetail || typeof normalizedDetail !== "object") {
      setListError("Item details were not found.");
      return;
    }

    setEditItemData(normalizedDetail);
    setAddEditModalOpen(true);
  };

  const handleDeleteSelectClick = () => {
    setListError("");
    setSelectionMode((prev) => !prev);
    setSelectedRows([]);
  };

  const handleDeleteClick = () => {
    setListError("");
    if (selectedRows.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) return;

    setListError("");

    try {
      await Promise.all(
        selectedRows.map(async (id) => {
          const response = await deleteItem(Number(id));
          if (response?.error) {
            console.log(response?.error)
            return false;
          }
        })
      );

      setDeleteDialogOpen(false);
      setSelectionMode(false);
      setSelectedRows([]);
      await fetchItemsList();
    } catch (error) {
      setListError(error?.message || "Failed to delete selected items.");
      setDeleteDialogOpen(false);
    }
  };

  const handleClear = () => {
    setSelectionMode((prev) => !prev);
    setSelectedRows([]);
  };

  const handleClone = async () => {
    if (selectedRows.length !== 1) return;

    const itemId = selectedRows[0];
    setModalMode("clone");
    setEditItemData(null);
    setListError("");

    // Fetch full item details for cloning
    const response = await getItemDetails(Number(itemId));

    if (response?.error) {
      setListError(
        response.error?.data?.detail ||
          response.error?.data?.message ||
          response.error?.data ||
          response.error?.message ||
          "Unable to load item details for cloning. Please try again."
      );
      return;
    }

    const detail = response?.data?.length > 0 ? response?.data[0] : null;

    const normalizedDetail =
      detail && typeof detail === "object"
        ? { ...detail, id: detail.id ?? Number(itemId) }
        : detail;

    if (!normalizedDetail || typeof normalizedDetail !== "object") {
      setListError("Item details were not found for cloning.");
      return;
    }

    setEditItemData(normalizedDetail);
    setAddEditModalOpen(true);
  };

  const handleSaveItem = () => {
    setListError("");
    fetchItemsList();
    setSelectionMode(false);
    setSelectedRows([]);
  };

  const handleRowClick = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    setSelectedRows([id]);
    setDeleteDialogOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Box className="p-4 h-[calc(100vh-86px)]">
        {/* Top Bar */}
        <Box className="flex justify-between items-center gap-4 mb-8">
          <Box className="flex justify-start items-center gap-4">
            <Button
              sx={{
                bgcolor: "#b01d39",
                color: "white",
                minHeight: 40,
                minWidth: 40,
                borderRadius: 50,
                "&:hover": { bgcolor: "#702626" },
              }}
              onClick={() => Navigate(-1)}
            >
              <ArrowLeft size={24} />
            </Button>
            <Box className="text-[24px] font-bold leading-[1.5] text-[#b01d39] uppercase">
              ITEM MANAGEMENT
            </Box>
          </Box>
          <Box className="flex justify-start items-center gap-4">
            <Box className="relative">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{
                  border: "1px solid #000000",
                  borderRadius: "8px",
                  padding: "8px 0 8px 15px",
                  ".MuiSelect-select": {
                    fontSize: "16px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    color: "#575757",
                    padding: 0,
                    "&::placeholder": {
                      color: "#575757",
                      opacity: 1,
                    },
                  },
                  fieldset: {
                    border: "none",
                  },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Split Pack">Split Pack</MenuItem>
              </Select>
            </Box>
            <Box className="relative">
              <KeyboardTextField
                placeholder="UPC"
                value={upcSearch}
                onChange={(e) => setUpcSearch(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: upcSearch && (
                    <IconButton
                      onClick={() => setUpcSearch("")}
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "#b01d39",
                        borderRadius: "50%",
                        p: "3px",
                        "&:hover": {
                          backgroundColor: "#702626",
                        },
                      }}
                      size="small"
                    >
                      <X size={15} />
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "1px solid #000000",
                    borderRadius: "8px",
                    padding: "8px 0 8px 15px",
                    fontSize: "16px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    color: "#575757",
                    "& fieldset": {
                      border: "none",
                    },
                    "& input::placeholder": {
                      color: "#575757",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
            <Box className="relative">
              <KeyboardTextField
                placeholder="Item Name"
                value={itemNameSearch}
                onChange={(e) => setItemNameSearch(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: itemNameSearch && (
                    <IconButton
                      onClick={() => setItemNameSearch("")}
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "#b01d39",
                        borderRadius: "50%",
                        p: "3px",
                        "&:hover": {
                          backgroundColor: "#702626",
                        },
                      }}
                      size="small"
                    >
                      <X size={15} />
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "1px solid #000000",
                    borderRadius: "8px",
                    padding: "8px 0 8px 15px",
                    fontSize: "16px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    color: "#575757",
                    "& fieldset": {
                      border: "none",
                    },
                    "& input::placeholder": {
                      color: "#575757",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        {/* Button Bar */}
        <Box className="flex justify-between items-center gap-4 mb-8">
          <Box className="flex justify-start items-center gap-4">
            <Button
              onClick={handleAddClick}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Plus size={16} /> ADD
            </Button>
            <Button
              onClick={handleEditClick}
              disabled={selectedRows.length !== 1}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&.Mui-disabled": {
                  background: "#00000042",
                  color: "#000000",
                },
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Edit2 size={16} /> EDIT
            </Button>
            {selectionMode ? (
              <Button
                onClick={handleDeleteClick}
                disabled={selectedRows.length === 0 || isDeleting}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                CONFIRM DELETE ({selectedRows?.length ?? 0})
              </Button>
            ) : (
              <Button
                onClick={handleDeleteSelectClick}
                disabled={isDeleting}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                <Trash2 size={16} /> DELETE
              </Button>
            )}
            <Button
              onClick={handleClone}
              disabled={selectedRows.length !== 1}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&.Mui-disabled": {
                  background: "#00000042",
                  color: "#000000",
                },
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Copy size={16} /> CLONE
            </Button>
            {selectionMode && (
              <Button
                onClick={handleClear}
                disabled={selectedRows.length === 0}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                <Close size={16} /> Clear
              </Button>
            )}
          </Box>
          <Box className="flex justify-start items-center gap-4">
            <Box className="text-[20px] font-[500] leading-[1.5] text-black">
              Total : {filteredItems.length}
            </Box>
            <TablePagination
              component="div"
              count={filteredItems.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  padding: "0",
                },
                "& .MuiIconButton-root": {
                  paddingTop: "0",
                  paddingBottom: "0",
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: 14,
                  },
              }}
            />
            <Button
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Filter size={20} /> FILTER
            </Button>
          </Box>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            height: "calc(100vh - 280px)",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {selectionMode && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      fontSize: "16px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "#ffffff",
                      bgcolor: "#000000",
                      padding: "16px 16px",
                    }}
                  >
                    <Checkbox
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < filteredItems.length
                      }
                      checked={
                        filteredItems.length > 0 &&
                        selectedRows.length === filteredItems.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredItems.map((item) => item.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "white",
                        },
                        "& .MuiSvgIcon-root": {
                          fill: "white",
                        },
                      }}
                    />
                  </TableCell>
                )}

                {[
                  "SKU",
                  "ITEM NAME",
                  "SIZE",
                  "PACK",
                  "COST",
                  "PRICE",
                  "STOCK",
                  "TYPE",
                  "",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontSize: "16px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "#ffffff",
                      bgcolor: "#000000",
                      padding: "16px 16px",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isItemsFetching ? (
                <TableRow>
                  <TableCell colSpan={selectionMode ? 10 : 9} sx={{ textAlign: "center", py: 4 }}>
                    Loading items...
                  </TableCell>
                </TableRow>
              ) : listError ? (
                <TableRow>
                  <TableCell
                    colSpan={selectionMode ? 10 : 9}
                    sx={{ textAlign: "center", py: 4, color: "#b01d39", fontWeight: 600 }}
                  >
                    {listError}
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectionMode ? 10 : 9} sx={{ textAlign: "center", py: 4 }}>
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item, index) => {
                  const isSelected = selectedRows.includes(item.id);
                  const retailPrice = Number(item.retail_price ?? item.retailPrice ?? 0);
                  const salePrice = Number(item.sale_price ?? item.salePrice ?? retailPrice);
                  const quantity = Number(item.total_quantity ?? item.quantity ?? item.stock ?? 0);
                  const isVariant = !!item.parent_id;

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: isSelected
                          ? "#b01d39"
                          : isVariant
                          ? "#f5f5f5"
                          : index % 2 === 0
                          ? "white"
                          : "grey.100",
                        "&:hover": {
                          bgcolor: isSelected ? "#b01d39" : isVariant ? "#eeeeee" : "grey.50",
                        },
                        color: isSelected ? "white" : "inherit",
                      }}
                    >
                      {selectionMode && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.includes(item.id)}
                            onChange={() => handleRowClick(item.id)}
                            sx={{
                              color: "#b01d39",
                              "&.Mui-checked": {
                                color: "#b01d39",
                              },
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}

                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {isVariant && (
                            <Box
                              sx={{
                                width: 20,
                                height: 1,
                                bgcolor: isSelected ? "white" : "#b01d39",
                                mr: 1,
                              }}
                            />
                          )}
                          {item.sku || "-"}
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: isVariant ? "normal" : "bold",
                          color: isSelected ? "white" : "inherit",
                          pl: isVariant ? 4 : 0,
                        }}
                      >
                        {isVariant && "└ "}
                        {item.name || "-"}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        {item.size || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        {item.pack || "-"}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        ${retailPrice.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {typeof item.priceUp === "boolean" && (
                            <TrendingUp
                              size={16}
                              style={{
                                color: item.priceUp
                                  ? isSelected
                                    ? "white"
                                    : "green"
                                  : isSelected
                                  ? "white"
                                  : "red",
                                transform: item.priceUp ? "rotate(0deg)" : "rotate(180deg)",
                              }}
                            />
                          )}
                          ${salePrice.toFixed(2)}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        {quantity}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        {(item.type || "N/A").toString().toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        <Button
                          onClick={(e) => handleDeleteSingle(item.id, e)}
                          sx={{
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: "1.5",
                            color: isSelected ? "#b01d39" : "#ffffff",
                            background: isSelected ? "#ffffff" : "#b01d39",
                            padding: "8px 8px",
                            minWidth: "0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "5px",
                            "&:hover": {
                              background: isSelected ? "#fef2f2" : "#702626",
                            },
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <ItemActionButton />
      </Box>

      {/* Modals */}
      <AddEditItemModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        mode={modalMode}
        onSave={handleSaveItem}
        editItem={editItemData}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmLoading={isDeleting}
      />
    </>
  );
}
