import React, { useState, useEffect, useMemo } from "react";
import { Box, Button, Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetSubCategoryByIdQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
} from "services/subCategorySlice";
import { useGetCateogriesListQuery } from "services/categorySlice";

export default function SubCategoryAddEditModal({
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

  const [subCategoryData, setSubCategoryData] = useState({
    name: "",
    description: "",
    parent_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subCategoryDataResponse, isLoading: isLoadingSubCategory } = useGetSubCategoryByIdQuery(
    finalSelectedId,
    { skip: finalMode !== "edit" || !finalSelectedId }
  );
  const { data: categoriesData } = useGetCateogriesListQuery();
  const [createSubCategory] = useCreateSubCategoryMutation();
  const [updateSubCategory] = useUpdateSubCategoryMutation();

  const storeId = useSelector((state) => state.pos.installation.storeId);
  const authUser = useSelector((state) => state.auth.user);
  const userStoreId = authUser?.store_id || storeId;

  const availableCategories = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData.filter(cat => !cat.parent_id);
    if (Array.isArray(categoriesData?.data)) return categoriesData.data.filter(cat => !cat.parent_id);
    return [];
  }, [categoriesData]);

  useEffect(() => {
    if (finalMode === "edit" && subCategoryDataResponse) {
      const subCategory = subCategoryDataResponse?.data || subCategoryDataResponse;
      setSubCategoryData({
        name: subCategory?.name || "",
        description: subCategory?.description || "",
        parent_id: subCategory?.parent_id || subCategory?.parent_category?.id || "",
      });
    } else if (finalMode === "add") {
      setSubCategoryData({
        name: "",
        description: "",
        parent_id: "",
      });
    }
  }, [finalMode, subCategoryDataResponse]);

  const handleChange = (field, value) => {
    setSubCategoryData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!subCategoryData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!subCategoryData.parent_id) {
      toast.error("Parent Category is required");
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
        name: subCategoryData.name.trim(),
        description: subCategoryData.description?.trim() || "",
        parent_id: Number(subCategoryData.parent_id),
        is_active: true,
        store_id: Number(userStoreId),
      };

      let response;
      if (finalMode === "edit" && finalSelectedId) {
        response = await updateSubCategory({
          subCategoryId: finalSelectedId,
          data: payload,
        }).unwrap();
        toast.success("Sub-category updated successfully");
      } else {
        response = await createSubCategory(payload).unwrap();
        toast.success("Sub-category created successfully");
      }

      if (onClose) {
        onClose();
      } else {
        navigate("/backoffice/products/subcategory");
      }
    } catch (error) {
      console.error("Error saving sub-category:", error);
      
      let errorMessage = `Failed to ${finalMode === "edit" ? "update" : "create"} sub-category`;
      
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

  if (finalMode === "edit" && isLoadingSubCategory) {
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
            {finalMode === "add" ? "ADD SUB-CATEGORY" : "EDIT SUB-CATEGORY"}
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
        <FormControl fullWidth size="small">
          <InputLabel>Parent Category</InputLabel>
          <Select
            value={subCategoryData.parent_id || ""}
            onChange={(e) => handleChange("parent_id", e.target.value)}
            label="Parent Category"
            required
          >
            <MenuItem value="">
              <em>Select Category</em>
            </MenuItem>
            {availableCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <KeyboardTextField
          label="Sub-Category Name"
          variant="outlined"
          size="small"
          value={subCategoryData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />
        <KeyboardTextField
          label="Description"
          variant="outlined"
          size="small"
          value={subCategoryData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Box>
    </Box>
  );
}

