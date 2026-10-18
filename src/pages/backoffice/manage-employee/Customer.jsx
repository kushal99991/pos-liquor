import { useMemo, useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import {
    useLazyGetCustomersQuery,
} from "services/customerSlice";

export default function Customer() {
    const Navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState([]);

    const [getCustomers, { isFetching }] = useLazyGetCustomersQuery();

    // Fetch customers on mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await getCustomers({
                    page: 1,
                    page_size: 1000, // Get all customers for now
                });

                if (response?.data) {
                    const rawData = response.data;
                    // Handle different response structures
                    if (rawData.results && Array.isArray(rawData.results)) {
                        setCustomers(rawData.results);
                    } else if (Array.isArray(rawData.data)) {
                        setCustomers(rawData.data);
                    } else if (Array.isArray(rawData)) {
                        setCustomers(rawData);
                    }
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };

        fetchCustomers();
    }, [getCustomers]);

    const filteredCustomers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return customers.filter((item) => {
            const firstName = (item.first_name || "").toLowerCase();
            const lastName = (item.last_name || "").toLowerCase();
            const fullName = `${firstName} ${lastName}`.trim();
            const email = (item.email || "").toLowerCase();
            const phone = (item.phone_number || item.phone || "").toLowerCase();

            const statusRaw = item.status !== undefined
                ? (item.status === 1 ? "active" : "inactive")
                : "active";
            const status = (statusRaw || "").toLowerCase();

            // Searchable fields
            const searchableText = `
        ${fullName}
        ${email}
        ${phone}
      `.toLowerCase();

            const matchesSearch = !query || searchableText.includes(query);

            const matchesStatus =
                statusFilter === "All" ? true : status === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchQuery, statusFilter]);

    const handleAddClick = () => {
        Navigate("/backoffice/manage-employee/customer/addedit", {
            state: { mode: "add" },
        });
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
                    Customer
                </Typography>

                {/* TOP TOOLBAR */}
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
                                Navigate("/backoffice/manage-employee/customer/addedit", {
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

                        {isFetching && (
                            <CircularProgress size={18} sx={{ color: "#6b7280" }} />
                        )}
                    </Stack>

                    {/* Search + total count */}
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
                                {customers.length}
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
                                minWidth: 250,
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search..."
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
                    </Box>
                </Box>

                {/* TABLE */}
                <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#070c1f" }}>
                                <TableCell sx={{ color: "white", width: 50 }} />
                                <TableCell sx={{ color: "white", fontWeight: 700, textTransform: "uppercase" }}>Name</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 700, textTransform: "uppercase" }}>Email</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 700, textTransform: "uppercase" }}>Phone No.</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 700, textTransform: "uppercase" }}>Date of Birth</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: 700, textTransform: "uppercase" }}>Points</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredCustomers.map((item) => {
                                const id = item.id;
                                const isChecked = selectedRows.includes(id);
                                const statusRaw = item.status !== undefined
                                    ? (item.status === 1 ? "active" : "inactive")
                                    : "active";
                                const isActive = statusRaw?.toLowerCase() === "active";

                                const fullName = item.first_name && item.last_name
                                    ? `${item.first_name} ${item.last_name}`
                                    : item.name || "";
                                const email = item.email || "";
                                const phone = item.phone_number || item.phone || "";
                                const dateOfBirth = item.date_of_birth
                                    ? new Date(item.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "";
                                const points = item.points || 0;

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
                                                    {fullName.toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: "#4b5563" }}>{email}</TableCell>
                                        <TableCell sx={{ color: "#4b5563" }}>{phone}</TableCell>
                                        <TableCell sx={{ color: "#4b5563" }}>{dateOfBirth}</TableCell>
                                        <TableCell sx={{ color: "#4b5563", fontWeight: 600 }}>⭐ {points}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </>
    );
}
