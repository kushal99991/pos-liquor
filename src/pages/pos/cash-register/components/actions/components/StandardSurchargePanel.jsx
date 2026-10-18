import { Box, Button, Typography } from "@mui/material";
import React from "react";

export default function StandardSurchargePanel({
    standardSurcharges = [],
    activeTab,
    setActiveTab,
    selectedSurcharge,
    setSelectedSurcharge,
    handleApply,
    handleRemove,
    hasAppliedSurcharge,
}) {
    // Standard Surcharges for Liquor Store POS
    const surcharges = standardSurcharges.length > 0 ? standardSurcharges : [
        { id: 101, name: "BOTTLE DEPOSIT ($0.10)", type: "AMOUNT", value: 0.10 },
        { id: 102, name: "KEG/CRATE DEPOSIT ($10)", type: "AMOUNT", value: 10 },
        { id: 103, name: "CREDIT CARD FEE (3%)", type: "PERCENTAGE", value: 3 },
        { id: 104, name: "LATE NIGHT FEE (5%)", type: "PERCENTAGE", value: 5 },
        { id: 105, name: "CORKAGE FEE ($15)", type: "AMOUNT", value: 15 },
        { id: 106, name: "LARGE GROUP FEE (18%)", type: "PERCENTAGE", value: 18 },
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Type Tabs - Optional for filtering, but mirroring Discount UI structure */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box sx={{ backgroundColor: "#e5e7eb", borderRadius: "8px", p: 0.5, display: "flex" }}>
                    <Button
                        onClick={() => setActiveTab("PERCENTAGE")}
                        sx={{
                            px: 4,
                            py: 1,
                            borderRadius: "6px",
                            color: activeTab === "PERCENTAGE" ? "white" : "black",
                            backgroundColor: activeTab === "PERCENTAGE" ? "#b91c1c" : "transparent",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: activeTab === "PERCENTAGE" ? "#991b1b" : "rgba(0,0,0,0.05)",
                            },
                        }}
                    >
                        Percentage (%)
                    </Button>
                    <Button
                        onClick={() => setActiveTab("AMOUNT")}
                        sx={{
                            px: 4,
                            py: 1,
                            borderRadius: "6px",
                            color: activeTab === "AMOUNT" ? "white" : "black",
                            backgroundColor: activeTab === "AMOUNT" ? "#b91c1c" : "transparent",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: activeTab === "AMOUNT" ? "#991b1b" : "rgba(0,0,0,0.05)",
                            },
                        }}
                    >
                        Dollar ($)
                    </Button>
                </Box>
            </Box>

            {/* Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 2,
                    mb: 4,
                    maxHeight: "400px",
                    overflowY: "auto",
                }}
            >
                {surcharges
                    .filter(items => items.type === activeTab)
                    .map((item) => (
                        <Button
                            key={item.id}
                            onClick={() => setSelectedSurcharge(item)}
                            sx={{
                                backgroundColor: selectedSurcharge?.id === item.id ? "#b91c1c" : "#e5e7eb",
                                color: selectedSurcharge?.id === item.id ? "white" : "black",
                                height: "100px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "13px",
                                textAlign: "center",
                                border: "1px solid #d1d5db",
                                "&:hover": {
                                    backgroundColor: selectedSurcharge?.id === item.id ? "#991b1b" : "#d1d5db",
                                },
                            }}
                        >
                            <Box>{item.name}</Box>
                            <Box sx={{ mt: 1, fontSize: "16px", fontWeight: 700 }}>
                                {item.type === "PERCENTAGE" ? `${item.value}%` : `$${item.value}`}
                            </Box>
                        </Button>
                    ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                {(hasAppliedSurcharge) && (
                    <Button
                        onClick={handleRemove}
                        variant="contained"
                        sx={{
                            backgroundColor: "#000000",
                            color: "white",
                            padding: "12px 32px",
                            fontSize: "14px",
                            fontWeight: 700,
                            "&:hover": { backgroundColor: "#333333" },
                        }}
                    >
                        REMOVE
                    </Button>
                )}

                <Button
                    onClick={handleApply}
                    disabled={!selectedSurcharge}
                    variant="contained"
                    sx={{
                        backgroundColor: "#b91c1c",
                        color: "white",
                        padding: "12px 48px",
                        fontSize: "14px",
                        fontWeight: 700,
                        "&:hover": { backgroundColor: "#991b1b" },
                        "&.Mui-disabled": { backgroundColor: "#e5e7eb", color: "#9ca3af" },
                    }}
                >
                    APPLY
                </Button>
            </Box>
        </Box>
    );
}
