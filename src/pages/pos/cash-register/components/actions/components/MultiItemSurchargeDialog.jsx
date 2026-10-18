import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Button,
    Box,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";

export default function MultiItemSurchargeDialog({
    open,
    onClose,
    selectedItemsCount,
    onApply,
}) {
    const [activeTab, setActiveTab] = useState("PERCENTAGE"); // 'PERCENTAGE' or 'AMOUNT'
    const [customValue, setCustomValue] = useState("0.00");

    const handleNumberClick = (num) => {
        if (customValue === "0.00") {
            setCustomValue(num === "." ? "0." : num);
        } else {
            setCustomValue(customValue + num);
        }
    };

    const handleClear = () => setCustomValue("0.00");

    const handleBackspace = () => {
        if (customValue.length > 1) setCustomValue(customValue.slice(0, -1));
        else setCustomValue("0.00");
    };

    const handleEnter = () => {
        const value = parseFloat(customValue);
        if (isNaN(value) || value <= 0) return;

        onApply({
            value: value,
            mode: activeTab,
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 0,
                    backgroundColor: "#f3f4f6",
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: "#b91c1c",
                    color: "white",
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                    Surcharge on {selectedItemsCount} Items
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: "white",
                        backgroundColor: "#dc2626",
                        borderRadius: "50%",
                        padding: "4px",
                        "&:hover": { backgroundColor: "#991b1b" },
                    }}
                    size="small"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: 0 }}>
                <Box sx={{ display: "flex", marginBottom: "24px", gap: 0 }}>
                    <Button
                        onClick={() => setActiveTab("PERCENTAGE")}
                        sx={{
                            flex: 1,
                            backgroundColor:
                                activeTab === "PERCENTAGE" ? "#b91c1c" : "#000000",
                            color: "white",
                            padding: "16px 24px",
                            fontSize: "13px",
                            fontWeight: 700,
                            borderRadius: 0,
                            "&:hover": {
                                backgroundColor:
                                    activeTab === "PERCENTAGE" ? "#991b1b" : "#1f2937",
                            },
                        }}
                    >
                        PERCENTAGE (%)
                    </Button>
                    <Button
                        onClick={() => setActiveTab("AMOUNT")}
                        sx={{
                            flex: 1,
                            backgroundColor: activeTab === "AMOUNT" ? "#b91c1c" : "#000000",
                            color: "white",
                            padding: "16px 24px",
                            fontSize: "13px",
                            fontWeight: 700,
                            borderRadius: 0,
                            "&:hover": {
                                backgroundColor: activeTab === "AMOUNT" ? "#991b1b" : "#1f2937",
                            },
                        }}
                    >
                        AMOUNT ($)
                    </Button>
                </Box>

                <Box sx={{ padding: "0 24px 24px" }}>
                    <Box
                        sx={{
                            backgroundColor: "#4b5563",
                            borderRadius: "8px",
                            padding: "32px",
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "#374151",
                                borderRadius: "8px",
                                padding: "20px 24px",
                                marginBottom: "24px",
                                textAlign: "center",
                                border: "2px solid #6b7280",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: "32px",
                                    fontWeight: 600,
                                    fontFamily: "monospace",
                                }}
                            >
                                {activeTab === "PERCENTAGE" ? "%" : "$"} {customValue}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "10px",
                            }}
                        >
                            {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                ".",
                                "0",
                                "00",
                            ].map((btn) => (
                                <Button
                                    key={btn}
                                    onClick={() => handleNumberClick(btn)}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "white",
                                        color: "#b91c1c",
                                        fontSize: "28px",
                                        fontWeight: 700,
                                        padding: "20px",
                                        borderRadius: "8px",
                                        minHeight: "70px",
                                        "&:hover": { backgroundColor: "#f9fafb" },
                                    }}
                                >
                                    {btn}
                                </Button>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "10px",
                                marginTop: "10px",
                            }}
                        >
                            <Button
                                onClick={handleBackspace}
                                variant="contained"
                                sx={{
                                    backgroundColor: "#d1d5db",
                                    color: "#b91c1c",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    padding: "20px",
                                    borderRadius: "8px",
                                    minHeight: "70px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    "&:hover": { backgroundColor: "#e5e7eb" },
                                }}
                            >
                                <ClearIcon sx={{ fontSize: "28px" }} />
                            </Button>
                            <Button
                                onClick={handleClear}
                                variant="contained"
                                sx={{
                                    backgroundColor: "#b91c1c",
                                    color: "white",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    padding: "20px",
                                    borderRadius: "8px",
                                    minHeight: "70px",
                                    "&:hover": { backgroundColor: "#991b1b" },
                                }}
                            >
                                CLEAR
                            </Button>
                            <Button
                                onClick={handleEnter}
                                variant="contained"
                                sx={{
                                    backgroundColor: "#b91c1c",
                                    color: "white",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    padding: "20px",
                                    borderRadius: "8px",
                                    minHeight: "70px",
                                    "&:hover": { backgroundColor: "#991b1b" },
                                }}
                            >
                                ENTER
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
