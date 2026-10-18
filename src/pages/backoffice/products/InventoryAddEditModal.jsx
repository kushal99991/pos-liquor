import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Package, Layers, Box as BoxIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useAddInventoryMutation,
  useUpdateInventoryMutation,
} from "services/inventorySlice";
import { useGetItemsQuery } from "services/itemSlice";

export default function InventoryAddEditModal({
  open = true,
  mode = "add",
  itemId = null,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const stateMode = location?.state?.mode;
  const stateItemId = location?.state?.item_id;
  const finalMode = mode || stateMode || "add";
  const finalItemId = itemId || stateItemId;

  const [formData, setFormData] = useState({
    item_id: finalItemId || "",
    carton_quantity: "",
    pack_quantity: "",
    piece_quantity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: itemsData, isLoading: isLoadingItems } = useGetItemsQuery();
  const [addInventory] = useAddInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();

  const items = useMemo(() => {
    if (!itemsData) return [];
    if (Array.isArray(itemsData)) return itemsData;
    if (Array.isArray(itemsData?.data)) return itemsData.data;
    return [];
  }, [itemsData]);



  // Get selected item data
  const selectedItem = useMemo(() => {
    if (!formData.item_id) return null;
    return items.find((item) => item.id === formData.item_id);
  }, [formData.item_id, items]);

  // Pre-fill form data when item is selected (both add and update modes)
  useEffect(() => {
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        carton_quantity: selectedItem.carton_stock ?? "",
        pack_quantity: selectedItem.pack_stock ?? "",
        piece_quantity: selectedItem.single_stock ?? "",
      }));
    }
  }, [selectedItem]);



  const handleItemChange = (itemId) => {
    setFormData({
      item_id: itemId,
      carton_quantity: "",
      pack_quantity: "",
      piece_quantity: "",
    });
  };

  const handleQuantityChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.item_id) {
      toast.error("Please select an item");
      return false;
    }

    const hasCartonQty = formData.carton_quantity && Number(formData.carton_quantity) > 0;
    const hasPackQty = formData.pack_quantity && Number(formData.pack_quantity) > 0;
    const hasPieceQty = formData.piece_quantity && Number(formData.piece_quantity) > 0;

    if (!hasCartonQty && !hasPackQty && !hasPieceQty) {
      toast.error("Please enter at least one quantity");
      return false;
    }

    // Validate non-negative numbers
    if (formData.carton_quantity && Number(formData.carton_quantity) < 0) {
      toast.error("Carton quantity must be non-negative");
      return false;
    }
    if (formData.pack_quantity && Number(formData.pack_quantity) < 0) {
      toast.error("Pack quantity must be non-negative");
      return false;
    }
    if (formData.piece_quantity && Number(formData.piece_quantity) < 0) {
      toast.error("Piece quantity must be non-negative");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const items = [];

      if (formData.carton_quantity && Number(formData.carton_quantity) > 0) {
        items.push({
          quantity: Number(formData.carton_quantity),
          unit_type: "CARTON",
          description: "",
        });
      }

      if (formData.pack_quantity && Number(formData.pack_quantity) > 0) {
        items.push({
          quantity: Number(formData.pack_quantity),
          unit_type: "PACK",
          description: "",
        });
      }

      if (formData.piece_quantity && Number(formData.piece_quantity) > 0) {
        items.push({
          quantity: Number(formData.piece_quantity),
          unit_type: "PIECE",
          description: "",
        });
      }

      const payload = [
        {
          item_id: Number(formData.item_id),
          items: items,
        },
      ];

      if (finalMode === "update") {
        await updateInventory(payload).unwrap();
        toast.success("Inventory updated successfully");
      } else {
        await addInventory(payload).unwrap();
        toast.success("Inventory added successfully");
      }

      if (onClose) {
        onClose();
      } else {
        navigate("/backoffice/products/inventory");
      }
    } catch (error) {
      console.error("Error saving inventory:", error);

      if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          const firstError = error.data.detail[0];
          const firstField = firstError.loc?.slice(1).join(".") || "field";
          toast.error(`${firstField}: ${firstError.msg}`);
          console.error("All validation errors:", error.data.detail);
        } else if (typeof error.data.detail === "string") {
          toast.error(error.data.detail);
        }
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to ${finalMode === "update" ? "update" : "add"} inventory`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingItems) {
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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate(-1);
              }
            }}
            color="error"
            variant="text"
            disableRipple
            sx={{
              minWidth: "unset",
              p: 0,
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowBackIosNewIcon sx={{ m: 0, p: 0, fontSize: 20, color: "#9b243e" }} />
          </Button>

          <Typography variant="h6" sx={{ mb: 0, fontWeight: 700, color: "#3e3e3e" }}>
            {finalMode === "add" ? "ADD INVENTORY" : "UPDATE INVENTORY"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          onClick={handleSave}
          disabled={isSubmitting}
          sx={{
            bgcolor: "#b32d3a",
            "&:hover": { bgcolor: "#9b2432" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "SAVE"}
        </Button>
      </Box>

      {/* Item Selection */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }} disabled={finalMode === "update"}>
        <InputLabel>Select Item</InputLabel>
        <Select
          value={formData.item_id}
          label="Select Item"
          onChange={(e) => handleItemChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Select an item</em>
          </MenuItem>
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name} {item.sku ? `(${item.sku})` : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Unit Cards */}
      {formData.item_id && selectedItem && (
        <Grid container spacing={2}>
          {/* Carton Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                border: "2px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#b32d3a",
                  boxShadow: "0 4px 12px rgba(179, 45, 58, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "#b32d3a",
                      borderRadius: "50%",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <Package size={20} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#3e3e3e" }}>
                    Carton
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={selectedItem.is_carton_supported ? "Supported" : "Not Supported"}
                    size="small"
                    sx={{
                      bgcolor: selectedItem.is_carton_supported ? "#27ae60" : "#c0392b",
                      color: "white",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                        Packs per Carton
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#3e3e3e" }}>
                        {selectedItem.packs_per_carton || 0}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                        Carton Price
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#27ae60" }}>
                        ${Number(selectedItem.carton_price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <KeyboardTextField
                  label="Carton Quantity"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.carton_quantity}
                  onChange={(e) => handleQuantityChange("carton_quantity", e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#b32d3a",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b32d3a",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Pack Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                border: "2px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#b32d3a",
                  boxShadow: "0 4px 12px rgba(179, 45, 58, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "#b32d3a",
                      borderRadius: "50%",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <Layers size={20} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#3e3e3e" }}>
                    Pack
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={selectedItem.supports_pack ? "Supported" : "Not Supported"}
                    size="small"
                    sx={{
                      bgcolor: selectedItem.supports_pack ? "#27ae60" : "#c0392b",
                      color: "white",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                        Units per Pack
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#3e3e3e" }}>
                        {selectedItem.units_per_pack || 0}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                        Pack Price
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#27ae60" }}>
                        ${Number(selectedItem.pack_price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <KeyboardTextField
                  label="Pack Quantity"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.pack_quantity}
                  onChange={(e) => handleQuantityChange("pack_quantity", e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#b32d3a",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b32d3a",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Piece Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                border: "2px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#b32d3a",
                  boxShadow: "0 4px 12px rgba(179, 45, 58, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "#b32d3a",
                      borderRadius: "50%",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <BoxIcon size={20} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#3e3e3e" }}>
                    Piece
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label="Always Supported"
                    size="small"
                    sx={{
                      bgcolor: "#27ae60",
                      color: "white",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                        Unit Price
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#27ae60" }}>
                        ${Number(selectedItem.price || 0).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ height: "28px" }}>
                      {/* Spacer to align with other cards */}
                    </Box>
                  </Box>
                </Box>

                <KeyboardTextField
                  label="Piece Quantity"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.piece_quantity}
                  onChange={(e) => handleQuantityChange("piece_quantity", e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#b32d3a",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b32d3a",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!formData.item_id && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            bgcolor: "#f9f9f9",
            borderRadius: 2,
            border: "2px dashed #e0e0e0",
          }}
        >
          <Package size={48} color="#b32d3a" style={{ marginBottom: "16px" }} />
          <Typography variant="h6" sx={{ color: "#666", fontWeight: 600 }}>
            Select an item to manage inventory
          </Typography>
        </Box>
      )}
    </Box>
  );
}
