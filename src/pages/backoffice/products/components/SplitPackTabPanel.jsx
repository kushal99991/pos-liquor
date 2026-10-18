import React from "react";
import { Box, Typography, Radio, RadioGroup, FormControlLabel, InputAdornment, FormHelperText } from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { Controller } from "react-hook-form";

const SplitPackField = ({ name, label, type, control, errors, disabled = false }) => {
    const getAdornment = () => {
        if (type === "currency") {
            return (
                <InputAdornment position="start">
                    <Typography sx={{ color: "#000000", fontWeight: "700" }}>
                        $
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
                <Box>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <KeyboardTextField
                        type="number"
                        value={field.value || (type === "currency" ? "1" : "1")}
                        onChange={(e) => field.onChange(type === "currency" ? parseFloat(e.target.value) || 1 : parseInt(e.target.value) || 1)}
                        size="small"
                        fullWidth
                        disabled={disabled}
                        error={hasError}
                        slotProps={{
                            input: getAdornment()
                                ? {
                                    startAdornment: getAdornment(),
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
                    {hasError && (
                        <FormHelperText error sx={{ marginLeft: 0, marginTop: "4px" }}>
                            {errors[name]?.message}
                        </FormHelperText>
                    )}
                </Box>
            )}
        />
    );
};

export default function SplitPackTabPanel({ control, errors = {}, mode }) {
    const isEdit = mode === "edit";
    return (
        <Box className="grid grid-cols-2 gap-6 mt-4">
            {/* Carton Support Section */}
            <Box className="border border-gray-300 rounded-md p-4">
                <Typography className="font-bold mb-3">Carton Support</Typography>

                <Controller
                    name="is_carton_supported"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            row
                            value={field.value ? "yes" : "no"}
                            onChange={(e) => field.onChange(e.target.value === "yes")}
                            sx={{ marginBottom: "16px" }}
                        >
                            <FormControlLabel
                                value="yes"
                                control={<Radio sx={{ color: "#a94442", "&.Mui-checked": { color: "#a94442" } }} />}
                                label="Yes"
                            />
                            <FormControlLabel
                                value="no"
                                control={<Radio sx={{ color: "#a94442", "&.Mui-checked": { color: "#a94442" } }} />}
                                label="No"
                            />
                        </RadioGroup>
                    )}
                />

                {/* Carton Fields - Always Visible */}
                <Box className="flex flex-col gap-4">
                    <SplitPackField
                        name="packs_per_carton"
                        label="Packs per Carton"
                        type="number"
                        control={control}
                        errors={errors}
                    />
                    <SplitPackField
                        name="carton_price"
                        label="Carton Price"
                        type="currency"
                        control={control}
                        errors={errors}
                    />
                    <SplitPackField
                        name="carton_stock"
                        label="Carton Quantity"
                        type="number"
                        control={control}
                        errors={errors}
                        disabled={isEdit}
                    />
                </Box>
            </Box>

            {/* Pack Support Section */}
            <Box className="border border-gray-300 rounded-md p-4">
                <Typography className="font-bold mb-3">Supports Pack</Typography>

                <Controller
                    name="supports_pack"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            row
                            value={field.value ? "yes" : "no"}
                            onChange={(e) => field.onChange(e.target.value === "yes")}
                            sx={{ marginBottom: "16px" }}
                        >
                            <FormControlLabel
                                value="yes"
                                control={<Radio sx={{ color: "#a94442", "&.Mui-checked": { color: "#a94442" } }} />}
                                label="Yes"
                            />
                            <FormControlLabel
                                value="no"
                                control={<Radio sx={{ color: "#a94442", "&.Mui-checked": { color: "#a94442" } }} />}
                                label="No"
                            />
                        </RadioGroup>
                    )}
                />

                {/* Pack Fields - Always Visible */}
                <Box className="flex flex-col gap-4">
                    <SplitPackField
                        name="units_per_pack"
                        label="Units per Pack"
                        type="number"
                        control={control}
                        errors={errors}
                    />
                    <SplitPackField
                        name="pack_price"
                        label="Pack Price"
                        type="currency"
                        control={control}
                        errors={errors}
                    />
                    <SplitPackField
                        name="pack_stock"
                        label="Pack Quantity"
                        type="number"
                        control={control}
                        errors={errors}
                        disabled={isEdit}
                    />
                </Box>
            </Box>
        </Box>
    );
}
