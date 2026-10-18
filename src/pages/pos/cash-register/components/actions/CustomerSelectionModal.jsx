import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Button,
    IconButton,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Select,
    MenuItem,
    InputAdornment,
} from "@mui/material";
import { Close, Person, Add, Search } from "@mui/icons-material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { useLazyGetCustomersQuery } from "services/customerSlice";
import AddCustomerForm from "./AddCustomerForm";
import useSnackbar from "hooks/useSnackbar";

const CustomerSelectionModal = ({ open, onClose, onSelectCustomer }) => {
    const [getCustomers, { isLoading }] = useLazyGetCustomersQuery();
    const { openSnackbar } = useSnackbar();

    const [searchType, setSearchType] = useState("name");
    const [searchValue, setSearchValue] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setShowAddForm(false);
            setSearchType("name");
            setSearchValue("");
            setCustomers([]);
            setHasSearched(false);
        }
    }, [open]);

    // Handle search button click
    const handleSearch = async () => {
        if (!searchValue.trim()) {
            openSnackbar("Please enter a search value", "warning");
            return;
        }

        setHasSearched(true);

        // Build query parameters based on search type
        const params = {};
        if (searchType === "name") {
            params.name = searchValue.trim();
        } else if (searchType === "email") {
            params.email = searchValue.trim();
        } else if (searchType === "phone_number") {
            params.phone_number = searchValue.trim();
        }

        try {
            const response = await getCustomers(params);
            
            if (response?.error) {
                openSnackbar("Failed to search customers", "error");
                setCustomers([]);
                return;
            }

            const data = response?.data;
            let customerList = [];

            // Handle different response structures
            if (data) {
                if (Array.isArray(data.results)) {
                    customerList = data.results;
                } else if (Array.isArray(data.data)) {
                    customerList = data.data;
                } else if (Array.isArray(data)) {
                    customerList = data;
                }
            }

            setCustomers(customerList);
        } catch (error) {
            console.error("Search error:", error);
            openSnackbar("Failed to search customers", "error");
            setCustomers([]);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleSelectCustomer = (customer) => {
        onSelectCustomer(customer);
        openSnackbar(`Selected customer: ${customer.first_name} ${customer.last_name}`, "success");
        onClose();
    };

    const handleAddCustomerSuccess = (newCustomer) => {
        // Auto-select the newly created customer
        onSelectCustomer(newCustomer);
        openSnackbar("Customer created and selected successfully", "success");
        onClose();
    };

    const handleClose = () => {
        setShowAddForm(false);
        setSearchType("name");
        setSearchValue("");
        setCustomers([]);
        setHasSearched(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    maxWidth: "800px",
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box>
                    {/* Header */}
                    <Box
                        sx={{
                            background: "linear-gradient(to right, #b01d39, #8b1530)",
                            color: "white",
                            py: 2,
                            px: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                            {showAddForm ? "Add New Customer" : "Select Customer"}
                        </h2>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: "absolute",
                                right: 12,
                                color: "white",
                                backgroundColor: "rgba(0, 0, 0, 0.2)",
                                width: "36px",
                                height: "36px",
                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.3)" },
                            }}
                        >
                            <Close sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    {showAddForm ? (
                        <AddCustomerForm
                            onSuccess={handleAddCustomerSuccess}
                            onCancel={() => setShowAddForm(false)}
                        />
                    ) : (
                        <Box sx={{ p: 3 }}>
                            {/* Search Section - All in one row */}
                            <Box sx={{ mb: 3, display: "flex", gap: 1.5, alignItems: "center" }}>
                                {/* Search Type Selector */}
                                <Select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    sx={{
                                        height: "44px",
                                        fontSize: "14px",
                                        backgroundColor: "#f9fafb",
                                        minWidth: "150px",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#e5e7eb",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#b01d39",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#b01d39",
                                        },
                                    }}
                                >
                                    <MenuItem value="name">Name</MenuItem>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="phone_number">Phone Number</MenuItem>
                                </Select>

                                {/* Search Input */}
                                <KeyboardTextField
                                    fullWidth
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={
                                        searchType === "name"
                                            ? "Enter customer name..."
                                            : searchType === "email"
                                            ? "Enter email address..."
                                            : "Enter phone number..."
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ fontSize: 20, color: "#9ca3af" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: "44px",
                                            fontSize: "14px",
                                            backgroundColor: "#f9fafb",
                                            "& fieldset": {
                                                borderColor: "#e5e7eb",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#b01d39",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#b01d39",
                                            },
                                        },
                                    }}
                                />

                                {/* Search Button */}
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    sx={{
                                        backgroundColor: "#b01d39",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        px: 3,
                                        textTransform: "none",
                                        whiteSpace: "nowrap",
                                        height: "44px",
                                        minWidth: "150px",
                                        "&:hover": {
                                            backgroundColor: "#702626",
                                        },
                                        "&:disabled": {
                                            backgroundColor: "#b01d39",
                                            opacity: 0.6,
                                        },
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Search"}
                                </Button>

                                {/* Add Customer Button - Right Corner */}
                                <Button
                                    onClick={() => setShowAddForm(true)}
                                    startIcon={<Add sx={{ fontSize: 18 }} />}
                                    sx={{
                                        backgroundColor: "#b01d39",
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        px: 2,
                                        py: 1,
                                        textTransform: "none",
                                        whiteSpace: "nowrap",
                                        height: "44px",
                                        minWidth: "auto",
                                        "&:hover": {
                                            backgroundColor: "#702626",
                                        },
                                    }}
                                >
                                    Add New
                                </Button>
                            </Box>

                            {/* Customer List */}
                            <Box
                                sx={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                    pr: 1,
                                }}
                            >
                                {!hasSearched ? (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            py: 6,
                                            color: "#6b7280",
                                        }}
                                    >
                                        <Search sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                                        <Box sx={{ fontSize: "14px", fontWeight: 600 }}>
                                            Select search type and enter value to find customers
                                        </Box>
                                    </Box>
                                ) : isLoading ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            py: 6,
                                        }}
                                    >
                                        <CircularProgress sx={{ color: "#b01d39" }} />
                                    </Box>
                                ) : customers.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            py: 6,
                                            color: "#6b7280",
                                        }}
                                    >
                                        <Person sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                                        <Box sx={{ fontSize: "14px", fontWeight: 600, mb: 1 }}>
                                            No customers found matching your search
                                        </Box>
                                        <Box sx={{ fontSize: "12px", color: "#9ca3af" }}>
                                            Try a different search term or add a new customer
                                        </Box>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {customers.map((customer) => (
                                            <Grid item xs={12} key={customer.id}>
                                                <Card
                                                    sx={{
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow: "none",
                                                        transition: "all 0.2s",
                                                        "&:hover": {
                                                            borderColor: "#b01d39",
                                                            boxShadow: "0 2px 8px rgba(176, 29, 57, 0.1)",
                                                        },
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                gap: 2,
                                                            }}
                                                        >
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Box
                                                                    sx={{
                                                                        fontSize: "16px",
                                                                        fontWeight: 700,
                                                                        color: "#111827",
                                                                        mb: 0.5,
                                                                    }}
                                                                >
                                                                    {customer.first_name} {customer.last_name}
                                                                </Box>
                                                                <Box
                                                                    sx={{
                                                                        fontSize: "13px",
                                                                        color: "#6b7280",
                                                                        mb: 0.25,
                                                                    }}
                                                                >
                                                                    {customer.email}
                                                                </Box>
                                                                <Box
                                                                    sx={{
                                                                        fontSize: "13px",
                                                                        color: "#6b7280",
                                                                    }}
                                                                >
                                                                    {customer.phone_number}
                                                                </Box>
                                                                {customer.loyalty_tier && (
                                                                    <Box
                                                                        sx={{
                                                                            display: "inline-block",
                                                                            mt: 1,
                                                                            px: 1.5,
                                                                            py: 0.5,
                                                                            backgroundColor: "#fce7ec",
                                                                            color: "#b01d39",
                                                                            fontSize: "11px",
                                                                            fontWeight: 700,
                                                                            borderRadius: "4px",
                                                                            textTransform: "uppercase",
                                                                        }}
                                                                    >
                                                                        {customer.loyalty_tier} • {customer.points || 0} pts
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            <Button
                                                                onClick={() => handleSelectCustomer(customer)}
                                                                sx={{
                                                                    backgroundColor: "#b01d39",
                                                                    color: "white",
                                                                    fontWeight: 700,
                                                                    fontSize: "13px",
                                                                    px: 3,
                                                                    py: 1,
                                                                    textTransform: "none",
                                                                    whiteSpace: "nowrap",
                                                                    "&:hover": {
                                                                        backgroundColor: "#702626",
                                                                    },
                                                                }}
                                                            >
                                                                Select
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerSelectionModal;
