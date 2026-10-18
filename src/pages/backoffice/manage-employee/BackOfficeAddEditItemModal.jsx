import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Box, Button, Checkbox, FormControlLabel, Typography, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "services/rolesSlice";
import { useGetPermissionsQuery } from "services/permissionsSlice";

// =====================
// SINGLE Permission Checkbox UI
// =====================
const PermissionCheckbox = ({ checked, onChange, label }) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          size="small"
          color="success"
        />
      }
      label={label}
    />
  );
};

// =====================
// MAIN COMPONENT
// =====================
export default function BackOfficeAddEditItemModal({
  open = true,
  mode = "add",
  selectedId = null,
  onClose,
}) {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [checkedPermissions, setCheckedPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRefs = useRef({});

  // API hooks
  const { data: roleData, isLoading: isLoadingRole } = useGetRoleByIdQuery(
    selectedId,
    { skip: mode !== "edit" || !selectedId }
  );
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const {
    data: permissionsResponse,
    isLoading: isLoadingPermissions,
    isError: isPermissionsError,
  } = useGetPermissionsQuery();

  // Build sections from permissions grouped by category
  const permissionSections = useMemo(() => {
    const list = Array.isArray(permissionsResponse?.data)
      ? permissionsResponse.data
      : Array.isArray(permissionsResponse)
        ? permissionsResponse
        : [];

    const grouped = list.reduce((acc, perm) => {
      const category = perm.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    }, {});

    const sections = Object.keys(grouped).map((category) => ({
      title: category,
      groups: [
        {
          name: category,
          allow: grouped[category].map((perm) => ({
            id: perm.id,
            label: perm.label || perm.name || `Permission ${perm.id}`,
          })),
        },
      ],
    }));

    return sections;
  }, [permissionsResponse]);

  // Load role data when in edit mode
  useEffect(() => {
    if (mode === "edit" && roleData) {
      const role = roleData?.data || roleData;
      setRoleName(role?.name || role?.role_name || role?.roleName || "");

      // Load permissions if they exist in the API response
      if (role?.permissions) {
        const permissionsMap = {};
        if (Array.isArray(role.permissions)) {
          role.permissions.forEach((permObj) => {
            const permId =
              permObj.permission_id || permObj.id || permObj?.permission?.id;
            if (permId) {
              permissionsMap[`perm_${permId}`] = true;
            }
          });
        }
        setCheckedPermissions(permissionsMap);
      }
    } else if (mode === "add") {
      // Reset form for add mode
      setRoleName("");
      setCheckedPermissions({});
    }
  }, [mode, roleData]);

  // Set initial active tab once permissions load
  useEffect(() => {
    if (permissionSections.length && !activeTab) {
      setActiveTab(permissionSections[0].title);
    }
  }, [permissionSections, activeTab]);

  const togglePermission = (key) => {
    setCheckedPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Get all permission keys for a category
  const getCategoryPermissionKeys = (categoryTitle) => {
    const section = permissionSections.find((s) => s.title === categoryTitle);
    if (!section) return [];
    const keys = [];
    section.groups.forEach((group) => {
      group.allow?.forEach((perm) => {
        keys.push(`perm_${perm.id}`);
      });
    });
    return keys;
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryTitle) => {
    const keys = getCategoryPermissionKeys(categoryTitle);
    if (keys.length === 0) return false;
    return keys.every((key) => checkedPermissions[key]);
  };

  // Check if some (but not all) permissions in a category are selected
  const isCategoryIndeterminate = (categoryTitle) => {
    const keys = getCategoryPermissionKeys(categoryTitle);
    if (keys.length === 0) return false;
    const selectedCount = keys.filter((key) => checkedPermissions[key]).length;
    return selectedCount > 0 && selectedCount < keys.length;
  };

  // Toggle all permissions in a category
  const toggleCategory = (categoryTitle) => {
    const keys = getCategoryPermissionKeys(categoryTitle);
    const allSelected = isCategoryFullySelected(categoryTitle);
    
    setCheckedPermissions((prev) => {
      const updated = { ...prev };
      keys.forEach((key) => {
        updated[key] = !allSelected;
      });
      return updated;
    });
  };

  // Get all permission keys across all categories
  const getAllPermissionKeys = () => {
    const keys = [];
    permissionSections.forEach((section) => {
      section.groups.forEach((group) => {
        group.allow?.forEach((perm) => {
          keys.push(`perm_${perm.id}`);
        });
      });
    });
    return keys;
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = () => {
    const keys = getAllPermissionKeys();
    if (keys.length === 0) return false;
    return keys.every((key) => checkedPermissions[key]);
  };

  // Check if some (but not all) permissions are selected
  const areSomePermissionsSelected = () => {
    const keys = getAllPermissionKeys();
    if (keys.length === 0) return false;
    const selectedCount = keys.filter((key) => checkedPermissions[key]).length;
    return selectedCount > 0 && selectedCount < keys.length;
  };

  // Toggle all permissions
  const toggleAllPermissions = () => {
    const keys = getAllPermissionKeys();
    const allSelected = areAllPermissionsSelected();
    
    setCheckedPermissions((prev) => {
      const updated = { ...prev };
      keys.forEach((key) => {
        updated[key] = !allSelected;
      });
      return updated;
    });
  };

  const scrollToAccordion = (title) => {
    setActiveTab(title);
    sectionRefs.current[title]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Collect all allowed permissions as objects with permission_id and is_allowed
  // API expects: [{permission_id: 0, is_allowed: true}]
  const getAllowedPermissions = useCallback(() => {
    const allowed = [];
    Object.keys(checkedPermissions).forEach((key) => {
      if (checkedPermissions[key] && key.startsWith("perm_")) {
        const idStr = key.replace("perm_", "");
        const idNum = Number(idStr);
        if (!Number.isNaN(idNum)) {
          allowed.push({
            permission_id: idNum,
            is_allowed: true,
          });
        }
      }
    });
    return allowed;
  }, [checkedPermissions]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (!permissionSections.length) {
      toast.error("Permissions not loaded yet");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare permissions array - collect all checked permissions
      const permissions = getAllowedPermissions();

      // Generate slug from name (lowercase, replace spaces with hyphens)
      const slug = roleName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Prepare API payload - slug is required string, permissions as array of objects
      const payload = {
        name: roleName.trim(),
        slug: slug || roleName.trim().toLowerCase().replace(/\s+/g, '-'),
        permissions: permissions,
        is_active: true,
      };

      let response;
      if (mode === "edit" && selectedId) {
        response = await updateRole({
          roleId: selectedId,
          data: payload,
        }).unwrap();
        toast.success("Role updated successfully");
        if (onClose) {
          onClose();
        } else {
          navigate("/backoffice/manage-employee/role");
        }
      } else {
        response = await createRole(payload).unwrap();
        toast.success("Role created successfully");
        if (onClose) {
          onClose();
        } else {
          navigate("/backoffice/manage-employee/role");
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      
      // Handle validation errors (422) - FastAPI returns array of errors in detail
      let errorMessage = `Failed to ${mode === "edit" ? "update" : "create"} role`;
      
      if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          // Format validation errors
          const errorDetails = error.data.detail
            .map((err) => {
              const field = err.loc?.join(".") || "field";
              return `${field}: ${err.msg}`;
            })
            .join(", ");
          errorMessage = `Validation error: ${errorDetails}`;
        } else if (typeof error.data.detail === "string") {
          errorMessage = error.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  if (mode === "edit" && isLoadingRole) {
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

  if (isLoadingPermissions) {
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

  if (isPermissionsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load permissions. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <>
    <Box className="flex w-full gap-4 p-4 font-sans select-none">

      {/* LEFT SIDEBAR */}
      <Box className="w-[230px] pr-3 h-[calc(100vh-180px)] overflow-auto">
        {permissionSections.map((section) => (
          <Box
            key={section.title}
            onClick={() => {
              scrollToAccordion(section.title);
              setActiveTab(section.title);
            }}
            sx={{
              cursor: "pointer",
              p: "8px",
              mb: "8px",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "14px",
              boxShadow: 1,
              position: "relative",
              bgcolor: activeTab === section.title ? "#f3c9c9" : "#fff",
              color: activeTab === section.title ? "#9b243e" : "#3e3e3e",
              "&:hover": { bgcolor: "#f3c9c9", color: "#9b243e" },
              ...(activeTab === section.title && {
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: "-8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderLeft: "8px solid #f3c9c9",
                },
              }),
            }}
          >
            {section.title}
          </Box>
        ))}
      </Box>

      {/* RIGHT CONTENT */}
      <Box className="flex-1 h-[calc(100vh-180px)] overflow-y-auto pr-2">
        <Box className="grid grid-cols-2 items-center justify-between mb-4 pt-1.5">
          {/* ROLE NAME INPUT */}
          <KeyboardTextField
            label="Role Name *"
            variant="outlined"
            size="small"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="max-w-[500px]"
            fullWidth
          />

          {/* RIGHT SIDE - SELECT ALL/DESELECT ALL */}
          <Box className="flex items-center gap-6 ml-6 justify-between max-w-[400px]">
            <FormControlLabel
              control={
                <Checkbox
                  checked={areAllPermissionsSelected()}
                  indeterminate={areSomePermissionsSelected()}
                  onChange={toggleAllPermissions}
                  size="small"
                  color="success"
                />
              }
              label={
                <Typography sx={{ color: "#4caf50", fontWeight: 600 }}>
                  {areAllPermissionsSelected() ? "Deselect All" : "Select All"}
            </Typography>
              }
            />
          </Box>
        </Box>

        {/* ACCORDIONS */}
        {permissionSections.map(({ title, groups }) => (
          <Accordion
            key={title}
            defaultExpanded
            ref={(el) => (sectionRefs.current[title] = el)}
            square
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "#d1d5db",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  mr: 1,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isCategoryFullySelected(title)}
                  indeterminate={isCategoryIndeterminate(title)}
                  onChange={() => toggleCategory(title)}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ flex: 1 }}>{title}</Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails className="space-y-4">
              {groups.map((group) => (
                <Box key={group.name} className="border rounded-md p-4">
                  <Typography
                    variant="subtitle2"
                    className="mb-2 font-semibold"
                    sx={{
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                    }}
                  >
                    {group.name}
                  </Typography>

                  <Box className="grid grid-cols-3 gap-3">
                    {group.allow?.map((perm) => {
                      const key = `perm_${perm.id}`;
                      return (
                        <PermissionCheckbox
                          key={key}
                          label={perm.label}
                          checked={!!checkedPermissions[key]}
                          onChange={() => togglePermission(key)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
    <Box className="grid justify-end my-4 px-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !roleName.trim()}
          sx={{
            bgcolor: "#a94442",
            maxWidth: "300px",
            display: "block",
            color: "white",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#8b3735" },
            "&:disabled": { bgcolor: "#cccccc", color: "#666666" },
            fontWeight: "bold",
            gap: 1,
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : mode === "edit" ? (
            "UPDATE"
          ) : (
            "ADD"
          )}
        </Button>
      </Box>
    </>
  );
}
