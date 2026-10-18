import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Checkbox,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "services/rolesSlice";

export default function Role() {
  const Navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const { data, isLoading, isFetching, refetch } = useGetRolesQuery(
    statusFilter === "All" ? undefined : { status: statusFilter }
  );

  const roles = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return roles.filter((item) => {
      const roleName = (item.roleName || item.role_name || item.name || "").toLowerCase();
      const statusRaw =
        item.is_active !== undefined
          ? item.is_active
            ? "active"
            : "inactive"
          : item.status;
      const status = (statusRaw || "").toLowerCase();

      const matchesSearch = !query || roleName.includes(query);
      const matchesStatus =
        statusFilter === "All" ? true : status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [roles, searchQuery, statusFilter]);


  const handleAddClick = () => {
    Navigate("/backoffice/manage-employee/role/addedit", {
      state: { mode: "add" },
    });
  };

  const handleDeleteClick = () => {
    if (selectedRows.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(selectedRows.map((id) => deleteRole(id)));
      setSelectedRows([]);
      setDeleteDialogOpen(false);
      refetch();
    } catch {
      /* handled by RTKQ */
    }
  };

  const toggleCheckbox = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const statusDot = (color) => (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color,
      }}
    />
  );

  return (
    <>
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#3e3e3e" }}>
          Role
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              onClick={handleAddClick}
              startIcon={<Plus size={16} />}
              sx={{
                bgcolor: "#b32d3a",
                color: "white",
                px: 2.5,
                "&:hover": { bgcolor: "#9b2432" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add
            </Button>

            <Button
              disabled={selectedRows.length !== 1}
              onClick={() =>
                selectedRows.length === 1 &&
                Navigate("/backoffice/manage-employee/role/addedit", {
                  state: { mode: "edit", selectedId: selectedRows[0] },
                })
              }
              sx={{
                px: 2.5,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: selectedRows.length === 1 ? "#b32d3a" : "transparent",
                color: selectedRows.length === 1 ? "white" : "#b32d3a",
                border: "1px solid #b32d3a",
                "&:hover": {
                  bgcolor: selectedRows.length === 1 ? "#9b2432" : "transparent",
                },
              }}
            >
              Edit
            </Button>

            <Button
              variant={statusFilter === "active" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("active")}
              sx={{
                bgcolor: statusFilter === "active" ? "#47b86c" : "transparent",
                color: statusFilter === "active" ? "white" : "#47b86c",
                borderColor: "#47b86c",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Active
            </Button>

            <Button
              variant={statusFilter === "inactive" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("inactive")}
              sx={{
                bgcolor: statusFilter === "inactive" ? "#b32d3a" : "transparent",
                color: statusFilter === "inactive" ? "white" : "#b32d3a",
                borderColor: "#b32d3a",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              In-Active
            </Button>

            <Button
              onClick={handleDeleteClick}
              disabled={selectedRows.length === 0 || isDeleting}
              sx={{
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: selectedRows.length ? "#b32d3a" : "transparent",
                color: selectedRows.length ? "white" : "#b32d3a",
                border: "1px solid #b32d3a",
                "&:hover": {
                  bgcolor: selectedRows.length ? "#9b2432" : "transparent",
                },
              }}
            >
              <Trash2 size={18} />
            </Button>

            {(isLoading || isFetching) && (
              <CircularProgress size={18} sx={{ color: "#6b7280" }} />
            )}
          </Stack>

          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                border: "1px solid #1f2937",
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 700,
              }}
            >
              <span>Total :</span>
              <Box
                component="span"
                sx={{
                  border: "1px solid #1f2937",
                  borderRadius: 0.5,
                  px: 1,
                  minWidth: 24,
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                {roles.length}
              </Box>
            </Box>

            <Box
              sx={{
                border: "1px solid #1f2937",
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 400,
                minWidth: 250,
              }}
            >
              <input
                type="text"
                placeholder="Search by role name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  background: "transparent",
                }}
              />
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                {statusDot("#27ae60")}
                <Typography variant="body2">Active</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {statusDot("#c0392b")}
                <Typography variant="body2">In-Active</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#070c1f" }}>
                <TableCell sx={{ color: "white", width: 50 }} />
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Role Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Last Updated Date
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRoles.map((item) => {
                const id = item.id ?? item.role_id ?? item.roleId;
                const isChecked = selectedRows.includes(id);
                const statusRaw = item.is_active !== undefined ? (item.is_active ? "active" : "inactive") : item.status;
                const status = (statusRaw || "").toLowerCase();
                const isActive = status === "active";
                const roleName = item.roleName || item.role_name || item.name || "";
                const updated =
                  item.lastUpdateddate ||
                  item.last_updated ||
                  item.updated_at ||
                  item.updatedAt ||
                  "";
                return (
                  <TableRow
                    key={id}
                    hover
                    onClick={() => toggleCheckbox(id)}
                    selected={isChecked}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleCheckbox(id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {statusDot(isActive ? "#27ae60" : "#c0392b")}
                        <Typography sx={{ fontWeight: 400, color: "#111827" }}>
                          {roleName.toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#4b5563" }}>
                      {updated}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Roles"
        description="Are you sure you want to delete the selected roles?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}