import React, { useMemo } from "react";
import { Box, Checkbox, FormControlLabel, Typography, Button, InputAdornment, FormHelperText } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { Pencil } from "lucide-react";
import { Controller } from "react-hook-form";

const CHECKBOX_OPTIONS_LEFT = [
  { key: "openPrice", label: "Open Price" },
  { key: "openQuantity", label: "Open Quantity" },
  { key: "buyAsCase", label: "Buy as Case" },
];

const CHECKBOX_OPTIONS_RIGHT = [
  { key: "deliPLU", label: "Deli-PLU" },
  { key: "nonRevenue", label: "Non Revenue" },
  { key: "ebt", label: "EBT" },
  { key: "nonDiscountable", label: "Non-Discountable" },
  { key: "isNegative", label: "Is-Negative" },
];

const PRICING_FIELDS = [
  {
    name: "unitCost",
    label: "Unit Cost",
    type: "currency",
    position: "start",
  },
  {
    name: "margin",
    label: "Margin",
    type: "percentage",
    position: "end",
  },
  {
    name: "unitInCase",
    label: "Unit In Case",
    type: "number",
  },
  {
    name: "maxLevel",
    label: "Max Level",
    type: "number",
  },
  {
    name: "buyDown",
    label: "BuyDown",
    type: "percentage",
    position: "end",
  },
  {
    name: "markup",
    label: "Markup",
    type: "percentage",
    position: "end",
  },
  {
    name: "caseCost",
    label: "Case Cost",
    type: "currency",
    position: "start",
  },
  {
    name: "warnQty",
    label: "Warn QTY",
    type: "number",
  },
  {
    name: "retailPrice",
    label: "Retail Price",
    type: "currency",
    position: "start",
  },
  {
    name: "salePrice",
    label: "Sale Price",
    type: "currency",
    position: "start",
  },
  {
    name: "reOrderQty",
    label: "Re-Order Qty",
    type: "number",
  },
];

// Helper component for Checkbox Group
const CheckboxGroup = ({ options, control }) => (
  <Box className="border border-gray-300 rounded-lg p-4 w-full h-[215px] overflow-y-auto bg-gray-50">
    {options.map(({ key, label }) => (
      <Controller
        key={key}
        name={key}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            sx={{ marginBottom: "10px", marginLeft: 0 }}
            control={
              <Checkbox
                disableRipple
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                sx={{
                  color: "#a94442",
                  padding: "0 8px 0 0",
                  "&.Mui-checked": { color: "#a94442" },
                }}
              />
            }
            label={<Typography className="text-sm">{label}</Typography>}
          />
        )}
      />
    ))}
  </Box>
);

// Helper component for Pricing Field
const PricingField = ({ name, label, type, position, control, errors = {} }) => {
  const getAdornment = () => {
    if (type === "currency") {
      return (
        <InputAdornment position={position || "start"}>
          <Typography sx={{ color: "#000000", fontWeight: "700" }}>
            $
          </Typography>
        </InputAdornment>
      );
    }
    if (type === "percentage") {
      return (
        <InputAdornment position={position || "end"}>
          <Typography sx={{ color: "#000000", fontWeight: "700" }}>
            %
          </Typography>
        </InputAdornment>
      );
    }
    return null;
  };

  const hasError = !!errors?.[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box className="flex flex-col gap-1">
          <Box className="flex items-center gap-4">
            <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
              {label} <span>:</span>
            </Box>
            <KeyboardTextField
              type="number"
              value={field.value || (type === "number" ? "0" : "0.00")}
              onChange={(e) =>
                field.onChange(
                  e.target.value || (type === "number" ? "0" : "0.00")
                )
              }
              size="small"
              fullWidth
              error={hasError}
              slotProps={{
                input: getAdornment()
                  ? {
                    [position === "start" ? "startAdornment" : "endAdornment"]:
                      getAdornment(),
                  }
                  : {},
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-error": {
                    "& fieldset": {
                      borderColor: "#d32f2f",
                      borderWidth: "2px",
                    },
                  },
                },
              }}
            />
          </Box>
          {hasError && (
            <FormHelperText error sx={{ marginLeft: "135px", marginTop: 0 }}>
              {errors[name]?.message}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default function GeneralTabPanel({ control, errors = {} }) {
  // Group pricing fields into columns
  const pricingColumns = useMemo(() => {
    const col1 = PRICING_FIELDS.slice(0, 4);
    const col2 = PRICING_FIELDS.slice(4, 8);
    const col3 = PRICING_FIELDS.slice(8);
    return [col1, col2, col3];
  }, []);

  return (
    <Box className="flex flex-col gap-6">
      {/* Top Section: Checkboxes and Pricing Fields */}
      <Box className="flex justify-between items-start gap-4">
        {/* Left Checkboxes */}
        <Box className="w-[15%]">
          <CheckboxGroup options={CHECKBOX_OPTIONS_LEFT} control={control} />
        </Box>

        {/* Pricing Fields */}
        <Box className="w-[70%] flex gap-4">
          {pricingColumns.map((column, colIndex) => (
            <Box key={colIndex} className="w-1/3 flex flex-col gap-4">
              {column.map((field) => (
                <PricingField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  position={field.position}
                  control={control}
                  errors={errors}
                />
              ))}
              {/* Special handling for qtyOnHand with edit button */}
              {colIndex === 2 && (
                <Box className="flex gap-4">
                  <Controller
                    name="qtyOnHand"
                    control={control}
                    render={({ field }) => (
                      <Box className="flex items-center gap-4 flex-1">
                        <Box className="text-[16px] font-semibold leading-[1.2] text-black text-nowrap flex justify-between items-center min-w-[115px]">
                          Qty on Hand <span>:</span>
                        </Box>
                        <KeyboardTextField
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Box>
                    )}
                  />
                  <Button
                    variant="contained"
                    disableRipple
                    sx={{
                      bgcolor: "#a94442",
                      minWidth: 0,
                      "&:hover": { bgcolor: "#8b3735" },
                    }}
                  >
                    <Pencil size={18} />
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Right Checkboxes */}
        <Box className="w-[15%]">
          <CheckboxGroup options={CHECKBOX_OPTIONS_RIGHT} control={control} />
        </Box>
      </Box>

    </Box>
  );
}
