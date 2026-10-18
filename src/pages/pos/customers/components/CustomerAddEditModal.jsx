import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  ArrowLeft,
  Check,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
} from "lucide-react";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "services/customerSlice";
import useSnackbar from "hooks/useSnackbar";

const CustomerAddEditModal = ({ open, onClose, customer, onSuccess }) => {
  const { openSnackbar } = useSnackbar();
  const isEditMode = !!customer;

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: null,
    points: "",
    status: 1,
  });

  const [errors, setErrors] = useState({});

  // API hooks
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const isLoading = isCreating || isUpdating;

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      // Convert date to Date object for DatePicker
      let displayDate = null;
      if (customer.date_of_birth) {
        displayDate = new Date(customer.date_of_birth);
      }

      setFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email || "",
        phone_number: customer.phone_number || customer.phone || "",
        date_of_birth: displayDate,
        points: customer.points || "",
        status: customer.status || 1,
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: null,
        points: "",
        status: 1,
      });
    }
    setErrors({});
  }, [customer, open]);

  // Handle input changes
  const handleChange = (field) => (event) => {
    let value = event.target.value;

    // Date input already returns yyyy-mm-dd format, no formatting needed

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (formData.phone_number.replace(/\D/g, "").length < 10) {
      newErrors.phone_number = "Phone number must be at least 10 digits";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else if (!isValidDate(formData.date_of_birth)) {
      newErrors.date_of_birth = "Invalid date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const apiDate = formatDateForAPI(formData.date_of_birth);

      if (!apiDate) {
        setErrors({ date_of_birth: "Invalid date format" });
        return;
      }

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        date_of_birth: apiDate,
        points: formData.points ? parseInt(formData.points, 10) : 0,
        status: 1,
      };

      let response;

      if (isEditMode) {
        response = await updateCustomer({
          customerId: customer.id,
          data: payload,
        });
      } else {
        response = await createCustomer(payload);
      }

      if (response?.error) {
        openSnackbar(
          response?.error?.data?.detail ||
          `Failed to ${isEditMode ? "update" : "create"} customer`,
          "error"
        );
      } else {
        openSnackbar(
          `Customer ${isEditMode ? "updated" : "created"} successfully`,
          "success"
        );
        onSuccess();
        onClose();
      }
    } catch (error) {
      openSnackbar(
        `Failed to ${isEditMode ? "update" : "create"} customer`,
        "error"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "0px",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header matching ADD ITEM style */}
      <Box className="p-4 flex justify-between items-center gap-4 shadow-lg">
        <Box className="flex justify-start items-center">
          <Button
            sx={{
              bgcolor: "#b01d39",
              color: "white",
              minHeight: 36,
              minWidth: 36,
              borderRadius: 50,
              "&:hover": { bgcolor: "#702626" },
            }}
            onClick={onClose}
            disabled={isLoading}
          >
            <ArrowLeft size={18} />
          </Button>
          <Box
            onClick={onClose}
            className="text-[20px] font-bold leading-[1.5] text-[#b01d39] uppercase cursor-pointer pl-2.5"
            sx={{
              opacity: isLoading ? 0.6 : 1,
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            {isEditMode ? "EDIT CUSTOMER" : "ADD CUSTOMER"}
          </Box>
        </Box>
        <Box className="flex justify-start items-center">
          <Button
            sx={{
              bgcolor: "#b01d39",
              color: "white",
              minHeight: 36,
              minWidth: 36,
              borderRadius: 50,
              "&:hover": { bgcolor: "#702626" },
              "&:disabled": {
                bgcolor: "#b01d39",
                opacity: 0.7,
              },
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : (
              <Check size={18} />
            )}
          </Button>
          <Box
            onClick={!isLoading ? handleSubmit : undefined}
            className="text-[20px] font-bold leading-[1.5] text-[#b01d39] uppercase cursor-pointer pl-2.5"
            sx={{
              opacity: isLoading ? 0.6 : 1,
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            {isLoading ? "Saving..." : "SAVE"}
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4, backgroundColor: "#f5f5f5" }}>
        <Box className="flex flex-col gap-6">
          {/* Personal Information Section */}
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "8px",
              p: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Box className="flex items-center gap-2 mb-4">
              <User size={20} style={{ color: "#b01d39" }} />
              <Box className="text-[16px] font-bold text-[#b01d39] uppercase">
                Personal Information
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={formData.first_name}
                  onChange={handleChange("first_name")}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  disabled={isLoading}
                  placeholder="Enter first name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} style={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#b01d39",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b01d39",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#b01d39",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={formData.last_name}
                  onChange={handleChange("last_name")}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  disabled={isLoading}
                  placeholder="Enter last name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} style={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#b01d39",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b01d39",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#b01d39",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Contact Information Section */}
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "8px",
              p: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Box className="flex items-center gap-2 mb-4">
              <Mail size={20} style={{ color: "#b01d39" }} />
              <Box className="text-[16px] font-bold text-[#b01d39] uppercase">
                Contact Information
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isLoading}
                  placeholder="Enter email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} style={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#b01d39",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b01d39",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#b01d39",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  required
                  value={formData.phone_number}
                  onChange={handleChange("phone_number")}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  disabled={isLoading}
                  placeholder="Enter phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={18} style={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#b01d39",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b01d39",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#b01d39",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Additional Information Section */}
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "8px",
              p: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Box className="flex items-center gap-2 mb-4">
              <Calendar size={20} style={{ color: "#b01d39" }} />
              <Box className="text-[16px] font-bold text-[#b01d39] uppercase">
                Additional Information
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.date_of_birth}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: newValue,
                      }));
                      // Clear error for this field
                      if (errors.date_of_birth) {
                        setErrors((prev) => ({
                          ...prev,
                          date_of_birth: "",
                        }));
                      }
                    }}
                    format="MM/dd/yyyy"
                    disabled={isLoading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.date_of_birth,
                        helperText: errors.date_of_birth,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#ddd",
                            },
                            "&:hover fieldset": {
                              borderColor: "#b01d39",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#b01d39",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#b01d39",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Points"
                  type="number"
                  fullWidth
                  value={formData.points}
                  onChange={handleChange("points")}
                  disabled={isLoading}
                  placeholder="0"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Star size={18} style={{ color: "#FFD700" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#b01d39",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#b01d39",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#b01d39",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddEditModal;
