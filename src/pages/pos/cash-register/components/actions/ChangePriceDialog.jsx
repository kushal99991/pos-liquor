import { Box, Button, Dialog, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItemButton, TextField, DialogTitle, DialogContent, DialogActions, Typography, IconButton,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import CloseIcon from "@mui/icons-material/Close";
import { KeyboardIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLazyGetItemsQuery, useLazyGetItemQuery, useUpdateItemMutation } from "services/itemSlice";
import SuccessDialog from "components/elements/SuccessDialog/SuccessDialog";
import ErrorDialog from "components/elements/ErrorDialog/ErrorDialog";

const ChangePriceDialog = ({ open, onClose }) => {
  const [itemName, setItemName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [upc, setUpc] = useState("");
  const [sku, setSku] = useState("");
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'unit_cost', 'retail_price', 'sale_price'
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [getItemsList] = useLazyGetItemsQuery();
  const [getItem, { isLoading: isLookupLoading }] = useLazyGetItemQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  // Fetch items list for dropdown suggestions
  useEffect(() => {
    if (open) {
      fetchItemsList();
    }
  }, [open]);

  const fetchItemsList = async () => {
    try {
      const response = await getItemsList({});
      if (response?.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.items)
          ? response.data.items
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setItemsList(items);
      }
    } catch (error) {
      console.error("Error fetching items list:", error);
    }
  };

  // Filter suggestions based on item name or distributor code
  const filteredSuggestions = itemsList.filter((item) => {
    const searchTerm = itemName.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(searchTerm);
    const distributorCodeMatch = item.distributor_code?.toLowerCase().includes(searchTerm);
    return nameMatch || distributorCodeMatch;
  });

  const handleSelectSuggestion = (item) => {
    setItemName(item.name || "");
    setSelectedProduct(item);
    setUpc(item.upc || item.upc_code || "");
    setSku(item.sku || "");
    setShowSuggestions(false);
  };

  const handleLookup = async () => {
    try {
      const params = {};
      if (upc) params.upc = upc;
      if (sku) params.sku = sku;
      if (itemName) params.name = itemName;

      const response = await getItem(params);

      if (response?.error) {
        setErrorMessage(
          response.error?.data?.detail ||
            response.error?.data?.message ||
            response.error?.data ||
            response.error?.message ||
            "Unable to fetch items. Please try again."
        );
        setErrorDialogOpen(true);
        setDisplayedProducts([]);
        return;
      }

      const data = response?.data;
      const items = Array.isArray(data) ? data : data?.results || data?.items || data?.data || [];
      
      // Format items for display
      const formattedItems = items.map((item) => ({
        id: item.id,
        sku: item.sku || "",
        itemName: item.name || "",
        unitCost: item.unit_cost || item.unitCost || 0,
        retailPrice: item.retail_price || item.retailPrice || 0,
        salePrice: item.sale_price || item.salePrice || 0,
        upc: item.upc || item.upc_code || "",
        rawItem: item, // Store raw item for update
      }));

      setDisplayedProducts(formattedItems);
    } catch (error) {
      setErrorMessage("An error occurred while looking up items. Please try again.");
      setErrorDialogOpen(true);
      setDisplayedProducts([]);
    }
  };

  const handleReset = () => {
    setItemName("");
    setUpc("");
    setSku("");
    setSelectedProduct(null);
    setDisplayedProducts([]);
  };

  const handleUnitCostClick = (item) => {
    setSelectedItemForEdit(item);
    setEditingField("unit_cost");
    setInputValue(item.unitCost !== undefined ? item.unitCost.toString() : "0.00");
    setInputDialogOpen(true);
  };

  const handleRetailPriceClick = (item) => {
    setSelectedItemForEdit(item);
    setEditingField("retail_price");
    setInputValue(item.retailPrice !== undefined ? item.retailPrice.toString() : "0.00");
    setInputDialogOpen(true);
  };

  const handleSalePriceClick = (item) => {
    setSelectedItemForEdit(item);
    setEditingField("sale_price");
    setInputValue(item.salePrice !== undefined ? item.salePrice.toString() : "0.00");
    setInputDialogOpen(true);
  };

  const handleInputDialogClose = () => {
    setInputDialogOpen(false);
    setSelectedItemForEdit(null);
    setEditingField(null);
    setInputValue("");
  };

  const handleInputSubmit = async () => {
    if (!selectedItemForEdit || !editingField) return;

    try {
      const numericValue = parseFloat(inputValue);
      if (isNaN(numericValue)) {
        setErrorMessage(`Invalid ${editingField.replace("_", " ")} value.`);
        setErrorDialogOpen(true);
        return;
      }

      const itemId = selectedItemForEdit.rawItem?.id || selectedItemForEdit.id;
      if (!itemId) {
        setErrorMessage("Item ID not found. Cannot update item.");
        setErrorDialogOpen(true);
        return;
      }

      const updateData = {
        [editingField]: numericValue,
      };

      const response = await updateItem({
        itemId: itemId,
        data: updateData,
      });

      if (response?.error) {
        setErrorMessage(
          response.error?.data?.detail ||
            response.error?.data?.message ||
            response.error?.data ||
            response.error?.message ||
            "Unable to update item. Please try again."
        );
        setErrorDialogOpen(true);
        return;
      }

      // Update the displayed product with new value
      setDisplayedProducts((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            if (editingField === "unit_cost") {
              return { ...item, unitCost: numericValue };
            } else if (editingField === "retail_price") {
              return { ...item, retailPrice: numericValue };
            } else if (editingField === "sale_price") {
              return { ...item, salePrice: numericValue };
            }
          }
          return item;
        })
      );

      setSuccessDialogOpen(true);
      handleInputDialogClose();
    } catch (error) {
      setErrorMessage("An error occurred while updating the item. Please try again.");
      setErrorDialogOpen(true);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    if (typeof value === "string" && value.startsWith("$")) {
      return value;
    }
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <Box className="px-4 p-2 flex justify-between items-center shadow-lg bg-white">
          <Box className="text-[20px] font-bold text-[#b01d39] uppercase">
            Price Change
          </Box>
          <Button
            sx={{
              bgcolor: "#b01d39",
              color: "white",
              minHeight: 36,
              minWidth: 36,
              borderRadius: 50,
              "&:hover": { bgcolor: "#702626" },
            }}
            onClick={onClose}
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </Button>
        </Box>

        {/* Content */}
        <Box className="p-4 flex flex-col justify-start items-start gap-4">
          <Box className="w-full flex justify-between items-start gap-4">
            {/* Left Side */}
            <Box className="w-1/2 flex flex-col items-center gap-4">
              {/* UPC Field */}
              <Box className="w-full flex items-center gap-4 relative">
                <Box className="text-[16px] font-semibold min-w-[115px]">
                  UPC <span>:</span>
                </Box>
                <KeyboardTextField
                  placeholder="UPC"
                  size="small"
                  fullWidth
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <KeyboardIcon color="#b01d39" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Item Name Field */}
              <Box className="w-full flex items-center gap-4 relative">
                <Box className="text-[16px] font-semibold min-w-[115px]">
                  ITEM NAME <span>:</span>
                </Box>
                <Box className="w-full relative">
                  <KeyboardTextField
                    placeholder="Item Name / Distributor Code"
                    size="small"
                    fullWidth
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                  />
                  {showSuggestions &&
                    itemName &&
                    filteredSuggestions.length > 0 && (
                      <Paper
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          maxHeight: 200,
                          overflowY: "auto",
                          background: "#b01d39",
                        }}
                      >
                        <List sx={{ padding: 0 }} dense>
                          {filteredSuggestions.map((item) => (
                            <ListItemButton
                              key={item.id || item.sku}
                              onClick={() => handleSelectSuggestion(item)}
                              sx={{
                                fontSize: "14px",
                                color: "#ffffff",
                                padding: "6px 15px",
                                borderBottom: "1px solid rgba(255,255,255,0.3)",
                                "&:last-child": { borderBottom: "0" },
                                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                              }}
                            >
                              {item.name || item.distributor_code || ""}
                              {item.retail_price !== undefined && (
                                <span style={{ marginLeft: "8px", opacity: 0.9 }}>
                                  , $ {item.retail_price?.toFixed(2) || "0.00"}
                                </span>
                              )}
                            </ListItemButton>
                          ))}
                        </List>
                      </Paper>
                    )}
                </Box>
              </Box>
            </Box>

            {/* Right Side */}
            <Box className="w-1/2 flex flex-col items-center gap-4">
              {/* SKU Field */}
              <Box className="w-full flex items-center gap-4 relative">
                <Box className="text-[16px] font-semibold min-w-[115px]">
                  SKU <span>:</span>
                </Box>
                <KeyboardTextField
                  placeholder="SKU"
                  size="small"
                  fullWidth
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </Box>

              {/* Buttons */}
              <Box className="w-full flex justify-end items-center gap-4 relative">
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#b01d39",
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    "&:hover": { bgcolor: "#702626" },
                  }}
                  onClick={handleReset}
                >
                  RESET
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#b01d39",
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    "&:hover": { bgcolor: "#702626" },
                  }}
                  onClick={handleLookup}
                  disabled={isLookupLoading}
                >
                  {isLookupLoading ? "LOADING..." : "LOOK-UP"}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Product Table */}
          <Box className="w-full flex items-center gap-4">
            <TableContainer
              component={Paper}
              sx={{ height: "calc(100vh - 280px)" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["SKU", "ITEM NAME", "UNIT COST", "RETAIL PRICE", "SALES PRICE"].map(
                      (head) => (
                        <TableCell
                          key={head}
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#000",
                            color: "#fff",
                          }}
                        >
                          {head}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedProducts.length > 0 ? (
                    displayedProducts.map((item) => (
                      <TableRow key={item.id || item.sku} hover>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                          onClick={() => handleUnitCostClick(item)}
                        >
                          {formatCurrency(item.unitCost)}
                        </TableCell>
                        <TableCell
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                          onClick={() => handleRetailPriceClick(item)}
                        >
                          {formatCurrency(item.retailPrice)}
                        </TableCell>
                        <TableCell
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                          onClick={() => handleSalePriceClick(item)}
                        >
                          {formatCurrency(item.salePrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        No items found. Please use LOOK-UP to search for items.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Dialog>

      {/* Input Dialog */}
      <Dialog
        open={inputDialogOpen}
        onClose={handleInputDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600} color="#b01d39">
              {editingField === "unit_cost" ? "Edit Unit Cost" : editingField === "retail_price" ? "Edit Retail Price" : "Edit Sales Price"}
            </Typography>
            <IconButton
              onClick={handleInputDialogClose}
              sx={{
                backgroundColor: "#b01d39",
                color: "white",
                "&:hover": { backgroundColor: "#702626" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="Enter Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "18px",
                "& fieldset": {
                  borderColor: "#b01d39",
                },
                "&:hover fieldset": {
                  borderColor: "#b01d39",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#b01d39",
                },
              },
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleInputSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 2, justifyContent: "center" }}>
          <Button
            onClick={handleInputDialogClose}
            variant="outlined"
            sx={{
              borderColor: "#b01d39",
              color: "#b01d39",
              minWidth: "100px",
              "&:hover": {
                borderColor: "#702626",
                backgroundColor: "#fff5f5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInputSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#b01d39",
              color: "white",
              minWidth: "100px",
              "&:hover": { backgroundColor: "#702626" },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <SuccessDialog
        open={successDialogOpen}
        message="Price has been updated for this Item!"
        onClose={() => setSuccessDialogOpen(false)}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </>
  );
};

export default ChangePriceDialog;
