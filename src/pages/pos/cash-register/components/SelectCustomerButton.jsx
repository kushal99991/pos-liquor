import { Box, Button } from "@mui/material";
import { Person, Close } from "@mui/icons-material";

const SelectCustomerButton = ({ customer, onClick, onClear }) => {
    const hasCustomer = customer?.id;
    const customerName = hasCustomer
        ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
        : "";

    return (
        <Box
            sx={{
                px: 2,
                py: 1.5,
                backgroundColor: "#f3f4f6",
                borderBottom: "1px solid #e5e7eb",
            }}
        >
            {hasCustomer ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Person sx={{ fontSize: 20, color: "#6b7280" }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                                sx={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                }}
                            >
                                Customer
                            </Box>
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#111827",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {customerName}
                            </Box>
                            {customer.email && (
                                <Box
                                    sx={{
                                        fontSize: "11px",
                                        color: "#6b7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {customer.email}
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        sx={{
                            minWidth: "auto",
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderRadius: "4px",
                            "&:hover": {
                                backgroundColor: "#dc2626",
                            },
                        }}
                    >
                        <Close sx={{ fontSize: 18 }} />
                    </Button>
                </Box>
            ) : (
                <Button
                    fullWidth
                    onClick={onClick}
                    startIcon={<Person />}
                    sx={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "14px",
                        py: 1.25,
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#2563eb",
                        },
                    }}
                >
                    Select Customer
                </Button>
            )}
        </Box>
    );
};

export default SelectCustomerButton;
