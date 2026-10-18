import React, { useState, useEffect } from "react";
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, MenuItem, Radio, RadioGroup, Select, Tab, Tabs, Typography, } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const taxOptions = [
  { label: "Non-Taxable", value: "non-taxable" },
  { label: "TAX1 (6.25%)", value: "tax1" },
  { label: "TAX2 (7.00%)", value: "tax2" },
  { label: "TAX3 (5.50%)", value: "tax3" },
  { label: "TAX4 (8.00%)", value: "tax4" },
  { label: "TAX5 (10.00%)", value: "tax5" },
];

const tabs = [
  "General",
  "Split-Pack",
  "Price-Level",
  "Special Pricing",
  "Tag Along",
  "Distributors",
  "E-commerce",
];

export default function AddItemDialog({ open, onClose, mode = "add", selectedItem = null, onSave }) {
  const [activeTab, setActiveTab] = useState(0);
  const [taxChecked, setTaxChecked] = useState({});
  // Initialize form state from selectedItem if editing
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    unitCost: 0,
    retailPrice: 0,
    salePrice: 0,
    qtyOnHand: 0,
    is_carton_supported: false,
    packs_per_carton: 1,
    carton_price: 1,
    supports_pack: false,
    units_per_pack: 1,
    pack_price: 1,
  });

  // Update form data when selectedItem changes
  useEffect(() => {
    if (selectedItem && mode === "edit") {
      setFormData({
        sku: selectedItem.sku || "",
        name: selectedItem.itemName || "",
        unitCost: selectedItem.cost || 0,
        retailPrice: selectedItem.price || 0,
        salePrice: selectedItem.salePrice || 0,
        qtyOnHand: selectedItem.stock || 0,
        is_carton_supported: selectedItem.is_carton_supported || false,
        packs_per_carton: selectedItem.packs_per_carton || 1,
        carton_price: selectedItem.carton_price || 1,
        supports_pack: selectedItem.supports_pack || false,
        units_per_pack: selectedItem.units_per_pack || 1,
        pack_price: selectedItem.pack_price || 1,
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        unitCost: 0,
        retailPrice: 0,
        salePrice: 0,
        qtyOnHand: 0,
        is_carton_supported: false,
        packs_per_carton: 1,
        carton_price: 1,
        supports_pack: false,
        units_per_pack: 1,
        pack_price: 1,
      });
    }
  }, [selectedItem, mode]);

  const handleTaxChange = (val) => {
    setTaxChecked((prev) => ({ ...prev, [val]: !prev[val] }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      scroll="paper"
      PaperProps={{ className: "max-w-[1250px]" }}
    >
      {/* Dialog Title with back and Save */}
      <DialogTitle className="flex justify-between items-center">
        <Button
          startIcon={<ArrowBackIosNewIcon />}
          color="error"
          variant="text"
          className="font-bold"
          onClick={onClose}
        >
          {mode === "add" ? "ADD ITEM" : "EDIT ITEM"}
        </Button>

        <Button
          variant="contained"
          color="error"
          className="font-bold capitalize rounded-md px-6"
          onClick={() => {
            if (onSave) {
              onSave(formData);
            }
            onClose();
          }}
        >
          SAVE
        </Button>
      </DialogTitle>

      <DialogContent dividers className="p-4 bg-white font-sans select-none">
        {/* Main content top */}
        <Box className="flex gap-6">
          {/* Left image placeholder */}
          <Box className="flex flex-col items-center justify-center border border-gray-300 rounded-md w-[150px] h-[150px] bg-gray-100 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4m-4-8v6"
              />
            </svg>
          </Box>

          {/* Form inputs grid */}
          <Box className="flex-1 grid grid-cols-3 gap-x-8 gap-y-2">
            {/* First column */}
            <KeyboardTextField
              label="SKU"
              variant="outlined"
              size="small"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="col-span-1"
              fullWidth
            />

            <KeyboardTextField
              label="Name"
              variant="outlined"
              size="small"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-2"
              fullWidth
            />

            {/* Department with plus */}
            <Box className="flex items-center col-span-1 gap-2">
              <Select
                displayEmpty
                size="small"
                className="flex-grow"
                defaultValue=""
                inputProps={{ "aria-label": "Select Department" }}
              >
                <MenuItem value="" disabled>
                  Select Department
                </MenuItem>
              </Select>
              <IconButton color="error" size="small">
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>

            {/* Size */}
            <Select
              displayEmpty
              size="small"
              className="col-span-1"
              defaultValue=""
              inputProps={{ "aria-label": "Select Item Size" }}
            >
              <MenuItem value="" disabled>
                Select ItemSize
              </MenuItem>
            </Select>

            {/* Pack with plus */}
            <Box className="flex items-center col-span-1 gap-2">
              <Select
                displayEmpty
                size="small"
                className="flex-grow"
                defaultValue=""
                inputProps={{ "aria-label": "Select ItemPack" }}
              >
                <MenuItem value="" disabled>
                  Select ItemPack
                </MenuItem>
              </Select>
              <IconButton color="error" size="small">
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>

            {/* Category with plus */}
            <Box className="flex items-center col-span-1 gap-2">
              <Select
                displayEmpty
                size="small"
                className="flex-grow"
                defaultValue=""
                inputProps={{ "aria-label": "Select Category" }}
              >
                <MenuItem value="" disabled>
                  Select Category
                </MenuItem>
              </Select>
              <IconButton color="error" size="small">
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>

            {/* Scan Data with plus */}
            <Box className="flex items-center col-span-1 gap-2">
              <Select
                displayEmpty
                size="small"
                className="flex-grow"
                defaultValue=""
                inputProps={{ "aria-label": "Select Scan Data" }}
              >
                <MenuItem value="" disabled>
                  Select Scan Data
                </MenuItem>
              </Select>
              <IconButton color="error" size="small">
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>

            {/* Sub Category */}
            <Select
              displayEmpty
              size="small"
              className="col-span-1"
              defaultValue=""
              inputProps={{ "aria-label": "Select Subcategory" }}
            >
              <MenuItem value="" disabled>
                Select Subcategory
              </MenuItem>
            </Select>

            {/* Item Brand with plus */}
            <Box className="flex items-center col-span-1 gap-2">
              <Select
                displayEmpty
                size="small"
                className="flex-grow"
                defaultValue=""
                inputProps={{ "aria-label": "Select Item Brand" }}
              >
                <MenuItem value="" disabled>
                  Select Item Brand
                </MenuItem>
              </Select>
              <IconButton color="error" size="small">
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>

            {/* Item Type */}
            <Select
              size="small"
              className="col-span-1"
              defaultValue="Standard"
              inputProps={{ "aria-label": "Item Type" }}
            >
              <MenuItem value="Standard">Standard</MenuItem>
            </Select>

            {/* Age */}
            <Select
              displayEmpty
              size="small"
              className="col-span-1"
              defaultValue=""
              inputProps={{ "aria-label": "Select Age" }}
            >
              <MenuItem value="" disabled>
                Select Age
              </MenuItem>
            </Select>
          </Box>

          {/* Right tax checkboxes */}
          <Box className="flex flex-col gap-1 ml-6 border border-gray-300 rounded-md px-4 py-2 h-[150px] overflow-auto max-h-[150px]">
            {taxOptions.map(({ label, value }) => (
              <FormControlLabel
                key={value}
                control={
                  <Checkbox
                    checked={!!taxChecked[value]}
                    onChange={() => handleTaxChange(value)}
                    size="small"
                  />
                }
                label={<Typography className="text-sm">{label}</Typography>}
              />
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="mt-6 border-b border-gray-300">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="error"
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            aria-label="item tabs"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                sx={{ fontWeight: "bold", textTransform: "none" }}
                disableRipple
              />
            ))}
          </Tabs>
        </Box>

        {/* Form fields under Split-Pack tab */}
        {activeTab === 1 && (
          <Box className="grid grid-cols-2 gap-6 mt-4">
            {/* Carton Support Section */}
            <Box className="border border-gray-300 rounded-md p-4">
              <Typography className="font-bold mb-3">Carton Support</Typography>
              <RadioGroup
                row
                value={formData.is_carton_supported ? "yes" : "no"}
                onChange={(e) => setFormData({ ...formData, is_carton_supported: e.target.value === "yes" })}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>

              {formData.is_carton_supported && (
                <Box className="mt-4 flex flex-col gap-4">
                  <KeyboardTextField
                    label="Packs per Carton"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={formData.packs_per_carton}
                    onChange={(e) => setFormData({ ...formData, packs_per_carton: parseInt(e.target.value) || 1 })}
                    fullWidth
                  />
                  <KeyboardTextField
                    label="Carton Price"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={formData.carton_price}
                    onChange={(e) => setFormData({ ...formData, carton_price: parseFloat(e.target.value) || 1 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    fullWidth
                  />
                </Box>
              )}
            </Box>

            {/* Pack Support Section */}
            <Box className="border border-gray-300 rounded-md p-4">
              <Typography className="font-bold mb-3">Supports Pack</Typography>
              <RadioGroup
                row
                value={formData.supports_pack ? "yes" : "no"}
                onChange={(e) => setFormData({ ...formData, supports_pack: e.target.value === "yes" })}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>

              {formData.supports_pack && (
                <Box className="mt-4 flex flex-col gap-4">
                  <KeyboardTextField
                    label="Units per Pack"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={formData.units_per_pack}
                    onChange={(e) => setFormData({ ...formData, units_per_pack: parseInt(e.target.value) || 1 })}
                    fullWidth
                  />
                  <KeyboardTextField
                    label="Pack Price"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={formData.pack_price}
                    onChange={(e) => setFormData({ ...formData, pack_price: parseFloat(e.target.value) || 1 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    fullWidth
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Form fields under General tab */}
        {activeTab === 0 && (
          <Box className="grid grid-cols-12 gap-4 mt-4">
            {/* Left column checkboxes and fields */}
            <Box className="col-span-4 flex flex-col gap-4">
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Open Price"
              />
              <KeyboardTextField
                label="Unit Cost"
                variant="outlined"
                size="small"
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />

              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Open Quantity"
              />
              <KeyboardTextField
                label="Margin"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                defaultValue="0.00"
                fullWidth
              />

              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Buy as Case"
              />
              <KeyboardTextField
                label="Unit In Case"
                variant="outlined"
                size="small"
                type="number"
                defaultValue="0"
                fullWidth
              />

              <KeyboardTextField
                label="Max Level"
                variant="outlined"
                size="small"
                type="number"
                defaultValue="0"
                fullWidth
              />
            </Box>

            {/* Center column */}
            <Box className="col-span-4 flex flex-col gap-4">
              <KeyboardTextField
                label="BuyDown"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                defaultValue="0.00"
                fullWidth
              />

              <KeyboardTextField
                label="Markup"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                defaultValue="0.00"
                fullWidth
              />

              <KeyboardTextField
                label="Case Cost"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                defaultValue="0.00"
                fullWidth
              />

              <KeyboardTextField
                label="Warn QTY"
                variant="outlined"
                size="small"
                type="number"
                defaultValue="0"
                fullWidth
              />
            </Box>

            {/* Right column */}
            <Box className="col-span-4 flex flex-col gap-4">
              <KeyboardTextField
                label="Retail Price"
                variant="outlined"
                size="small"
                type="number"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />

              <Box className="flex items-center gap-2">
                <KeyboardTextField
                  label="Qty on Hand"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={formData.qtyOnHand}
                  onChange={(e) => setFormData({ ...formData, qtyOnHand: parseInt(e.target.value) || 0 })}
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  className="!min-w-[36px] !p-1"
                >
                  ✏️
                </Button>
              </Box>

              <KeyboardTextField
                label="Sale Price"
                variant="outlined"
                size="small"
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />

              <KeyboardTextField
                label="Re-Order Qty"
                variant="outlined"
                size="small"
                type="number"
                defaultValue="0"
                fullWidth
              />
            </Box>

            {/* Right side checkboxes column */}
            <Box className="col-span-12 flex flex-wrap gap-4 mt-2">
              {[
                "Deli-PLU",
                "Non Revenue",
                "EBT",
                "Non-Discountable",
                "Is-Negative",
              ].map((label) => (
                <FormControlLabel
                  key={label}
                  control={<Checkbox size="small" />}
                  label={label}
                  className="whitespace-nowrap"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Bottom panels */}
        <Box className="mt-6 grid grid-cols-12 gap-4">
          {/* UPC List */}
          <Box className="col-span-5 border border-gray-300 rounded-md p-3">
            <Typography className="font-bold mb-2">UPC List</Typography>
            <Box className="flex items-center gap-2">
              <KeyboardTextField
                variant="outlined"
                size="small"
                placeholder="Enter UPC"
                fullWidth
              />
              <Button variant="contained" color="error" size="small">
                Add
              </Button>
            </Box>
          </Box>

          {/* EBT Messages */}
          <Box className="col-span-7 border border-gray-300 rounded-md p-3">
            <Typography className="font-bold mb-2">EBT Messages</Typography>
            <KeyboardTextField
              variant="outlined"
              size="small"
              multiline
              rows={3}
              placeholder="Enter EBT messages"
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
