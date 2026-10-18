import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Settings,
  Package,
  Tag,
  Users,
  Globe,
  BadgePercent,
  BadgeDollarSign,
  Layers,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import ModalHeader from "../products/components/ModalHeader";
import ItemGeneralInfo from "../products/components/ItemGeneralInfo";
import GeneralTabPanel from "../products/components/GeneralTabPanel";
import VariantsTabPanel from "../products/components/VariantsTabPanel";
import SplitPackTabPanel from "../products/components/SplitPackTabPanel";
import ErrorDialog from "components/elements/ErrorDialog/ErrorDialog";
import {
  useCreateItemMutation,
  useUpdateItemMutation,
  useLazyGetItemByIdQuery,
  useCreateItemVariantMutation,
  useUpdateItemVariantMutation,
  useDeleteItemVariantMutation,
} from "services/itemSlice";
import { useSelector } from "react-redux";
import { useGetCateogriesListQuery } from "services/categorySlice";
import {
  useGetTaxesListQuery,
  useBulkUpdateItemTaxesMutation,
} from "services/taxSlice";
import apiClient from "api/axios";
import { itemValidationSchema } from "utils/validation";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const initialFormData = {
  sku: "",
  name: "",
  department: "",
  size: "",
  pack: "",
  category: "",
  scanData: "",
  subCategory: "",
  upc: "",
  itemGroup: "",
  itemBrand: "",
  itemType: "PIECE",
  age: false,
  openPrice: false,
  openQuantity: false,
  buyAsCase: false,
  unitCost: "0.00",
  margin: "0.00",
  unitInCase: "0",
  maxLevel: "0",
  buyDown: "0.00",
  markup: "0.00",
  caseCost: "0.00",
  warnQty: "0",
  retailPrice: "0.00",
  qtyOnHand: "0",
  salePrice: "0.00",
  reOrderQty: "0",
  deliPLU: false,
  nonRevenue: false,
  ebt: false,
  nonDiscountable: false,
  isNegative: false,
  nonTaxable: false,
  description: "",
  image: "",
  variants: [],
  is_carton_supported: false,
  packs_per_carton: 1,
  carton_price: 1,
  carton_stock: 0,
  supports_pack: false,
  units_per_pack: 1,
  pack_price: 1,
  pack_stock: 0,
};

