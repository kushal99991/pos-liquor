import React, { useMemo, useState, useEffect, useRef } from "react";
import { Box, FormControl, Select, MenuItem, Checkbox, FormControlLabel, Typography, Autocomplete, Button, InputAdornment, IconButton, TextField,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { Upload, Scan } from "lucide-react";
import { useGetBrandListingQuery } from "services/brandSlice";
import { useGetCateogriesListQuery } from "services/categorySlice";
import { useGetDepartmentListingQuery } from "services/departmentSlice";
import { useGetTaxesListQuery } from "services/taxSlice";
import { useGetItemGroupsQuery } from "services/itemGroupSlice";
import { Controller } from "react-hook-form";

// Mock data moved here as they are only used in this section
const mockSizes = [
  "LARGE",
  "MEDIUM",
  "SMALL",
];
const mockPacks = ["1 Pack", "3 Pack", "4 Pack", "12 Pack", "24 Pack"];
// Scan data enum mapping: API values to display names
const scanDataOptions = [
  { value: "BARCODE", label: "Barcode" },
  { value: "QR_CODE", label: "QR Code" },
  { value: "MANUAL_ENTRY", label: "Manual Entry" },
];

export default function ItemGeneralInfo({
  control,
  formData,
  imagePreview,
  fileInputRef,
  handleImageUpload,
  setValue,
  uploadProgress = 0,
  isUploading = false,
}) {
  const {data: brandListing = [] } =
    useGetBrandListingQuery();
  const {data: categoryList = [] } =
    useGetCateogriesListQuery();
  const { data: departmentListing = [] } =
    useGetDepartmentListingQuery();
  const { data: taxesList = [] } = useGetTaxesListQuery();
  const { data: itemGroupsList = [] } = useGetItemGroupsQuery();

  // Barcode scanner state (for handheld barcode scanners)
  const barcodeBuffer = useRef("");
  const barcodeTimeout = useRef(null);
  const upcInputRef = useRef(null);

  // Handle keyboard barcode scanner input (for handheld barcode scanners)
  // Barcode scanners send characters quickly followed by Enter
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle if UPC input is focused
      if (document.activeElement !== upcInputRef.current) {
        return;
      }

      // If Enter is pressed and we have a barcode in buffer, use it
      if (e.key === "Enter" && barcodeBuffer.current.length > 0) {
        e.preventDefault();
        const barcode = barcodeBuffer.current.trim();
        barcodeBuffer.current = "";
        if (barcode.length > 0) {
          setValue("upc", barcode);
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
            setValue("upc", barcodeBuffer.current.trim());
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
  }, [setValue]);


  const subCategoryList = useMemo(() => {
    if (!formData.category) return [];
    const categoryId = Number(formData.category);
    return categoryList.filter((a) => Number(a.parent_id) === categoryId);
  }, [categoryList, formData.category]);

  return (
    <Box className="p-4 flex justify-between items-start gap-4">
      <Box className="w-[15%] flex flex-col gap-4">
        <Box className="flex items-center gap-4">
          <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap">
            SKU :
          </Box>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <KeyboardTextField
                {...field}
                placeholder="SKU (e.g. ABC-001)"
                size="small"
                className="col-span-1"
                fullWidth
              />
            )}
          />
        </Box>
        <Box
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg w-full h-40 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative"
          sx={{
            cursor: isUploading ? "not-allowed" : "pointer",
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          {isUploading ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
                zIndex: 1,
              }}
            >
              <Typography
                sx={{ color: "white", mb: 1, fontWeight: 600 }}
              >
                Uploading... {uploadProgress}%
              </Typography>
              <Box
                sx={{
                  width: "80%",
                  height: 8,
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    bgcolor: "#b01d39",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          ) : null}
          {imagePreview && !isUploading ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : !isUploading ? (
            <>
              <Upload size={48} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Click to upload</span>
            </>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </Box>
      </Box>
      <Box className="w-[70%] flex flex-col gap-4">
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Name <span>:</span>
            </Box>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <KeyboardTextField
                  {...field}
                  placeholder="Item Name"
                  size="small"
                  className="col-span-1"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Size <span>:</span>
            </Box>
            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box sx={{ opacity: "0.4" }}>Select ItemSize</Box>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="" style={{ opacity: "0.4" }}>
                      Select Item Size
                    </MenuItem>
                    {mockSizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Department <span>:</span>
            </Box>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    value={
                      departmentListing.find(
                        (dept) => Number(dept.id) === Number(field.value)
                      ) || null
                    }
                    onChange={(e, newValue) =>
                      field.onChange(newValue ? Number(newValue.id) : "")
                    }
                    options={departmentListing}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      Number(option.id) === Number(value?.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Department"
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Pack <span>:</span>
            </Box>
            <Controller
              name="pack"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box sx={{ opacity: "0.4" }}>Select ItemPack</Box>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="" style={{ opacity: "0.4" }}>
                      Select ItemPack
                    </MenuItem>
                    {mockPacks.map((pack) => (
                      <MenuItem key={pack} value={pack}>
                        {pack}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Category <span>:</span>
            </Box>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    value={
                      categoryList.find((cat) => Number(cat.id) === Number(field.value)) || null
                    }
                    onChange={(_event, value) => {
                      if (value) {
                        field.onChange(Number(value.id));
                        // Clear subcategory when category changes if setValue is available
                        if (setValue) {
                          setValue("subCategory", "");
                        }
                      } else {
                        field.onChange("");
                        if (setValue) {
                          setValue("subCategory", "");
                        }
                      }
                    }}
                    options={categoryList.filter((a) => a.parent_id === null)}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      Number(option.id) === Number(value?.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Category"
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Scan Data <span>:</span>
            </Box>
            <Controller
              name="scanData"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box sx={{ opacity: "0.4" }}>Select Scan Data</Box>
                        );
                      }
                      const option = scanDataOptions.find(opt => opt.value === selected);
                      return option ? option.label : selected;
                    }}
                  >
                    <MenuItem value="" style={{ opacity: "0.4" }}>
                      Select Scan Data
                    </MenuItem>
                    {scanDataOptions.map((scan) => (
                      <MenuItem key={scan.value} value={scan.value}>
                        {scan.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Sub Category <span>:</span>
            </Box>
            <Controller
              name="subCategory"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    value={
                      subCategoryList.find((cat) => Number(cat.id) === Number(field.value)) ||
                      null
                    }
                    onChange={(_event, value) =>
                      value && field.onChange(Number(value.id))
                    }
                    options={subCategoryList}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      Number(option.id) === Number(value?.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Subcategory"
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Item Brand <span>:</span>
            </Box>
            <Controller
              name="itemBrand"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    value={
                      brandListing.find((cat) => Number(cat.id) === Number(field.value)) || null
                    }
                    onChange={(_event, value) =>
                      value && field.onChange(Number(value.id))
                    }
                    options={brandListing}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      Number(option.id) === Number(value?.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Item Brand"
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
        </Box>
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Item Type <span>:</span>
            </Box>
            <Controller
              name="itemType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box sx={{ opacity: "0.4" }}>Select itemType</Box>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="PIECE">PIECE</MenuItem>
                    <MenuItem value="PACK">PACK</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Age <span>:</span>
            </Box>
            <FormControl fullWidth size="small">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  opacity: 1,
                  pointerEvents: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px 12px",
                }}
              >
                <Controller
                  name="age"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(_event, checked) =>
                            field.onChange(checked)
                          }
                        />
                      }
                      label={"18 years or older"}
                    />
                  )}
                />
              </Box>
            </FormControl>
          </Box>
        </Box>
        <Box className="flex items-center gap-4">
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              UPC <span>:</span>
            </Box>
            <Controller
              name="upc"
              control={control}
              render={({ field }) => (
                <KeyboardTextField
                  {...field}
                  inputRef={upcInputRef}
                  placeholder="UPC"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#b01d39",
                            "&:hover": { bgcolor: "rgba(176, 29, 57, 0.1)" },
                          }}
                          title="Focus this field and scan barcode"
                        >
                          <Scan size={18} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <Box className="w-1/2 flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              Item Group <span>:</span>
            </Box>
            <Controller
              name="itemGroup"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    value={
                      itemGroupsList.find((group) => Number(group.id) === Number(field.value)) || null
                    }
                    onChange={(_event, value) => {
                      field.onChange(value ? Number(value.id) : "");
                    }}
                    options={itemGroupsList}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      Number(option.id) === Number(value?.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Item Group"
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>
        </Box>
      </Box>
      <Box className="w-[15%] flex flex-col gap-4">
        <Box className="border border-gray-300 rounded-lg p-4 w-full h-[260px] overflow-y-auto">
          {/* Non-Taxable checkbox */}
          <Controller
            name="nonTaxable"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                }
                label={<Typography className="text-sm">Non-Taxable</Typography>}
              />
            )}
          />
          {/* Dynamic tax checkboxes from API */}
          {taxesList
            .filter((tax) => tax.is_active)
            .map((tax) => (
              <Controller
                key={tax.id}
                name={`tax_${tax.id}`}
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                    label={
                      <Typography className="text-sm">
                        {tax.name} ({tax.rate}%)
                      </Typography>
                    }
                  />
                )}
              />
            ))}
        </Box>
      </Box>
    </Box>
  );
}
