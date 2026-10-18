import { Box, Button, Typography } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/Backspace";

export default function CustomSurchargePanel({
    activeTab, // 'PERCENTAGE' or 'AMOUNT'
    setActiveTab,
    customValue,
    handleNumberClick,
    handleClear,
    handleBackspace,
    handleApply,
    handleRemove,
    hasAppliedSurcharge,
}) {
    const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "00"];

    return (
        <Box sx={{ p: 3 }}>
            {/* Tabs */}
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                mb: 4,
                backgroundColor: "#e5e7eb",
                p: 0.5,
                borderRadius: "8px",
                width: "fit-content",
                mx: "auto"
            }}>
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
                        }
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
                        }
                    }}
                >
                    Dollar ($)
                </Button>
            </Box>

            {/* Display */}
            <Box sx={{ backgroundColor: "#374151", borderRadius: "8px", p: 4, maxWidth: "400px", mx: "auto" }}>
                <Box sx={{ backgroundColor: "#4b5563", borderRadius: "8px", p: 2, mb: 3, textAlign: "right" }}>
                    <Typography sx={{ color: "#d1d5db", fontSize: "24px", fontWeight: 500 }}>
                        {activeTab === "PERCENTAGE" ? "%" : "$"} {customValue}
                    </Typography>
                </Box>

                {/* Numpad */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                    {buttons.map((btn) => (
                        <Button key={btn} onClick={() => handleNumberClick(btn)} variant="contained"
                            sx={{ backgroundColor: "white", color: "#b91c1c", fontSize: "24px", fontWeight: 700 }}>
                            {btn}
                        </Button>
                    ))}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, mt: 1.5 }}>
                    <Button onClick={handleBackspace} variant="contained" sx={{ backgroundColor: "white", color: "#b91c1c" }}>
                        <BackspaceIcon />
                    </Button>
                    <Button onClick={handleClear} variant="contained" sx={{ backgroundColor: "#b91c1c", color: "white" }}>
                        CLEAR
                    </Button>
                    <Button onClick={handleApply} variant="contained" sx={{ backgroundColor: "#b91c1c", color: "white" }}>
                        ENTER
                    </Button>
                </Box>
            </Box>

            {/* Remove Button */}
            {hasAppliedSurcharge && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Button
                        onClick={handleRemove}
                        variant="contained"
                        sx={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            px: 4,
                            py: 1.5,
                            fontWeight: 700,
                            "&:hover": { backgroundColor: "#374151" },
                        }}
                    >
                        REMOVE SURCHARGE
                    </Button>
                </Box>
            )}
        </Box>
    );
}