export default function ProductsAddEditItemModal({
  open = true,
  mode = "add",
  selectedId = null,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  // Get mode and id from location state if not provided as props
  const stateMode = location?.state?.mode;
  const stateId = location?.state?.id;
  const finalMode = mode || stateMode || "add";
  const finalSelectedId = selectedId || stateId;

  const storeId = useSelector((state) => state.pos.installation.storeId);
  const [activeTab, setActiveTab] = useState(0);
  const [itemGroup, setItemGroup] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Track if this is a clone operation
  const isCloneMode = finalMode === "clone";
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [bulkUpdateItemTaxes] = useBulkUpdateItemTaxesMutation();
  const [getItemById, { isLoading: isLoadingItem }] = useLazyGetItemByIdQuery();
  const [isSaving, setIsSaving] = useState(false);

  // Store existing tax associations for comparison
  const [fetchedItemData, setFetchedItemData] = useState(null);

  const { data: categoryList = [] } = useGetCateogriesListQuery();
  const { data: taxesList = [] } = useGetTaxesListQuery();
  const [createItemVariant] = useCreateItemVariantMutation();
  const [updateItemVariant] = useUpdateItemVariantMutation();
  const [deleteItemVariant] = useDeleteItemVariantMutation();

  // Track original variants for comparison during edit
  const [originalVariants, setOriginalVariants] = useState([]);

  // Error dialog state
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(itemValidationSchema(categoryList)),
    defaultValues: {
      variants: [],
    },
  });
  const formData = watch();

  const fetchItemData = async (itemId) => {
    try {
      const response = await getItemById(itemId);

      if (response?.data && !response?.error) {
        // Handle both array and object responses
        const item = Array.isArray(response.data) 
          ? (response.data.length > 0 ? response.data[0] : null)
          : response.data;
        if (!item) {
          console.error("Item data not found in response");
          reset(initialFormData);
          return null;
        }
        if (item?.image) {
          setImagePreview(item.image);
        }
        // Dynamic tax checkbox mapping
        const taxData = (item?.taxes ?? []).reduce((acc, tax) => {
          acc[`tax_${tax.id}`] = true;
          return acc;
        }, {});

        // Map total_quantity to quantity for variants
        const itemVariants = (item.variants || [])
          .filter((a) => a.is_active === true)
          .map((variant) => ({
            id: variant.id || null,
            variant_id: variant.id || null,
            name: variant.name || "",
            sku: variant.sku || "",
            upc: variant.upc || "",
            size: variant.size || "",
            pack: variant.pack || "",
            scan_type: variant.scan_type || null,
            quantity:
              variant.total_quantity !== undefined
                ? variant.total_quantity
                : variant.quantity || 0,
            qty:
              variant.total_quantity !== undefined
                ? String(variant.total_quantity)
                : variant.qty || String(variant.quantity || 0),
            price:
              variant.retail_price?.toString() ||
              variant.price?.toString() ||
              "",
            retail_price: variant.retail_price || 0,
            sale_price: variant.sale_price || 0,
            unit_cost: variant.unit_cost || 0,
          }));
        reset({
          // Basic Info
          sku: item.sku || "",
          name: item.name || "",
          size: item.size || "",
          department: Number(item.department_id || 0),
          pack: item.pack || "",
          category: Number(item.category_id || 0),
          subCategory: item.sub_category_id || "",
          itemBrand: item.brand_id || "",
          itemType: item.type || "",
          itemGroup: item.item_group_id || "",

          upc: item.upc || "",
          scanData: item.scan_type || "BARCODE",
          age: item.age_check || false,

          // --- Tax data ---
          ...taxData,

          // Pricing / Inventory
          unitCost: item.unit_cost || "",
          buyDown: item.buy_down || "",
          retailPrice: item.retail_price || "",
          salePrice: item.sale_price || "",

          margin: item.margin || "",
          markup: item.markup || "",

          // FIXED
          unitInCase: item.units_pack || 0, // CORRECT FIELD
          qtyOnHand: item.total_quantity || 0, // CORRECT FIELD
          maxLevel: item.max_level || 0,
          warnQty: item.warn_qty || 0,
          reOrderQty: item.reorder_qty || 0, // Only if backend supports it

          // Flags
          deliPLU: item.deli_plu || false,
          nonRevenue: item.non_revenue || false,
          ebt: item.ebt || false,
          nonDiscountable: item.non_discountable || false,
          isNegative: item.is_negative || false,

          // REMOVE (backend does not have these fields)
          openPrice: true,
          openQuantity: true,
          buyAsCase: true,

          // Carton and Pack Support
          is_carton_supported: item.is_carton_supported || false,
          packs_per_carton: item.packs_per_carton || 1,
          carton_price: item.carton_price || 1,
          carton_stock: item.carton_stock || 0,
          supports_pack: item.supports_pack || false,
          units_per_pack: item.units_per_pack || 1,
          pack_price: item.pack_price || 1,
          pack_stock: item.pack_stock || 0,

          // Variants
          variants: itemVariants,
        });
        setOriginalVariants(itemVariants);
        setFetchedItemData(item);
        return item;
      } else {
        console.error("Failed to fetch item data:", response?.error);
        // Fallback to initialFormData if API call fails
        reset(initialFormData);
        return null;
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
      // Fallback to initialFormData if API call fails
      reset(initialFormData);
      return null;
    }
  };

  // --- useEffect for Initialization ---
  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setFetchedItemData(null);

      if (finalMode === "edit" && finalSelectedId) {
        // Fetch item data from API when in edit mode
        fetchItemData(finalSelectedId);
      } else {
        reset(initialFormData);
        setImagePreview(null);
        setSelectedImageFile(null);
      }
      setActiveTab(0);
    }
  }, [open, finalMode, reset, taxesList, getItemById, finalSelectedId]);

  // Separate effect to set subcategory after category is properly set
  const currentCategory = watch("category");
  const itemToUse =
    finalMode === "edit"
      ? fetchedItemData
      : null;
  const subCategoryId = itemToUse ? Number(itemToUse.sub_category_id || 0) : 0;

  useEffect(() => {
    if (
      open &&
      finalMode === "edit" &&
      itemToUse &&
      currentCategory &&
      subCategoryId &&
      categoryList.length > 0
    ) {
      const validSubCategory = categoryList.find(
        (cat) =>
          Number(cat.id) === subCategoryId &&
          Number(cat.parent_id) === Number(currentCategory)
      );
      if (validSubCategory) {
        setValue("subCategory", subCategoryId, { shouldValidate: false });
      }
    }
  }, [
    open,
    finalMode,
    itemToUse,
    currentCategory,
    subCategoryId,
    categoryList,
    setValue,
  ]);

  // Get presigned URL from backend
  const getPresignedUrl = async (filename, folder = "products") => {
    try {
      const response = await apiClient.get("/upload/generate-presigned-url", {
        params: {
          filename,
          folder,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting presigned URL:", error);
      throw error;
    }
  };

  // Upload file to S3 using presigned URL with progress tracking
  const uploadToS3 = async (file, presignedUrl, contentType, onProgress) => {
    return new Promise((resolve, reject) => {
      try {
        // Extract content-type from presigned URL query string
        const urlObj = new URL(presignedUrl);
        const urlContentType = urlObj.searchParams.get("content-type");

        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            // Extract the S3 URL from the presigned URL (remove query parameters)
            const s3Url = presignedUrl.split("?")[0];
            resolve(s3Url);
          } else {
            reject(new Error(`Failed to upload to S3: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });

        xhr.open("PUT", presignedUrl);

        // Set headers based on content-type
        if (urlContentType) {
          // Content-type is in the URL, don't send header
        } else if (contentType) {
          xhr.setRequestHeader("Content-Type", contentType);
        }

        xhr.send(file);
      } catch (error) {
        console.error("Error uploading to S3:", error);
        reject(error);
      }
    });
  };

  // Upload image file to S3 with progress tracking
  const uploadImageToS3 = useCallback(async (file, folder = "products", onProgress) => {
    try {
      // Get file extension
      const fileExtension = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;

      // Get presigned URL
      const response = await apiClient.get("/upload/generate-presigned-url", {
        params: {
          filename,
          folder,
        },
      });
      const { url } = response.data;

      // Upload to S3 with progress tracking
      const s3Url = await uploadToS3(file, url, file.type, onProgress);

      return s3Url;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw error;
    }
  }, []);

  // Handle image file selection and immediate upload
  const handleImageFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(
        "root",
        { message: "Please select a valid image file." },
        { shouldFocus: false }
      );
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(
        "root",
        { message: "Image size must be less than 5MB." },
        { shouldFocus: false }
      );
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Set file and start upload
    setSelectedImageFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to S3 with progress tracking
      const s3Url = await uploadImageToS3(file, "products", (progress) => {
        setUploadProgress(progress);
      });

      // Set S3 URL in react-hook-form
      setValue("image", s3Url);
      
      // Update preview to show S3 URL
      setImagePreview(s3Url);
      
      setIsUploading(false);
      setUploadProgress(100);
      
      // Clear any previous errors
      clearErrors("root");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(
        "root",
        {
          message: error?.message || "Failed to upload image. Please try again.",
        },
        { shouldFocus: false }
      );
      setIsUploading(false);
      setUploadProgress(0);
      setImagePreview(null);
      setSelectedImageFile(null);
    }
  }, [uploadImageToS3, setValue, setError, clearErrors]);

  // Handle image upload (for backward compatibility during save)
  const handleImageUpload = useCallback(async () => {
    try {
      // If we already have an uploaded image URL in the form, use it
      const currentImageUrl = watch("image");
      if (currentImageUrl && currentImageUrl.startsWith("http")) {
        return currentImageUrl;
      }

      // Upload product image to S3 only if a new file is selected
      if (selectedImageFile) {
        // User selected a new image, upload it
        return await uploadImageToS3(selectedImageFile, "products");
      } else if (finalMode === "edit" && fetchedItemData?.image) {
        // In edit mode and no new file selected, use existing image URL
        return fetchedItemData.image;
      } else {
        // Fallback to imagePreview or data.image for add mode
        return imagePreview || "";
      }
    } catch (error) {
      throw new Error(
        error?.message || "Failed to upload image. Please try again."
      );
    }
  }, [selectedImageFile, finalMode, fetchedItemData, imagePreview, uploadImageToS3, watch]);

  // Build API payload from form data
  const buildApiPayload = useCallback(
    (data, productImageUrl) => {
      // Check if the selected category has subcategories
      const categoryId = Number(data.category) || 0;
      const hasSubcategories = categoryList.some(
        (cat) => Number(cat.parent_id) === categoryId
      );
      // Only send sub_category_id if:
      // 1. The category has subcategories AND
      // 2. A subCategory is actually selected
      // Otherwise send null (not 0, as 0 might be validated as invalid by backend)
      const subCategoryId = hasSubcategories && data.subCategory
        ? Number(data.subCategory)
        : null;

      return {
        name: data.name?.trim() || "",
        sku: data.sku?.trim() || "",
        upc: data.upc?.trim() || "",
        scan_type: data.scanData || null,
        category_id: categoryId,
        sub_category_id: subCategoryId,
        department_id: Number(data.department) || 0,
        size: data.size?.trim() || "",
        pack: data.pack?.trim() || "",
        brand_id: Number(data.itemBrand) || 0,
        store_id: storeId ? Number(storeId) : 0,
        age_check: Boolean(data.age),
        unit_cost: Number(data.unitCost) || 0,
        buy_down: Number(data.buyDown) || 0,
        retail_price: Number(data.retailPrice) || 0,
        quantity: Number(data.qtyOnHand) || 0,
        description: data.description?.trim() || "",
        image: productImageUrl,
        units_pack: String(data.unitInCase ?? 0),
        sale_price: Number(data.salePrice) || 0,
        margin: Number(data.margin) || 0,
        markup: Number(data.markup) || 0,
        case_cost: Number(data.caseCost ?? 0),
        warn_qty: Number(data.warnQty ?? 0),
        max_level: Number(data.maxLevel ?? 0),
        re_order_qty: Number(data.reOrderQty ?? 0),
        type: data.itemType || "PIECE",
        open_price: Boolean(data.openPrice),
        open_quantity: Boolean(data.openQuantity),
        buy_as_case: Boolean(data.buyAsCase),
        deli_plu: Boolean(data.deliPLU),
        non_revenue: Boolean(data.nonRevenue),
        ebt: Boolean(data.ebt),
        non_discountable: Boolean(data.nonDiscountable),
        is_negative: Boolean(data.isNegative),
        non_taxable: Boolean(data.nonTaxable),
        item_group_id: data.itemGroup
          ? Number(data.itemGroup)
          : itemGroup
            ? Number(itemGroup)
            : null,
        is_carton_supported: Boolean(data.is_carton_supported),
        packs_per_carton: Number(data.packs_per_carton) || 1,
        carton_price: Number(data.carton_price) || 1,
        carton_stock: Number(data.carton_stock) || 0,
        supports_pack: Boolean(data.supports_pack),
        units_per_pack: Number(data.units_per_pack) || 1,
        pack_price: Number(data.pack_price) || 1,
        pack_stock: Number(data.pack_stock) || 0,
      };
    },
    [storeId, itemGroup, categoryList]
  );

  // Get error message from error object
  const getErrorMessage = useCallback((error) => {
    return (
      error?.detail ||
      error?.message ||
      error?.data ||
      error?.message ||
      "Failed to save item. Please try again."
    );
  }, []);

  // Save or update item
  const saveOrUpdateItem = useCallback(
    async (apiPayload) => {
      const itemIdForEdit =
        finalMode === "edit" ? fetchedItemData?.id || finalSelectedId : null;

      if (finalMode === "edit" && itemIdForEdit && !isCloneMode) {
        const response = await updateItem({
          itemId: itemIdForEdit,
          data: apiPayload,
        });
        return { response, itemIdForEdit };
      } else {
        // For add mode or clone mode, create a new item
        const response = await createItem(apiPayload);
        return { response, itemIdForEdit: null };
      }
    },
    [finalMode, fetchedItemData, finalSelectedId, isCloneMode, updateItem, createItem]
  );

  // Handle tax associations
  const handleTaxAssociations = useCallback(
    async (itemId, data) => {
      try {
        // Collect currently selected taxes from form data
        const selectedTaxIds = taxesList
          .filter((tax) => tax.is_active)
          .filter((tax) => data[`tax_${tax.id}`] === true)
          .map((tax) => tax.id);

        // Use bulk update API to set all taxes at once
        if (selectedTaxIds.length > 0 || finalMode === "edit") {
          const bulkUpdateResponse = await bulkUpdateItemTaxes({
            item_id: itemId,
            tax_ids: selectedTaxIds,
          });

          if (bulkUpdateResponse?.error) {
            console.error(
              "Error updating tax associations:",
              bulkUpdateResponse.error
            );
            // Don't fail the entire save - taxes can be updated separately if needed
          }
        }
      } catch (taxError) {
        console.error("Error managing tax associations:", taxError);
        // Don't fail the entire save - taxes can be updated separately if needed
      }
    },
    [finalMode, taxesList, bulkUpdateItemTaxes]
  );

  // Extract errors from Promise.allSettled results
  const extractVariantErrors = useCallback(
    (results, variants, operation = "create") => {
      return results
        .map((result, index) => {
          const variant = variants[index];
          let error = null;
          let errorMessage = `Failed to ${operation} variant`;

          if (result.status === "rejected") {
            error = result.reason;
          } else if (result.status === "fulfilled" && result.value?.error) {
            error = result.value.error;
          }

          if (error) {
            errorMessage =
              error?.data?.detail ||
              error?.data?.message ||
              error?.message ||
              errorMessage;
            return `Variant "${variant.name || variant.sku || `#${index + 1}`
              }": ${errorMessage}`;
          }

          return null;
        })
        .filter(Boolean);
    },
    []
  );

  // Build variant data for API
  const buildVariantData = useCallback(
    (variant, data, itemId, productImageUrl, variantSequence = null) => {
      const sequence = variantSequence || 1;
      const defaultVariantName = data.name
        ? `${data.name} - variant - ${sequence}`
        : "";

      // Use variant's category/sub_category if available, otherwise fall back to form data
      // Use null instead of 0 for sub_category_id if not available (0 might not be a valid ID)
      const categoryId = variant.category_id || Number(data.category) || 0;
      const subCategoryId =
        variant.sub_category_id ||
        (data.subCategory ? Number(data.subCategory) : null);

      // Set retail_price and sale_price to the same value
      // Priority: variant.retail_price > variant.price (from form) > data.retailPrice
      const priceValue =
        variant.retail_price || Number(variant.price || data.retailPrice || 0);

      return {
        name: variant.name || defaultVariantName,
        sku: variant.sku || `${data.sku || ""}-V${sequence}`,
        upc: variant.upc || "",
        category_id: categoryId,
        sub_category_id: subCategoryId,
        department_id: variant.department_id || Number(data.department) || 0,
        type: variant.type || data.itemType || "PIECE",
        size: variant.size || data.size || "",
        pack: variant.pack || data.pack || "",
        brand_id: variant.brand_id || Number(data.itemBrand) || 0,
        store_id: variant.store_id || storeId ? Number(storeId) : 0,
        parent_id: itemId,
        age_check:
          variant.age_check !== undefined
            ? variant.age_check
            : Boolean(data.age),
        unit_cost: variant.unit_cost || Number(data.unitCost) || 0,
        buy_down: variant.buy_down || Number(data.buyDown) || 0,
        retail_price: priceValue,
        description: variant.description || data.description || "",
        scan_type: variant.scan_type || data.scanData || null,
        image: variant.image || productImageUrl || "",
        units_pack: variant.units_pack || String(data.unitInCase ?? 0),
        sale_price: priceValue, // Set same as retail_price
        margin: variant.margin || Number(data.margin) || 0,
        markup: variant.markup || Number(data.markup) || 0,
        item_group_id:
          variant.item_group_id || (itemGroup ? Number(itemGroup) : null),
        quantity: variant.quantity || Number(variant.qty || 0),
      };
    },
    [storeId, itemGroup]
  );

  // Handle variants - create, update, and delete
  const handleVariants = useCallback(
    async (itemId, itemIdForEdit, data, productImageUrl) => {
      try {
        const variants = data.variants || [];

        if (finalMode === "edit" && itemIdForEdit) {
          // In edit mode, compare current variants with original variants
          const currentVariantIds = variants
            .filter((v) => {
              return (
                v.id &&
                typeof v.id === "number" &&
                !isNaN(v.id) &&
                isFinite(v.id)
              );
            })
            .map((v) => v.id);

          // Find variants to delete
          const variantsToDelete = originalVariants.filter((orig) => {
            const hasValidId =
              orig.id &&
              typeof orig.id === "number" &&
              !isNaN(orig.id) &&
              isFinite(orig.id);
            return hasValidId && !currentVariantIds.includes(orig.id);
          });

          // Find variants to create
          const variantsToCreate = variants.filter((v) => {
            if (!v.id) return true;
            return typeof v.id !== "number" || isNaN(v.id) || !isFinite(v.id);
          });

          // Find variants to update
          const variantsToUpdate = variants.filter((variant) => {
            const hasValidId =
              variant.id &&
              typeof variant.id === "number" &&
              !isNaN(variant.id) &&
              isFinite(variant.id);
            if (!hasValidId) return false;

            const originalVariant = originalVariants.find(
              (orig) => orig.id === variant.id
            );
            if (!originalVariant) return false;
            return JSON.stringify(variant) !== JSON.stringify(originalVariant);
          });

          // Delete removed variants
          if (variantsToDelete.length > 0) {
            await Promise.allSettled(
              variantsToDelete.map((variant) => {
                if (
                  variant.id &&
                  typeof variant.id === "number" &&
                  !isNaN(variant.id)
                ) {
                  return deleteItemVariant(variant.id);
                }
                return Promise.resolve();
              })
            );
          }

          // Create new variants
          if (variantsToCreate.length > 0) {
            const existingVariantsCount = variants.filter((v) => v.id).length;
            const createResults = await Promise.allSettled(
              variantsToCreate.map((variant, createIndex) => {
                const variantSequence = existingVariantsCount + createIndex + 1;
                const variantData = buildVariantData(
                  variant,
                  data,
                  itemId,
                  productImageUrl,
                  variantSequence
                );
                return createItemVariant({
                  itemId: itemId,
                  data: variantData,
                });
              })
            );

            const createErrors = extractVariantErrors(
              createResults,
              variantsToCreate,
              "create"
            );
            if (createErrors.length > 0) {
              throw new Error(createErrors.join("\n"));
            }
          }

          // Update changed variants
          if (variantsToUpdate.length > 0) {
            const updateResults = await Promise.allSettled(
              variantsToUpdate.map((variant) => {
                // Use variant's category/sub_category if available, otherwise fall back to form data
                const categoryId =
                  variant.category_id || Number(data.category) || 0;
                const subCategoryId =
                  variant.sub_category_id || Number(data.subCategory) || null;

                // Set retail_price and sale_price to the same value
                // Priority: variant.retail_price > variant.price (from form) > data.retailPrice
                const priceValue =
                  variant.retail_price ||
                  Number(variant.price || data.retailPrice || 0);

                const variantData = {
                  name: variant.name || "",
                  sku: variant.sku || "",
                  upc: variant.upc || "",
                  category_id: categoryId,
                  sub_category_id: subCategoryId,
                  department_id:
                    variant.department_id || Number(data.department) || 0,
                  type: variant.type || data.itemType || "PIECE",
                  size: variant.size || data.size || "",
                  pack: variant.pack || data.pack || "",
                  brand_id: variant.brand_id || Number(data.itemBrand) || 0,
                  store_id: variant.store_id || (storeId ? Number(storeId) : 0),
                  parent_id: itemId,
                  age_check:
                    variant.age_check !== undefined
                      ? variant.age_check
                      : Boolean(data.age),
                  unit_cost: variant.unit_cost || Number(data.unitCost) || 0,
                  buy_down: variant.buy_down || Number(data.buyDown) || 0,
                  retail_price: priceValue,
                  description: variant.description || data.description || "",
                  scan_type: variant.scan_type || data.scanData || null,
                  image: variant.image || productImageUrl || "",
                  units_pack:
                    variant.units_pack || String(data.unitInCase ?? 0),
                  sale_price: priceValue, // Set same as retail_price
                  margin: variant.margin || Number(data.margin) || 0,
                  markup: variant.markup || Number(data.markup) || 0,
                  item_group_id:
                    variant.item_group_id ||
                    (data.itemGroup
                      ? Number(data.itemGroup)
                      : itemGroup
                        ? Number(itemGroup)
                        : null),
                  quantity: variant.quantity || Number(variant.qty || 0),
                };
                return updateItemVariant({
                  variantId: variant.id,
                  data: variantData,
                });
              })
            );

            const updateErrors = extractVariantErrors(
              updateResults,
              variantsToUpdate,
              "update"
            );
            if (updateErrors.length > 0) {
              throw new Error(updateErrors.join("\n"));
            }
          }
        } else {
          // In add/clone mode, create all variants
          if (variants.length > 0) {
            const createResults = await Promise.allSettled(
              variants.map((variant, index) => {
                const variantSequence = index + 1;
                const variantData = buildVariantData(
                  variant,
                  data,
                  itemId,
                  productImageUrl,
                  variantSequence
                );
                return createItemVariant({
                  itemId: itemId,
                  data: variantData,
                });
              })
            );

            const createErrors = extractVariantErrors(
              createResults,
              variants,
              "create"
            );
            if (createErrors.length > 0) {
              throw new Error(createErrors.join("\n"));
            }
          }
        }
      } catch (variantError) {
        console.error("Error managing variants:", variantError);
        const errorMessage =
          variantError?.message ||
          "Failed to save variants. Please check the errors and try again.";
        throw new Error(errorMessage);
      }
    },
    [
      finalMode,
      originalVariants,
      deleteItemVariant,
      createItemVariant,
      updateItemVariant,
      buildVariantData,
      extractVariantErrors,
    ]
  );

  const handleSave = async (data) => {
    clearErrors("root");
    setIsSaving(true);

    let response = null;
    let itemId = null;
    let itemIdForEdit = null;

    try {
      // Step 1: Upload image
      const productImageUrl = await handleImageUpload();

      // Step 2: Build API payload
      const apiPayload = buildApiPayload(data, productImageUrl);

      // Step 3: Save or update item
      const saveResult = await saveOrUpdateItem(apiPayload);
      response = saveResult.response;
      itemIdForEdit = saveResult.itemIdForEdit;

      if (response?.error) {
        setError("root", { message: response.error }, { shouldFocus: false });
        setIsSaving(false);
        return;
      }

      // Step 4: Get item ID
      itemId = response?.data?.id || itemIdForEdit;

      if (!itemId) {
        setError(
          "root",
          { message: "Failed to save item. Item ID not found in response." },
          { shouldFocus: false }
        );
        setIsSaving(false);
        return;
      }

      // Step 5: Handle tax associations
      await handleTaxAssociations(itemId, data);

      // Step 7: Handle variants
      await handleVariants(itemId, itemIdForEdit, data, productImageUrl);

      // If we reach here, everything was successful
      setIsSaving(false);
      toast.success(`Item ${finalMode === "edit" ? "updated" : "created"} successfully`);
      if (onClose) {
        onClose();
      } else {
        navigate("/backoffice/products/items");
      }
    } catch (error) {
      const itemWasCreated = itemId || response?.data?.id || itemIdForEdit;

      if (itemWasCreated) {
        setIsSaving(false);
        const errorMessage =
          error?.message ||
          "Item was saved successfully, but some operations failed. Please check the errors and try again.";
        setErrorDialogMessage(errorMessage);
        setErrorDialogOpen(true);
        toast.success("Item saved with warnings");
        if (onClose) {
          onClose();
        } else {
          navigate("/backoffice/products/items");
        }
      } else {
        // Item creation/update failed, show error in the form
        setError(
          "root",
          {
            message: error?.message || "Failed to save item. Please try again.",
          },
          { shouldFocus: false }
        );
        setIsSaving(false);
        toast.error(error?.message || "Failed to save item");
      }
    }
  };

  // Extract all error messages from form errors, handling nested structures
  const extractErrorMessages = (errorObj, path = "") => {
    const messages = [];

    if (!errorObj || typeof errorObj !== "object") return messages;

    // If it's a direct error object with message
    if (errorObj.message && typeof errorObj.message === "string") {
      const fieldPath = path ? `${path}: ` : "";
      messages.push(`${fieldPath}${errorObj.message}`);
    }

    // Recursively extract from nested objects (e.g., variants array errors)
    Object.entries(errorObj).forEach(([key, value]) => {
      if (value && typeof value === "object") {
        const currentPath = path ? `${path}.${key}` : key;

        if (value.message && typeof value.message === "string") {
          messages.push(`${currentPath}: ${value.message}`);
        } else if (Array.isArray(value)) {
          // Handle array errors (like variants)
          value.forEach((item, index) => {
            if (item && typeof item === "object") {
              if (item.message && typeof item.message === "string") {
                messages.push(`${currentPath}[${index}]: ${item.message}`);
              } else {
                messages.push(
                  ...extractErrorMessages(item, `${currentPath}[${index}]`)
                );
              }
            }
          });
        } else {
          messages.push(...extractErrorMessages(value, currentPath));
        }
      }
    });

    return messages.filter(
      (msg) => msg && msg !== "undefined" && !msg.includes("undefined")
    );
  };

  const allErrors = extractErrorMessages(errors);

  const TabList = [
    { label: "General", icon: <Settings size={18} /> },
    ...(finalMode === "edit" ? [{ label: "Variants", icon: <Layers size={18} /> }] : []),
    { label: "Split-Pack", icon: <Package size={18} /> },
    { label: "Price-Level", icon: <BadgeDollarSign size={18} /> },
    { label: "Special Pricing", icon: <BadgePercent size={18} /> },
    { label: "Tag Along", icon: <Tag size={18} /> },
    { label: "Distributors", icon: <Users size={18} /> },
    { label: "E-commerce", icon: <Globe size={18} /> },
  ];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "white",
          maxWidth: "100%",
          m: 0,
        }}
      >
        <ModalHeader
          mode={isCloneMode ? "add" : finalMode}
          onClose={handleClose}
          onSave={handleSubmit(handleSave)}
          isSaving={isSaving || isCreating || isUpdating || isLoadingItem}
        />
        <Box sx={{ p: 0 }}>
          {isLoadingItem && finalMode === "edit" && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography>Loading item data...</Typography>
            </Box>
          )}

          {(!isLoadingItem || finalMode !== "edit") && (
            <>
              <ItemGeneralInfo
                control={control}
                formData={formData}
                setFormData={() => { }}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                handleImageUpload={handleImageFileSelect}
                setValue={setValue}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                errors={errors}
              />
              <Box className="p-4">
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    minHeight: 0,
                    borderBottom: "1px solid rgba(0, 0, 0, 0.23)",
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#000000",
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    },
                    "& .MuiTab-root.Mui-selected": {
                      color: "#b01d39",
                      minHeight: 0,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#b01d39",
                    },
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {TabList.map((tab) => (
                    <Tab
                      key={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                      label={tab.label}
                      disableRipple
                    />
                  ))}
                </Tabs>
                <Box className="mt-4">
                  {activeTab === 0 && <GeneralTabPanel control={control} errors={errors} />}
                  {TabList[activeTab]?.label === "Variants" && finalMode === "edit" && (
                    <VariantsTabPanel
                      control={control}
                      mode={finalMode}
                      trigger={trigger}
                    />
                  )}
                  {TabList[activeTab]?.label === "Split-Pack" && (
                    <SplitPackTabPanel control={control} errors={errors} />
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <ErrorDialog
        open={errorDialogOpen}
        message={errorDialogMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </>
  );
}
