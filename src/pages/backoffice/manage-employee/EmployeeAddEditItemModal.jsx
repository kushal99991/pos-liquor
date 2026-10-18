import React, { useState, useEffect, useMemo } from "react";
import { Box, Button, Select, MenuItem, FormControlLabel, Checkbox, Typography, CircularProgress, Alert,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetUserByIdQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "services/usersSlice";
import { useGetRolesQuery, useGetRoleByIdQuery } from "services/rolesSlice";

export default function EmployeeAddEditItemModal({
  open = true,
  mode = "add",
  selectedId = null,
  onClose,
}) {
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    roles: [],
    is_active: true,
    pin: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roleDetails, setRoleDetails] = useState(null);
  const [pinError, setPinError] = useState("");

  // API hooks
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(
    selectedId,
    { skip: mode !== "edit" || !selectedId }
  );
  const { data: rolesData } = useGetRolesQuery();
  const { data: allUsersData } = useGetUsersQuery(); // For PIN duplicate checking
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Get selected role ID - ensure it's a number to match MenuItem values
  const selectedRoleId = useMemo(() => {
    if (Array.isArray(employeeData.roles) && employeeData.roles.length > 0) {
      const roleId = employeeData.roles[0];
      return roleId !== null && roleId !== undefined ? Number(roleId) : null;
    }
    if (employeeData.roles) {
      return Number(employeeData.roles);
    }
    return null;
  }, [employeeData.roles]);

  // Fetch role details when a role is selected
  const { data: selectedRoleData, isLoading: isLoadingRoleDetails } = useGetRoleByIdQuery(
    selectedRoleId,
    { skip: !selectedRoleId }
  );

  // Get store_id from Redux store (from pos.installation.storeId or auth.user.store_id)
  const storeId = useSelector((state) => state.pos.installation.storeId);
  const authUser = useSelector((state) => state.auth.user);
  // Get store_id from user session (set during login) or from pos store
  // During admin login, store_id is saved in userSession.store_id
  const userStoreId = authUser?.store_id || storeId;

  // Get available roles
  const availableRoles = useMemo(() => {
    if (!rolesData) return [];
    if (Array.isArray(rolesData)) return rolesData;
    if (Array.isArray(rolesData?.data)) return rolesData.data;
    return [];
  }, [rolesData]);

  // Update role details when selected role data is fetched
  useEffect(() => {
    if (selectedRoleData) {
      const role = selectedRoleData?.data || selectedRoleData;
      if (role) {
        // Format role details according to the expected structure
        const formattedRoleDetails = {
          role_id: role.id,
          role_name: role.name || role.role_name,
          role_status: role.is_active !== undefined ? role.is_active : true,
          permissions: role.permissions ? role.permissions.map((perm) => ({
            permission_id: perm.permission_id || perm.id,
            name: perm.name,
            label: perm.label || perm.name,
            category: perm.category,
            is_active: perm.is_active !== undefined ? perm.is_active : true,
          })) : [],
        };
        setRoleDetails(formattedRoleDetails);
      }
    } else if (!selectedRoleId) {
      // Clear role details when no role is selected
      setRoleDetails(null);
    }
  }, [selectedRoleData, selectedRoleId]);

  // Load user data when in edit mode
  useEffect(() => {
    if (mode === "edit" && userData) {
      const user = userData?.data || userData;
      // Handle roles - could be array of IDs, array of role objects, or role_details structure
      let roleIds = [];
      
      // Check for role_details structure first (new API format)
      if (user?.role_details?.role_id) {
        roleIds = [Number(user.role_details.role_id)];
      } 
      // Check for roles array (old API format)
      else if (user?.roles) {
        if (Array.isArray(user.roles)) {
          roleIds = user.roles.map((r) => {
            const roleId = typeof r === "object" ? r.id : r;
            return Number(roleId);
          }).filter(id => !isNaN(id));
        } else if (typeof user.roles === "number" || typeof user.roles === "string") {
          const roleId = Number(user.roles);
          if (!isNaN(roleId)) {
            roleIds = [roleId];
          }
        }
      }
      
      // Handle PIN - could be number or string
      // Ensure PIN is always 4 digits (pad with leading zeros if needed)
      const pinValue = user?.pin;
      let pinString = "";
      if (pinValue !== null && pinValue !== undefined) {
        pinString = String(pinValue);
        // Pad with leading zeros to ensure 4 digits
        while (pinString.length < 4) {
          pinString = "0" + pinString;
        }
        // Limit to 4 digits if somehow longer
        pinString = pinString.slice(0, 4);
      }
      
      setEmployeeData({
        name: user?.name || "",
        email: user?.email || "",
        roles: roleIds,
        is_active: user?.is_active !== undefined ? user.is_active : true,
        pin: pinString, // Load pin if available (convert to string, ensure 4 digits)
      });

      // If user has role_details, set it directly
      if (user?.role_details) {
        setRoleDetails(user.role_details);
      } else if (roleIds.length > 0) {
        // If no role_details but has role, it will be fetched by useGetRoleByIdQuery
        setRoleDetails(null);
      } else {
        setRoleDetails(null);
      }
    } else if (mode === "add") {
      // Reset form for add mode
      setEmployeeData({
        name: "",
        email: "",
        roles: [],
        is_active: true,
        pin: "",
      });
      // Clear errors and role details when switching modes
      setErrorMessage("");
      setPinError("");
      setRoleDetails(null);
    }
  }, [mode, userData]);

  // Get all users for PIN duplicate checking
  const allUsers = useMemo(() => {
    if (!allUsersData) return [];
    if (Array.isArray(allUsersData)) return allUsersData;
    if (Array.isArray(allUsersData?.data)) return allUsersData.data;
    return [];
  }, [allUsersData]);

  const handleChange = (field, value) => {
    // Special handling for PIN field
    if (field === "pin") {
      // Only allow numeric characters
      const numericValue = value.replace(/\D/g, "");
      // Restrict to 4 digits
      const limitedValue = numericValue.slice(0, 4);
      setEmployeeData((prev) => ({ ...prev, [field]: limitedValue }));
      // Clear PIN error when user starts typing
      if (pinError) {
        setPinError("");
      }
    } else {
      setEmployeeData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear general error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // Parse MySQL duplicate entry errors
  // Format: (pymysql.err.IntegrityError) (1062, "Duplicate entry '9988' for key 'users.pin'")
  const parseMySQLError = (errorText) => {
    if (!errorText || typeof errorText !== "string") return null;

    // Match MySQL duplicate entry error pattern
    // Pattern: (1062, "Duplicate entry 'value' for key 'table.field'")
    const mysqlPattern = /\((\d+),\s*["']?Duplicate entry\s+['"]([^'"]+)['"]\s+for\s+key\s+['"]([^'"]+)['"]/i;
    const match = errorText.match(mysqlPattern);

    if (match) {
      const errorCode = match[1]; // e.g., '1062'
      const duplicateValue = match[2]; // e.g., '9988'
      const key = match[3]; // e.g., 'users.pin'
      
      // Extract field name from key (e.g., 'users.pin' → 'pin')
      const fieldName = key.split('.').pop() || key;
      
      // Map field names to user-friendly names
      const fieldMap = {
        "pin": "PIN",
        "email": "Email",
        "name": "Name",
        "mobile_number": "Phone Number",
        "phone": "Phone Number",
      };
      
      const friendlyField = fieldMap[fieldName.toLowerCase()] || fieldName;
      
      return `${friendlyField} "${duplicateValue}" is already in use. Please use a different ${friendlyField}.`;
    }

    return null;
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrorMessage("");
    setPinError("");

    if (!employeeData.name.trim()) {
      const error = "Name is required";
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    if (!employeeData.email.trim()) {
      const error = "Email is required";
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    // PIN validation
    const pinValue = employeeData.pin.trim();
    if (mode === "add" && !pinValue) {
      const error = "PIN is required";
      setPinError(error);
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    // PIN must be exactly 4 digits
    if (pinValue && pinValue.length !== 4) {
      const error = "PIN must be exactly 4 digits";
      setPinError(error);
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    // PIN must be numeric (should already be enforced by input handler, but double-check)
    if (pinValue && !/^\d{4}$/.test(pinValue)) {
      const error = "PIN must contain only numbers";
      setPinError(error);
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    // Check for duplicate PIN (exclude current user in edit mode)
    if (pinValue) {
      const duplicateUser = allUsers.find((user) => {
        const userPin = String(user.pin || "").trim();
        // In edit mode, exclude the current user being edited
        if (mode === "edit" && selectedId && user.id === Number(selectedId)) {
          return false;
        }
        return userPin === pinValue;
      });
      
      if (duplicateUser) {
        const error = "Please change your PIN";
        setPinError(error);
        setErrorMessage(error);
        toast.error(error);
        return;
      }
    }
    
    // Role validation
    if (!employeeData.roles || (Array.isArray(employeeData.roles) && employeeData.roles.length === 0)) {
      const error = "Role is required";
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare API payload
      // Ensure roles is an array of role IDs (integers)
      let roleIds = [];
      if (Array.isArray(employeeData.roles) && employeeData.roles.length > 0) {
        roleIds = employeeData.roles.map(id => Number(id)).filter(id => !isNaN(id));
      } else if (employeeData.roles) {
        const roleId = Number(employeeData.roles);
        if (!isNaN(roleId)) {
          roleIds = [roleId];
        }
      }
      
      // Validate that at least one role is selected
      if (roleIds.length === 0) {
        const error = "Role is required";
        setErrorMessage(error);
        toast.error(error);
        setIsSubmitting(false);
        return;
      }

      // Check if role details are still loading when a role is selected
      if (selectedRoleId && isLoadingRoleDetails) {
        const error = "Please wait for role details to load";
        setErrorMessage(error);
        toast.error(error);
        setIsSubmitting(false);
        return;
      }
      
      // Prepare API payload according to API structure
      // API expects role_id (singular integer), not roles (array)
      const payload = {
        name: employeeData.name.trim(),
        email: employeeData.email.trim(),
        role_id: roleIds[0], // Single role ID as integer (API expects role_id, not roles)
        is_active: employeeData.is_active,
      };

      // Add role_details if available (include permissions structure)
      // This ensures role_details is included in the payload when saving
      if (roleDetails) {
        payload.role_details = roleDetails;
      } else if (selectedRoleId) {
        // If role is selected but roleDetails is not yet loaded, wait a bit
        // This should not happen if isLoadingRoleDetails check above works
        console.warn("Role selected but role details not loaded yet");
      }
      
      // Add pin (required for add mode, include in edit mode if provided)
      // PIN is validated above to be exactly 4 digits, so convert to number
      const pinValue = (employeeData.pin || "").trim();
      if (mode === "add") {
        // In add mode, PIN is required and validated to be exactly 4 digits
        if (pinValue && pinValue.length === 4 && /^\d{4}$/.test(pinValue)) {
          payload.pin = Number(pinValue);
        } else {
          // This should not happen due to validation above, but add safety check
          console.error("PIN validation failed: PIN must be exactly 4 digits");
        }
      } else if (mode === "edit") {
        // In edit mode, send PIN if it's been entered and is valid (4 digits)
        // If empty or invalid, don't send it (keeps current PIN)
        if (pinValue && pinValue.length === 4 && /^\d{4}$/.test(pinValue)) {
          payload.pin = Number(pinValue);
        }
        // If PIN field is empty in edit mode, we don't include it in payload
        // This allows the backend to keep the existing PIN unchanged
      }

      // Add store_id (required for API) - must be a positive integer
      if (userStoreId) {
        const storeIdNum = Number(userStoreId);
        if (!Number.isNaN(storeIdNum) && storeIdNum > 0) {
          payload.store_id = storeIdNum;
        } else {
          console.warn("Invalid store_id:", userStoreId);
        }
      }
      
      // For edit mode, store_id is required by API
      if (mode === "edit" && !payload.store_id) {
        const error = "Store ID is required. Please ensure you are logged in correctly.";
        setErrorMessage(error);
        toast.error(error);
        setIsSubmitting(false);
        return;
      }
      
      // For add mode, store_id should also be present
      if (mode === "add" && !payload.store_id) {
        const error = "Store ID is required. Please ensure you are logged in correctly.";
        setErrorMessage(error);
        toast.error(error);
        setIsSubmitting(false);
        return;
      }
      
      // Set default_shift_id to 1
      payload.default_shift_id = 1;
      
      // Debug: Log payload before sending (remove in production)
      console.log(`${mode === "add" ? "Creating" : "Updating"} user with payload:`, JSON.stringify(payload, null, 2));
      console.log("PIN value in payload:", payload.pin, "Type:", typeof payload.pin);

      let response;
      if (mode === "edit" && selectedId) {
        response = await updateUser({
          userId: selectedId,
          data: payload,
        }).unwrap();
        toast.success("Employee updated successfully");
        // Clear any errors on success
        setErrorMessage("");
        // Close modal first if callback exists
        if (onClose) {
          onClose();
        }
        // Navigate to employee list page - cache invalidation will trigger refetch
        navigate("/backoffice/manage-employee/employee", { replace: true });
      } else {
        response = await createUser(payload).unwrap();
        toast.success("Employee created successfully");
        // Clear any errors on success
        setErrorMessage("");
        // Close modal first if callback exists
        if (onClose) {
          onClose();
        }
        // Navigate to employee list page - cache invalidation will trigger refetch
        navigate("/backoffice/manage-employee/employee", { replace: true });
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      
      // Handle validation errors (422/400) - FastAPI returns array of errors in detail
      let errorMsg = "";
      
      // First, try to parse MySQL duplicate entry errors from the error response
      const errorDetailString = error?.data?.detail || error?.message || error?.data?.message || "";
      const mysqlError = parseMySQLError(errorDetailString);
      
      if (mysqlError) {
        errorMsg = mysqlError;
      } else if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          // Format validation errors - extract specific field messages
          const errorDetails = error.data.detail
            .map((err) => {
              const field = err.loc?.join(".") || err.loc?.[err.loc.length - 1] || "field";
              const msg = err.msg || "";
              
              // Check for MySQL error in the message first
              const mysqlErr = parseMySQLError(msg);
              if (mysqlErr) return mysqlErr;
              
              // Map common field names to user-friendly names
              const fieldMap = {
                "email": "Email",
                "pin": "PIN",
                "name": "Name",
                "roles": "Role",
                "mobile_number": "Phone Number",
                "password": "Password",
              };
              
              const friendlyField = fieldMap[field] || field;
              
              // Check for specific error patterns
              if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("already exists")) {
                if (field === "pin" || field.includes("pin")) {
                  return "Duplicate PIN. Please use a different PIN.";
                } else if (field === "email" || field.includes("email")) {
                  return "Email already exists. Please use a different email.";
                } else {
                  return `${friendlyField} already exists.`;
                }
              }
              
              // Return formatted error
              return `${friendlyField}: ${msg}`;
            })
            .filter(Boolean);
          
          errorMsg = errorDetails.length > 0 
            ? errorDetails.join(" ") 
            : "Validation error occurred. Please check your input.";
        } else if (typeof error.data.detail === "string") {
          // Check for MySQL error in detail string first
          const mysqlErr = parseMySQLError(error.data.detail);
          if (mysqlErr) {
            errorMsg = mysqlErr;
          } else {
            const detail = error.data.detail.toLowerCase();
            
            // Check for specific error patterns in string messages
            if (detail.includes("duplicate") && detail.includes("pin")) {
              errorMsg = "Duplicate PIN. Please use a different PIN.";
            } else if (detail.includes("duplicate") && detail.includes("email")) {
              errorMsg = "Email already exists. Please use a different email.";
            } else if (detail.includes("already exists")) {
              if (detail.includes("pin")) {
                errorMsg = "PIN already exists. Please use a different PIN.";
              } else if (detail.includes("email")) {
                errorMsg = "Email already exists. Please use a different email.";
              } else {
                errorMsg = error.data.detail;
              }
            } else if (detail.includes("not found")) {
              errorMsg = "Resource not found. Please refresh and try again.";
            } else if (detail.includes("unauthorized") || detail.includes("forbidden")) {
              errorMsg = "You don't have permission to perform this action.";
            } else {
              errorMsg = error.data.detail;
            }
          }
        }
      } else if (error?.message) {
        // Check for MySQL error in error message first
        const mysqlErr = parseMySQLError(error.message);
        if (mysqlErr) {
          errorMsg = mysqlErr;
        } else {
          const msg = error.message.toLowerCase();
          
          // Check for specific error patterns in error message
          if (msg.includes("duplicate") && msg.includes("pin")) {
            errorMsg = "Duplicate PIN. Please use a different PIN.";
          } else if (msg.includes("duplicate") && msg.includes("email")) {
            errorMsg = "Email already exists. Please use a different email.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMsg = "Network error. Please check your connection and try again.";
          } else {
            errorMsg = error.message;
          }
        }
      } else {
        errorMsg = `Failed to ${mode === "edit" ? "update" : "create"} employee. Please try again.`;
      }
      
      // Set error message to display on page
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "edit" && isLoadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
      {/* Header */}
      <Box className="flex justify-between items-center mb-4 max-w-[500px]">
        <Box className="flex items-center">
          <Button
            onClick={() => navigate(-1)}
            color="error"
            variant="text"
            disableRipple
            sx={{minWidth: "unset", p: 0, mr: 2, display: "flex", alignItems: "center", }}
          >
            <ArrowBackIosNewIcon sx={{ m: 0, p: 0, fontSize: 20, color: "#9b243e" }} />
          </Button>

          <Typography variant="h6" sx={{ mb: 0, fontWeight: 700, color: "#3e3e3e" }}>
            {mode === "add" ? "ADD EMPLOYEE" : "EDIT EMPLOYEE"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          onClick={handleSave}
          disabled={isSubmitting || !!pinError}
        >
          {isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "SAVE"}
        </Button>
      </Box>

      {/* Error Display */}
      {errorMessage && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, maxWidth: "500px" }}
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
          value={employeeData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />
        <KeyboardTextField
          label="Email"
          variant="outlined"
          size="small"
          type="email"
          value={employeeData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          fullWidth
          required
        />
        <Box>
          <KeyboardTextField
            label="PIN"
            variant="outlined"
            size="small"
            type="password"
            value={employeeData.pin}
            onChange={(e) => handleChange("pin", e.target.value)}
            fullWidth
            required={mode === "add"}
            error={!!pinError}
            inputProps={{
              maxLength: 4,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            helperText={
              pinError 
                ? pinError 
                : mode === "add" 
                  ? "Must be exactly 4 digits" 
                  : employeeData.pin 
                    ? "Enter new PIN or leave empty to keep current" 
                    : "Leave empty to keep current PIN"
            }
          />
        </Box>
        <Select
          size="small"
          value={selectedRoleId || ""}
          onChange={(e) => {
            const roleId = Number(e.target.value);
            if (!isNaN(roleId)) {
              handleChange("roles", [roleId]);
            }
          }}
          fullWidth
          displayEmpty
          required
        >
          <MenuItem value="" disabled>
            Select Role
          </MenuItem>
          {availableRoles.map((role) => (
            <MenuItem key={role.id} value={Number(role.id)}>
              {role.name}
            </MenuItem>
          ))}
        </Select>

        <FormControlLabel
          control={
            <Checkbox
              checked={employeeData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              size="small"
            />
          }
          label="Active"
        />
      </Box>
    </Box>
  );
}

