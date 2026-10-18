import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    CircularProgress,
    Alert,
    Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import toast from "react-hot-toast";
import {
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useLazyGetCustomersQuery,
} from "services/customerSlice";

export default function CustomerAddEditItemModal({
    open = true,
    mode = "add",
    selectedId = null,
    onClose,
}) {
    const navigate = useNavigate();

    const [customerData, setCustomerData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: null,
        points: "",
        status: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({});

    // API hooks
    const [getCustomers, { data: customersData }] = useLazyGetCustomersQuery();
    const [createCustomer] = useCreateCustomerMutation();
    const [updateCustomer] = useUpdateCustomerMutation();

    // Load customer data when in edit mode
    useEffect(() => {
        if (mode === "edit" && selectedId) {
            const fetchCustomer = async () => {
                try {
                    const response = await getCustomers({
                        page: 1,
                        page_size: 1000,
                    });

                    if (response?.data) {
                        const rawData = response.data;
                        let customers = [];

                        if (rawData.results && Array.isArray(rawData.results)) {
                            customers = rawData.results;
                        } else if (Array.isArray(rawData.data)) {
                            customers = rawData.data;
                        } else if (Array.isArray(rawData)) {
                            customers = rawData;
                        }

                        const customer = customers.find(c => c.id === selectedId);

                        if (customer) {
                            // Convert date to Date object for DatePicker
                            let displayDate = null;
                            if (customer.date_of_birth) {
                                displayDate = new Date(customer.date_of_birth);
                            }

                            setCustomerData({
                                first_name: customer.first_name || "",
                                last_name: customer.last_name || "",
                                email: customer.email || "",
                                phone_number: customer.phone_number || customer.phone || "",
                                date_of_birth: displayDate,
                                points: customer.points || "",
                                status: customer.status !== undefined ? customer.status : 1,
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching customer:", error);
                }
            };

            fetchCustomer();
        } else if (mode === "add") {
            // Reset form for add mode
            setCustomerData({
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                date_of_birth: null,
                points: "",
                status: 1,
            });
            setErrorMessage("");
            setErrors({});
        }
    }, [mode, selectedId, getCustomers]);

    const handleChange = (field, value) => {
        setCustomerData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }

        // Clear general error when user starts typing
        if (errorMessage) {
            setErrorMessage("");
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

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!customerData.first_name.trim()) {
            newErrors.first_name = "First name is required";
        }

        if (!customerData.last_name.trim()) {
            newErrors.last_name = "Last name is required";
        }

        if (!customerData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!customerData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
        } else if (customerData.phone_number.replace(/\D/g, "").length < 10) {
            newErrors.phone_number = "Phone number must be at least 10 digits";
        }

        if (!customerData.date_of_birth) {
            newErrors.date_of_birth = "Date of birth is required";
        } else if (!isValidDate(customerData.date_of_birth)) {
            newErrors.date_of_birth = "Invalid date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        // Clear previous errors
        setErrorMessage("");
        setErrors({});

        if (!validateForm()) {
            const error = "Please fill in all required fields correctly";
            setErrorMessage(error);
            toast.error(error);
            return;
        }

        setIsSubmitting(true);

        try {
            const apiDate = formatDateForAPI(customerData.date_of_birth);

            if (!apiDate) {
                setErrors({ date_of_birth: "Invalid date format" });
                setIsSubmitting(false);
                return;
            }

            const payload = {
                first_name: customerData.first_name.trim(),
                last_name: customerData.last_name.trim(),
                email: customerData.email.trim(),
                phone_number: customerData.phone_number.trim(),
                date_of_birth: apiDate,
                points: customerData.points ? parseInt(customerData.points, 10) : 0,
                status: customerData.status,
            };

            let response;
            if (mode === "edit" && selectedId) {
                response = await updateCustomer({
                    customerId: selectedId,
                    data: payload,
                }).unwrap();
                toast.success("Customer updated successfully");
                setErrorMessage("");
                if (onClose) {
                    onClose();
                }
                navigate("/backoffice/manage-employee/customer", { replace: true });
            } else {
                response = await createCustomer(payload).unwrap();
                toast.success("Customer created successfully");
                setErrorMessage("");
                if (onClose) {
                    onClose();
                }
                navigate("/backoffice/manage-employee/customer", { replace: true });
            }
        } catch (error) {
            console.error("Error saving customer:", error);

            let errorMsg = "";

            if (error?.data?.detail) {
                if (Array.isArray(error.data.detail)) {
                    const errorDetails = error.data.detail
                        .map((err) => {
                            const field = err.loc?.join(".") || err.loc?.[err.loc.length - 1] || "field";
                            const msg = err.msg || "";

                            const fieldMap = {
                                "email": "Email",
                                "phone_number": "Phone Number",
                                "first_name": "First Name",
                                "last_name": "Last Name",
                                "date_of_birth": "Date of Birth",
                            };

                            const friendlyField = fieldMap[field] || field;
                            return `${friendlyField}: ${msg}`;
                        })
                        .filter(Boolean);

                    errorMsg = errorDetails.length > 0
                        ? errorDetails.join(" ")
                        : "Validation error occurred. Please check your input.";
                } else if (typeof error.data.detail === "string") {
                    errorMsg = error.data.detail;
                }
            } else if (error?.message) {
                errorMsg = error.message;
            } else {
                errorMsg = `Failed to ${mode === "edit" ? "update" : "create"} customer. Please try again.`;
            }

            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
            {/* Header */}
            <Box className="flex justify-between items-center mb-4 max-w-[800px]">
                <Box className="flex items-center">
                    <Button
                        onClick={() => navigate(-1)}
                        color="error"
                        variant="text"
                        disableRipple
                        sx={{ minWidth: "unset", p: 0, mr: 2, display: "flex", alignItems: "center", }}
                    >
                        <ArrowBackIosNewIcon sx={{ m: 0, p: 0, fontSize: 20, color: "#9b243e" }} />
                    </Button>

                    <Typography variant="h6" sx={{ mb: 0, fontWeight: 700, color: "#3e3e3e" }}>
                        {mode === "add" ? "ADD CUSTOMER" : "EDIT CUSTOMER"}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "SAVE"}
                </Button>
            </Box>

            {/* Error Display */}
            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, maxWidth: "800px" }}
                    onClose={() => setErrorMessage("")}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* Form */}
            <Box className="flex flex-col gap-4 max-w-[500px]">

                <KeyboardTextField
                    label="Full Name"
                    variant="outlined"
                    size="small"
                    value={customerData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    fullWidth
                    required
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                />

                <KeyboardTextField
                    label="Last Name"
                    variant="outlined"
                    size="small"
                    value={customerData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    fullWidth
                    required
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                />

                <KeyboardTextField
                    label="Email"
                    variant="outlined"
                    size="small"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                />

                <KeyboardTextField
                    label="Phone Number"
                    variant="outlined"
                    size="small"
                    value={customerData.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    fullWidth
                    required
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                />
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Date of Birth"
                        value={customerData.date_of_birth}
                        onChange={(newValue) => handleChange("date_of_birth", newValue)}
                        format="MM/dd/yyyy"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required: true,
                                size: "small",
                                error: !!errors.date_of_birth,
                                helperText: errors.date_of_birth,
                            },
                        }}
                    />
                </LocalizationProvider>

                <KeyboardTextField
                    label="Points"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={customerData.points}
                    onChange={(e) => handleChange("points", e.target.value)}
                    fullWidth
                    error={!!errors.points}
                    helperText={errors.points}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={customerData.status === 1}
                            onChange={(e) => handleChange("status", e.target.checked ? 1 : 0)}
                            size="small"
                        />
                    }
                    label="Active"
                />
            </Box>
        </Box>
    );
}
