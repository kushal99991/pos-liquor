import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetItemGroupByIdQuery,
  useCreateItemGroupMutation,
  useUpdateItemGroupMutation,
} from "services/itemGroupSlice";

export default function ProductsAddEditItemGroupModal({
  open = true,
  mode,          // "add" | "edit" - can be undefined, will read from location state
  selectedId,     // item group id for edit - can be undefined, will read from location state
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get mode and id from props or location state (location state takes precedence if props not provided)
  const stateMode = location?.state?.mode;
  const stateId = location?.state?.id;
  
  const finalMode = mode ?? stateMode ?? "add";
  const finalSelectedId = selectedId ?? stateId ?? null;

  const [itemGroupData, setItemGroupData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log mode and ID
  useEffect(() => {
    console.log("ProductsAddEditItemGroupModal:", {
      props: { mode, selectedId },
      locationState: { mode: stateMode, id: stateId },
      final: { mode: finalMode, selectedId: finalSelectedId },
      location: location?.state,
    });
  }, [mode, selectedId, stateMode, stateId, finalMode, finalSelectedId, location]);

  /* ---------------- API ---------------- */

  const {
    data: itemGroupResponse,
    isLoading: isLoadingItemGroup,
  } = useGetItemGroupByIdQuery(finalSelectedId, {
    skip: finalMode !== "edit" || !finalSelectedId,
  });

  const [createItemGroup] = useCreateItemGroupMutation();
  const [updateItemGroup] = useUpdateItemGroupMutation();

  /* ---------------- Store ---------------- */

  const storeId = useSelector((state) => state.pos.installation.storeId);
  const authUser = useSelector((state) => state.auth.user);
  const userStoreId = authUser?.store_id || storeId;

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (finalMode === "edit" && itemGroupResponse) {
      // Handle different response structures
      // API might return: {name: "..."} or {data: {name: "..."}} or [{name: "..."}]
      let itemGroup = null;
      
      // Try to extract the item group from various response structures
      if (itemGroupResponse?.data) {
        itemGroup = Array.isArray(itemGroupResponse.data) 
          ? itemGroupResponse.data[0] 
          : itemGroupResponse.data;
      } else if (Array.isArray(itemGroupResponse)) {
        itemGroup = itemGroupResponse[0];
      } else if (typeof itemGroupResponse === "object") {
        itemGroup = itemGroupResponse;
      }

      console.log("Item group data loaded:", { 
        itemGroup, 
        itemGroupResponse,
        extractedName: itemGroup?.name 
      });

      if (itemGroup && itemGroup.name !== undefined) {
        setItemGroupData({
          name: itemGroup.name || "",
        });
      }
    } else if (finalMode === "add") {
      setItemGroupData({ name: "" });
    }
  }, [finalMode, itemGroupResponse]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    setItemGroupData({ name: e.target.value });
  };

  const handleSave = async () => {
    if (!itemGroupData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (finalMode === "edit" && finalSelectedId) {
        // Ensure ID is a number
        const itemGroupId = Number(finalSelectedId);
        if (!itemGroupId || isNaN(itemGroupId)) {
          toast.error("Invalid item group ID");
          setIsSubmitting(false);
          return;
        }

        console.log("Updating item group:", {
          itemGroupId,
          data: { name: itemGroupData.name.trim() },
        });

        const response = await updateItemGroup({
          itemGroupId,
          data: { name: itemGroupData.name.trim() },
        }).unwrap();

        console.log("Update response:", response);
        toast.success("Item group updated successfully");

        // Invalidate cache and refetch
        // The invalidatesTags in the slice should handle this, but we can navigate after a short delay
        setTimeout(() => {
          onClose ? onClose() : navigate(-1);
        }, 100);
      } else {
        if (!userStoreId) {
          toast.error("Store ID missing");
          setIsSubmitting(false);
          return;
        }

        await createItemGroup({
          name: itemGroupData.name.trim(),
          is_active: true,
          store_id: Number(userStoreId),
        }).unwrap();

        toast.success("Item group created successfully");
        onClose ? onClose() : navigate(-1);
      }
    } catch (error) {
      console.error("Error saving item group:", error);
      
      // Better error handling
      let errorMessage = "Something went wrong";
      
      if (error?.data) {
        if (Array.isArray(error.data.detail)) {
          // Validation errors
          const firstError = error.data.detail[0];
          errorMessage = firstError?.msg || "Validation error";
          console.error("Validation errors:", error.data.detail);
        } else if (typeof error.data.detail === "string") {
          errorMessage = error.data.detail;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Loading ---------------- */

  if (finalMode === "edit" && isLoadingItemGroup) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, maxWidth: 500 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={() => (onClose ? onClose() : navigate(-1))}
            variant="text"
            sx={{ minWidth: 0, mr: 2 }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 20, color: "#9b243e" }} />
          </Button>

          <Typography variant="h6" fontWeight={700}>
            {finalMode === "add" ? "ADD ITEMS GROUP" : "EDIT ITEMS GROUP"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
            "SAVE"
          )}
        </Button>
      </Box>

      {/* Form */}
      <Box sx={{ maxWidth: 500 }}>
        <KeyboardTextField
          label="Items Group Name"
          size="small"
          fullWidth
          required
          value={itemGroupData.name}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
}
