import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from "services/brandSlice";

export default function ItemBrandAddEditModal({
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

  const [brandData, setBrandData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: brandDataResponse, isLoading: isLoadingBrand } = useGetBrandByIdQuery(
    finalSelectedId,
    { skip: finalMode !== "edit" || !finalSelectedId }
  );
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();

  const storeId = useSelector((state) => state.pos.installation.storeId);
  const authUser = useSelector((state) => state.auth.user);
  const userStoreId = authUser?.store_id || storeId;

  useEffect(() => {
    if (finalMode === "edit" && brandDataResponse) {
      const brand = brandDataResponse?.data || brandDataResponse;
      setBrandData({
        name: brand?.name || "",
      });
    } else if (finalMode === "add") {
      setBrandData({
        name: "",
      });
    }
  }, [finalMode, brandDataResponse]);

  const handleChange = (field, value) => {
    setBrandData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!brandData.name.trim()) {
      toast.error("Name is required");
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
        name: brandData.name.trim(),
        is_active: true,
        store_id: Number(userStoreId),
      };

      let response;
      if (finalMode === "edit" && finalSelectedId) {
        response = await updateBrand({
          brandId: finalSelectedId,
          data: payload,
        }).unwrap();
        toast.success("Brand updated successfully");
      } else {
        response = await createBrand(payload).unwrap();
        toast.success("Brand created successfully");
      }

      if (onClose) {
        onClose();
      } else {
        navigate("/backoffice/products/itembrand");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      
      let errorMessage = `Failed to ${finalMode === "edit" ? "update" : "create"} brand`;
      
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

  if (finalMode === "edit" && isLoadingBrand) {
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
      <Box className="flex justify-between items-center mb-4 max-w-[500px]">
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
            {finalMode === "add" ? "ADD ITEM BRAND" : "EDIT ITEM BRAND"}
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

      <Box className="flex flex-col gap-4 max-w-[500px]">
        <KeyboardTextField
          label="Brand Name"
          variant="outlined"
          size="small"
          value={brandData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />
      </Box>
    </Box>
  );
}

