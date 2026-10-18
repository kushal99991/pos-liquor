import { Box, IconButton, Typography, Chip } from "@mui/material";
import { Close, Email, Phone, Star } from "@mui/icons-material";

const SelectedCustomerDisplay = ({ customer, onClear }) => {
    if (!customer?.id) return null;

    const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            <Box
                sx={{
                    background: "linear-gradient(to right, #f8fafc, #eff6ff)",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    p: 1.5,
                    position: "relative",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2
                }}
            >
                {/* Left Side: Name & Contact Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: "#1e3a8a",
                                lineHeight: 1.2,
                                fontSize: "15px"
                            }}
                        >
                            {customerName}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: "10px",
                                color: "#64748b",
                                backgroundColor: "#e2e8f0",
                                px: 0.8,
                                py: 0.2,
                                borderRadius: "4px",
                                fontWeight: 600,
                                textTransform: "uppercase"
                            }}
                        >
                            Customer
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                        {customer.email && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Email sx={{ fontSize: 13, color: "#94a3b8" }} />
                                <Typography sx={{ fontSize: "12px", color: "#475569" }}>
                                    {customer.email}
                                </Typography>
                            </Box>
                        )}

                        {customer.phone_number && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Phone sx={{ fontSize: 13, color: "#94a3b8" }} />
                                <Typography sx={{ fontSize: "12px", color: "#475569" }}>
                                    {customer.phone_number}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Right Side: Loyalty & Close */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {(customer.loyalty_tier || customer.points > 0) && (
                        <Box
                            sx={{
                                textAlign: "right",
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                px: 1.5,
                                py: 0.5
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                                <Star sx={{ fontSize: 14, color: "#eab308" }} />
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                                    {customer.points || 0} pts
                                </Typography>
                            </Box>
                            {customer.loyalty_tier && (
                                <Typography sx={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                                    {customer.loyalty_tier}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <IconButton
                        onClick={onClear}
                        size="small"
                        sx={{
                            backgroundColor: "#fee2e2",
                            color: "#ef4444",
                            width: "24px",
                            height: "24px",
                            "&:hover": {
                                backgroundColor: "#fecaca",
                            },
                        }}
                    >
                        <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default SelectedCustomerDisplay;
