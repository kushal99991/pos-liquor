import { useState } from "react";
import { Box, Button, Grid, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { useCreateCustomerMutation } from "services/customerSlice";
import useSnackbar from "hooks/useSnackbar";

const AddCustomerForm = ({ onSuccess, onCancel }) => {
    const [createCustomer, { isLoading }] = useCreateCustomerMutation();
    const { openSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        phone_number: "",
        email: "",
        first_name: "",
        last_name: "",
        date_of_birth: null,
        points: 0,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Convert Date object to yyyy-mm-dd format for API
    const formatDateForAPI = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date)) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Validate date object
    const isValidDate = (date) => {
        if (!date) return false;
        if (!(date instanceof Date)) return false;
        if (isNaN(date.getTime())) return false;

        const year = date.getFullYear();
        if (year < 1900 || year > 2100) return false;

        return true;
    };

    const validateForm = () => {
        const newErrors = {};

        // Phone number validation
        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
        } else if (formData.phone_number.length < 10) {
            newErrors.phone_number = "Phone number must be at least 10 digits";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // First name validation
        if (!formData.first_name.trim()) {
            newErrors.first_name = "First name is required";
        }

        // Last name validation
        if (!formData.last_name.trim()) {
            newErrors.last_name = "Last name is required";
        }

        // Date of birth validation
        if (!formData.date_of_birth) {
            newErrors.date_of_birth = "Date of birth is required";
        } else if (!isValidDate(formData.date_of_birth)) {
            newErrors.date_of_birth = "Invalid date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            openSnackbar("Please fix the errors in the form", "error");
            return;
        }

        try {
            const apiDate = formatDateForAPI(formData.date_of_birth);

            if (!apiDate) {
                setErrors({ date_of_birth: "Invalid date format" });
                return;
            }

            const payload = {
                ...formData,
                date_of_birth: apiDate,
                status: 1,
                points: parseInt(formData.points) || 0,
            };

            const response = await createCustomer(payload);

            if (response?.error) {
                openSnackbar(
                    response.error?.data?.message || "Failed to create customer",
                    "error"
                );
                return;
            }

            openSnackbar("Customer created successfully", "success");
            onSuccess(response.data);
        } catch (error) {
            console.error("Error creating customer:", error);
            openSnackbar("An error occurred while creating customer", "error");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#111827",
                    }}
                >
                    Add New Customer
                </h3>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            First Name <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                    </Box>
                    <KeyboardTextField
                        fullWidth
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                        placeholder="Enter first name"
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "42px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            Last Name <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                    </Box>
                    <KeyboardTextField
                        fullWidth
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                        placeholder="Enter last name"
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "42px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            Email <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                    </Box>
                    <KeyboardTextField
                        fullWidth
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email"
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "42px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            Phone Number <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                    </Box>
                    <KeyboardTextField
                        fullWidth
                        value={formData.phone_number}
                        onChange={(e) => handleChange("phone_number", e.target.value)}
                        placeholder="Enter phone number"
                        error={!!errors.phone_number}
                        helperText={errors.phone_number}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "42px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            Date of Birth <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={formData.date_of_birth}
                            onChange={(newValue) => handleChange("date_of_birth", newValue)}
                            format="MM/dd/yyyy"
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.date_of_birth,
                                    helperText: errors.date_of_birth,
                                    sx: {
                                        "& .MuiOutlinedInput-root": {
                                            height: "42px",
                                            fontSize: "14px",
                                        },
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 0.5 }}>
                        <label
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
                            Points
                        </label>
                    </Box>
                    <KeyboardTextField
                        fullWidth
                        type="number"
                        value={formData.points}
                        onChange={(e) => handleChange("points", e.target.value)}
                        placeholder="0"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "42px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={onCancel}
                    disabled={isLoading}
                    sx={{
                        backgroundColor: "#6b7280",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#4b5563",
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    sx={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        minWidth: "120px",
                        "&:hover": {
                            backgroundColor: "#2563eb",
                        },
                        "&.Mui-disabled": {
                            backgroundColor: "#93c5fd",
                            color: "white",
                        },
                    }}
                >
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : "Save Customer"}
                </Button>
            </Box>
        </Box>
    );
};

export default AddCustomerForm;
