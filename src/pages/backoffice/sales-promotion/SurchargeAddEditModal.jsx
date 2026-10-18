import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress, MenuItem, Select, FormControl, InputLabel,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetSurchargeByIdQuery,
  useCreateSurchargeMutation,
  useUpdateSurchargeMutation,
} from "services/surchargeSlice";
import moment from "moment";

export default function SurchargeAddEditModal({
  open = true,
  mode = "add",
  selectedId = null,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const stateMode = location?.state?.mode;
  const stateId = location?.state?.id;
  const finalMode = mode || stateMode || "add";
  const finalSelectedId = selectedId || stateId;

  const [surchargeData, setSurchargeData] = useState({
    name: "",
    type: "AMOUNT",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: surchargeDataResponse, isLoading: isLoadingSurcharge } = useGetSurchargeByIdQuery(
    finalSelectedId,
    { skip: finalMode !== "edit" || !finalSelectedId }
  );
  const [createSurcharge] = useCreateSurchargeMutation();
  const [updateSurcharge] = useUpdateSurchargeMutation();

  const storeId = useSelector((state) => state.pos.installation.storeId);
  const authUser = useSelector((state) => state.auth.user);
  const userStoreId = authUser?.store_id || storeId;

  useEffect(() => {
    if (finalMode === "edit" && surchargeDataResponse) {
      const surcharge = surchargeDataResponse?.data || surchargeDataResponse;
      setSurchargeData({
        name: surcharge?.name || "",
        type: surcharge?.type || "AMOUNT",
        amount: (surcharge?.value || surcharge?.amount)?.toString() || "",
      });
    } else if (finalMode === "add") {
      setSurchargeData({
        name: "",
        type: "AMOUNT",
        amount: "",
      });
    }
  }, [finalMode, surchargeDataResponse]);

  const handleChange = (field, value) => {
    setSurchargeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!surchargeData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!surchargeData.amount || parseFloat(surchargeData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (surchargeData.type === "PERCENTAGE" && parseFloat(surchargeData.amount) > 100) {
      toast.error("Percentage amount cannot exceed 100");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!userStoreId) {
        toast.error("Store ID is required. Please ensure you are logged in correctly.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: surchargeData.name.trim(),
        type: surchargeData.type,
        value: parseFloat(surchargeData.amount),
        store_id: Number(userStoreId),
      };

      let response;
      if (finalMode === "edit" && finalSelectedId) {
        response = await updateSurcharge({
          surchargeId: finalSelectedId,
          data: payload,
        }).unwrap();
        toast.success("Surcharge updated successfully");
      } else {
        response = await createSurcharge(payload).unwrap();
        toast.success("Surcharge created successfully");
      }

      if (onClose) {
        onClose();
      } else {
        navigate("/backoffice/sales-promotion/surcharge");
      }
    } catch (error) {
      console.error("Error saving surcharge:", error);
      
      let errorMessage = `Failed to ${finalMode === "edit" ? "update" : "create"} surcharge`;
      
      if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          const firstError = error.data.detail[0];
          const firstField = firstError.loc?.slice(1).join(".") || "field";
          toast.error(`${firstField}: ${firstError.msg}`);
          console.error("All validation errors:", error.data.detail);
        } else if (typeof error.data.detail === "string") {
          toast.error(error.data.detail);
        }
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (finalMode === "edit" && isLoadingSurcharge) {
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
      <Box className="flex justify-between items-center mb-4 max-w-[600px]">
        <Box className="flex items-center">
          <Button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate(-1);
              }
            }}
            color="error"
            variant="text"
            disableRipple
            sx={{
              minWidth: "unset",
              p: 0,
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowBackIosNewIcon sx={{ m: 0, p: 0, fontSize: 20, color: "#9b243e" }} />
          </Button>

          <Typography variant="h6" sx={{ mb: 0, fontWeight: 700, color: "#3e3e3e" }}>
            {finalMode === "add" ? "ADD SURCHARGE" : "EDIT SURCHARGE"}
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

      <Box className="flex flex-col gap-4 max-w-[600px]">
        <KeyboardTextField
          label="Surcharge Name"
          variant="outlined"
          size="small"
          value={surchargeData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />

        <FormControl fullWidth size="small">
          <InputLabel>Surcharge Type</InputLabel>
          <Select
            value={surchargeData.type}
            label="Surcharge Type"
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <MenuItem value="STANDARD">Standard</MenuItem>
            <MenuItem value="CUSTOM">Custom</MenuItem>
            <MenuItem value="MULTI_ITEM">Multi Item</MenuItem>
            <MenuItem value="AMOUNT">Amount</MenuItem>
            <MenuItem value="PERCENTAGE">Percentage</MenuItem>
          </Select>
        </FormControl>

        <KeyboardTextField
          label={surchargeData.type === "PERCENTAGE" ? "Percentage Amount" : surchargeData.type === "AMOUNT" ? "Fixed Amount" : "Amount"}
          variant="outlined"
          size="small"
          type="number"
          value={surchargeData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          fullWidth
          required
          inputProps={{ min: 0, step: 0.01 }}
          helperText={surchargeData.type === "PERCENTAGE" ? "Enter percentage (0-100)" : "Enter amount in dollars"}
        />
      </Box>
    </Box>
  );
}

