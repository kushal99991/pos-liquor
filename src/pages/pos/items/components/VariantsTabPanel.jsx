import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Typography, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, Select, MenuItem, Chip,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { Pencil, Trash2, Plus, Check, XCircle, Scan } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";
import { useDeleteItemVariantMutation } from "services/itemSlice";

// Constants
const MOCK_SIZES = ["LARGE", "MEDIUM", "SMALL"];
const MOCK_PACKS = ["1 Pack", "3 Pack", "4 Pack", "12 Pack", "24 Pack"];
const SCAN_DATA_OPTIONS = [
  { value: "BARCODE", label: "Barcode" },
  { value: "QR_CODE", label: "QR Code" },
  { value: "MANUAL_ENTRY", label: "Manual Entry" },
];

// Editable Variant Row Component
const EditableVariantRow = ({
  variant,
  index,
  isEditing,
  isNew,
  onFieldChange,
  onSave,
  onCancel,
  onDelete,
  onEdit,
}) => {
  const [localVariant, setLocalVariant] = useState(() => {
    // Use variant values if they exist (for both new and existing variants)
    // This preserves auto-filled values from handleAddNewVariant
    return {
      name: variant.name || "",
      sku: variant.sku || "",
      upc: variant.upc || "",
      qty:
        variant.quantity?.toString() ||
        variant.total_quantity?.toString() ||
        variant.qty?.toString() ||
        "",
      price:
        variant.retail_price?.toString() || variant.price?.toString() || "",
      size: variant.size || "",
      pack: variant.pack || "",
      scan_type: variant.scan_type || "",
    };
  });

  // Barcode scanner state for variant (handheld barcode scanners)
  const barcodeBuffer = useRef("");
  const barcodeTimeout = useRef(null);
  const upcInputRef = useRef(null);

  const handleFieldChange = (field, value) => {
    const updated = { ...localVariant, [field]: value };
    setLocalVariant(updated);
    if (onFieldChange) {
      onFieldChange(index, updated);
    }
  };

  // Handle keyboard barcode scanner input (for handheld barcode scanners)
  // Barcode scanners send characters quickly followed by Enter
  useEffect(() => {
    if (!isEditing) return; // Only listen when editing

    const handleKeyPress = (e) => {
      // Only handle if variant UPC input is focused
      if (document.activeElement !== upcInputRef.current) {
        return;
      }

      // If Enter is pressed and we have a barcode in buffer, use it
      if (e.key === "Enter" && barcodeBuffer.current.length > 0) {
        e.preventDefault();
        const barcode = barcodeBuffer.current.trim();
        barcodeBuffer.current = "";
        if (barcode.length > 0) {
          handleFieldChange("upc", barcode);
        }
        if (barcodeTimeout.current) {
          clearTimeout(barcodeTimeout.current);
        }
        return;
      }

      // If it's a printable character, add to buffer
      // Barcode scanners send characters very quickly
      if (e.key.length === 1 && /[\w\-_\.]/.test(e.key)) {
        barcodeBuffer.current += e.key;

        // Clear any existing timeout
        if (barcodeTimeout.current) {
          clearTimeout(barcodeTimeout.current);
        }

        // Set a timeout to auto-complete if no Enter is received
        // This handles scanners that don't send Enter
        barcodeTimeout.current = setTimeout(() => {
          if (barcodeBuffer.current.length >= 8) {
            handleFieldChange("upc", barcodeBuffer.current.trim());
          }
          barcodeBuffer.current = "";
        }, 200);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
    };
  }, [isEditing]);

  const handleSave = () => {
    if (!localVariant.name?.trim()) {
      return;
    }
    onSave(index, localVariant);
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete(variant, index);
    } else {
      onCancel(index);
    }
  };

  if (!isEditing) {
    // Display mode
    return (
      <TableRow
        hover
        sx={{
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <TableCell>
          <Typography variant="body2" fontWeight="500">
            {variant.name || "-"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {variant.sku || "-"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {variant.upc || "-"}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={variant.size || "-"}
            size="small"
            variant="outlined"
            sx={{ fontSize: "11px" }}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {variant.pack || "-"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {SCAN_DATA_OPTIONS.find((opt) => opt.value === variant.scan_type)
              ?.label || "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight="600">
            {variant.quantity || variant.total_quantity || variant.qty || 0}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight="600" color="primary">
            ${Number(variant.retail_price || variant.price || 0).toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Box className="flex items-center justify-center gap-1">
            <IconButton
              onClick={() => onEdit(index)}
              size="small"
              sx={{
                color: "#1976d2",
                "&:hover": {
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                },
              }}
              title="Edit variant"
            >
              <Pencil size={16} />
            </IconButton>
            <IconButton
              onClick={() => onDelete(variant, index)}
              size="small"
              sx={{
                color: "#a94442",
                "&:hover": {
                  bgcolor: "rgba(169, 68, 66, 0.1)",
                },
              }}
              title="Delete variant"
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  // Edit mode
  return (
    <TableRow
      sx={{
        bgcolor: "rgba(169, 68, 66, 0.05)",
        "& td": {
          padding: "8px",
        },
      }}
    >
      <TableCell>
        <KeyboardTextField
          placeholder="Name *"
          size="small"
          value={localVariant.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          required
          fullWidth
          error={!localVariant.name?.trim()}
        />
      </TableCell>
      <TableCell>
        <KeyboardTextField
          placeholder="SKU"
          size="small"
          value={localVariant.sku}
          onChange={(e) => handleFieldChange("sku", e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <KeyboardTextField
          inputRef={upcInputRef}
          placeholder="UPC"
          size="small"
          value={localVariant.upc}
          onChange={(e) => handleFieldChange("upc", e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  sx={{
                    color: "#a94442",
                    "&:hover": { bgcolor: "rgba(169, 68, 66, 0.1)" },
                    p: 0.5,
                  }}
                  title="Focus this field and scan barcode"
                >
                  <Scan size={14} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <FormControl size="small" fullWidth>
          <Select
            value={localVariant.size}
            onChange={(e) => handleFieldChange("size", e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <Box sx={{ opacity: "0.4" }}>Size</Box>;
              }
              return selected;
            }}
          >
            <MenuItem value="" style={{ opacity: "0.4" }}>
              Select Size
            </MenuItem>
            {MOCK_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <FormControl size="small" fullWidth>
          <Select
            value={localVariant.pack}
            onChange={(e) => handleFieldChange("pack", e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <Box sx={{ opacity: "0.4" }}>Pack</Box>;
              }
              return selected;
            }}
          >
            <MenuItem value="" style={{ opacity: "0.4" }}>
              Select Pack
            </MenuItem>
            {MOCK_PACKS.map((pack) => (
              <MenuItem key={pack} value={pack}>
                {pack}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <FormControl size="small" fullWidth>
          <Select
            value={localVariant.scan_type}
            onChange={(e) => handleFieldChange("scan_type", e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <Box sx={{ opacity: "0.4" }}>Scan Data</Box>;
              }
              const option = SCAN_DATA_OPTIONS.find(
                (opt) => opt.value === selected
              );
              return option ? option.label : selected;
            }}
          >
            <MenuItem value="" style={{ opacity: "0.4" }}>
              Select Scan Data
            </MenuItem>
            {SCAN_DATA_OPTIONS.map((scan) => (
              <MenuItem key={scan.value} value={scan.value}>
                {scan.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="right">
        <KeyboardTextField
          type="number"
          placeholder="Qty"
          size="small"
          value={localVariant.qty}
          onChange={(e) => handleFieldChange("qty", e.target.value)}
          sx={{ width: "100px" }}
        />
      </TableCell>
      <TableCell align="right">
        <KeyboardTextField
          type="number"
          placeholder="Price"
          size="small"
          value={localVariant.price}
          onChange={(e) => handleFieldChange("price", e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: "#000000", fontWeight: "700" }}>
                    $
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: "120px" }}
        />
      </TableCell>
      <TableCell align="center">
        <Box className="flex items-center justify-center gap-1">
          <IconButton
            onClick={handleSave}
            size="small"
            disabled={!localVariant.name?.trim()}
            sx={{
              color: "#4caf50",
              "&:hover": {
                bgcolor: "rgba(76, 175, 80, 0.1)",
              },
              "&:disabled": {
                color: "#cccccc",
              },
            }}
            title="Save variant"
          >
            <Check size={18} />
          </IconButton>
          <IconButton
            onClick={handleCancel}
            size="small"
            sx={{
              color: "#a94442",
              "&:hover": {
                bgcolor: "rgba(169, 68, 66, 0.1)",
              },
            }}
            title="Cancel"
          >
            <XCircle size={18} />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default function VariantsTabPanel({ control, mode, trigger }) {
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    update: updateVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });
  console.log(variantFields, "variantFields");
  

  const formData = useWatch({ control });
  const [deleteItemVariant] = useDeleteItemVariantMutation();
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [originalVariantData, setOriginalVariantData] = useState(null);

  // Handle adding new variant
  const handleAddNewVariant = useCallback(() => {
    // Calculate variant number based on existing variants (including those without IDs)
    const allVariantsCount = variantFields.length;
    let variantNumber = allVariantsCount + 1;
    
    // Generate unique name and SKU by checking for duplicates
    let proposedName = formData.name
      ? `${formData.name} - variant - ${variantNumber}`
      : "";
    let proposedSku = formData.sku
      ? `${formData.sku}-V${variantNumber}`
      : "";
    
    // Check if the proposed name or SKU already exists, increment if needed
    const nameExists = variantFields.some(
      (v) => v.name?.toLowerCase() === proposedName.toLowerCase()
    );
    const skuExists = variantFields.some(
      (v) => v.sku?.toLowerCase() === proposedSku.toLowerCase()
    );
    
    // If duplicate found, increment the variant number until unique
    while (nameExists || skuExists) {
      variantNumber++;
      proposedName = formData.name
        ? `${formData.name} - variant - ${variantNumber}`
        : "";
      proposedSku = formData.sku
        ? `${formData.sku}-V${variantNumber}`
        : "";
      
      const nameCheck = variantFields.some(
        (v) => v.name?.toLowerCase() === proposedName.toLowerCase()
      );
      const skuCheck = variantFields.some(
        (v) => v.sku?.toLowerCase() === proposedSku.toLowerCase()
      );
      
      if (!nameCheck && !skuCheck) {
        break;
      }
    }
    
    // Auto-generate UPC (12-digit) - ensure it's unique
    let generatedUpc = Math.floor(
      100000000000 + Math.random() * 900000000000
    ).toString();
    
    // Check if UPC already exists, regenerate if needed
    while (variantFields.some((v) => v.upc === generatedUpc)) {
      generatedUpc = Math.floor(
        100000000000 + Math.random() * 900000000000
      ).toString();
    }
    
    // Add a temporary new variant that will be in edit mode
    const newIndex = variantFields.length;
    
    // Auto-fill values from form data
    // Note: Do NOT include id field for new variants
    const newVariant = {
      name: proposedName,
      sku: proposedSku,
      upc: generatedUpc,
      qty: formData.qtyOnHand?.toString() || "0",
      price: formData.retailPrice?.toString() || "0.00",
      size: formData.size || "",
      pack: formData.pack || "",
      scan_type: formData.scanData || "",
      quantity: Number(formData.qtyOnHand || 0),
      retail_price: Number(formData.retailPrice || 0),
      // Explicitly do not set id for new variants
    };
    
    appendVariant(newVariant);
    setEditingVariantIndex(newIndex);
  }, [appendVariant, variantFields, formData]);

  // Handle editing variant
  const handleEditVariant = useCallback(
    (index) => {
      setEditingVariantIndex(index);
      const variant = variantFields[index];
      // Store original data for cancel
      setOriginalVariantData({ ...variant });
    },
    [variantFields]
  );

  // Handle field change during editing
  const handleFieldChange = useCallback(() => {
    // Field changes are handled locally in EditableVariantRow
  }, []);

  // Handle saving variant
  const handleSaveVariant = useCallback(
    (index, variantData) => {
      // Validate required fields
      if (!variantData.name?.trim()) {
        return; // Don't save if name is empty
      }

      const existingVariant = variantFields[index];
      const isNew = !existingVariant?.variant_id;

      // Check for duplicate name or SKU (excluding current variant)
      const duplicateName = variantFields.some(
        (v, i) =>
          i !== index &&
          v.name?.toLowerCase() === variantData.name?.trim().toLowerCase()
      );
      const duplicateSku = variantFields.some(
        (v, i) =>
          i !== index &&
          v.sku?.toLowerCase() === variantData.sku?.trim().toLowerCase() &&
          variantData.sku?.trim()
      );

      if (duplicateName) {
        // Show error - variant with this name already exists
        console.warn("Variant with this name already exists");
        return;
      }

      if (duplicateSku) {
        // Show error - variant with this SKU already exists
        console.warn("Variant with this SKU already exists");
        return;
      }

      // Ensure all required fields are properly formatted
      const variantToSave = {
        ...existingVariant,
        ...(isNew ? {} : { id: existingVariant.variant_id }),
        name: variantData.name?.trim() || "",
        sku: variantData.sku?.trim() || "",
        upc: variantData.upc?.trim() || "",
        size: variantData.size || "",
        pack: variantData.pack || "",
        scan_type: variantData.scan_type || null,
        quantity: Number(variantData.qty || 0),
        qty: variantData.qty?.toString() || "0",
        retail_price: Number(variantData.price || 0),
        price: variantData.price?.toString() || "0.00",
        // Ensure these fields exist for API compatibility
        sale_price: existingVariant?.sale_price || 0,
        unit_cost: existingVariant?.unit_cost || 0,
        total_quantity: Number(variantData.qty || 0),
      };

      // Remove id if it's invalid (NaN, string UUID, etc.) for new variants
      if (isNew || !variantToSave.id || isNaN(variantToSave.id) || typeof variantToSave.id === "string") {
        delete variantToSave.id;
      }

      // Update the variant in the field array
      updateVariant(index, variantToSave);

      // Trigger validation for the variants field to ensure form state is updated
      if (trigger) {
        // Validate the specific variant and the variants array
        Promise.all([
          trigger(`variants.${index}`),
          trigger("variants")
        ]).catch(() => {
          // Ignore validation errors, just ensure form state is updated
        });
      }

      // Exit edit mode
      setEditingVariantIndex(null);
      setOriginalVariantData(null);
    },
    [variantFields, updateVariant, trigger]
  );

  // Handle canceling edit
  const handleCancelEdit = useCallback(
    (index) => {
      // If canceling an existing variant edit, restore original data
      if (originalVariantData && variantFields[index]?.variant_id) {
        updateVariant(index, originalVariantData);
      }
      setEditingVariantIndex(null);
      setOriginalVariantData(null);
    },
    [originalVariantData, variantFields, updateVariant]
  );

  // Handle deleting variant
  const handleDeleteVariant = useCallback(
    async (variant, index) => {
      console.log(variant, "variant.id");
      
      // Only delete from API if variant has a valid numeric ID (not UUID or string)
      const hasValidId = 
        variant.variant_id && 
        typeof variant.variant_id === "number" && 
        !isNaN(variant.variant_id) && 
        isFinite(variant.variant_id);
      
      if (hasValidId && mode === "edit") {
        try {
          await deleteItemVariant(variant.variant_id).unwrap();
        } catch (error) {
          console.error("Error deleting variant:", error);
          // Still remove from UI even if API call fails
        }
      }
      // Remove from field array (always remove from UI, even if it's a new variant or has invalid ID)
      removeVariant(index);
      if (editingVariantIndex === index) {
        setEditingVariantIndex(null);
        setOriginalVariantData(null);
      }
    },
    [mode, deleteItemVariant, removeVariant, editingVariantIndex]
  );

  return (
    <Box className="flex flex-col gap-4">
      <Box className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Box className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#424242] to-[#525252] text-white">
          <Typography fontWeight="bold" fontSize="16px">
            Product Variants
          </Typography>
          <Box className="flex items-center gap-3">
            <Chip
              label={`${variantFields.length} Variant${
                variantFields.length !== 1 ? "s" : ""
              }`}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: "600",
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleAddNewVariant}
              disableRipple
              disabled={editingVariantIndex !== null}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
                "&:disabled": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              Add New Variant
            </Button>
          </Box>
        </Box>

        <Box className="p-4">
          {variantFields.length === 0 ? (
            <Box className="text-center py-8">
              <Typography color="text.secondary" variant="body1">
                No variants available. Click "Add New Variant" to create one.
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 500,
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Name",
                      "SKU",
                      "UPC",
                      "Size",
                      "Pack",
                      "Scan Data",
                      "Qty",
                      "Price",
                      "Actions",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        align={
                          header === "Qty" || header === "Price"
                            ? "right"
                            : header === "Actions"
                            ? "center"
                            : "left"
                        }
                        sx={{
                          fontWeight: "bold",
                          bgcolor: "#f5f5f5",
                          color: "#424242",
                          fontSize: "13px",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variantFields.map((variantField, index) => {
                    const variant = variantField;
                    const isEditing = editingVariantIndex === index;
                    // A variant is new if it doesn't have a valid numeric id
                    const isNew = isEditing && (
                      !variant.id || 
                      isNaN(variant.id) || 
                      typeof variant.id !== "number"
                    );

                    return (
                      <EditableVariantRow
                        key={variant.id || variantField.id || index}
                        variant={variant}
                        index={index}
                        isEditing={isEditing}
                        isNew={isNew}
                        formData={formData}
                        variantFields={variantFields}
                        onFieldChange={handleFieldChange}
                        onSave={handleSaveVariant}
                        onCancel={handleCancelEdit}
                        onDelete={handleDeleteVariant}
                        onEdit={handleEditVariant}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}

