import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Checkbox,
  IconButton,
} from "@mui/material";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useLazyGetCustomersQuery,
  useDeleteCustomerMutation,
} from "services/customerSlice";
import CustomerAddEditModal from "./components/CustomerAddEditModal";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import useSnackbar from "hooks/useSnackbar";
import { Close } from "@mui/icons-material";

const CustomersPage = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [listError, setListError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // API hooks
  const [getCustomers, { isFetching: isLoading }] = useLazyGetCustomersQuery();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch customers with server-side pagination and search
  const fetchCustomers = useCallback(async () => {
    setListError("");

    try {
      const response = await getCustomers({
        page: page + 1, // API uses 1-based indexing
        page_size: rowsPerPage,
        search: debouncedSearch || undefined,
      });

      if (response?.error) {
        setCustomers([]);
        setTotalCount(0);
        setListError(
          response.error?.data?.detail ||
          response.error?.data?.message ||
          response.error?.data ||
          response.error?.message ||
          "Unable to load customers. Please try again."
        );
        return;
      }

      const rawData = response?.data;

      // Handle different response structures
      if (rawData) {
        // Check if data has results array (paginated response)
        if (rawData.results && Array.isArray(rawData.results)) {
          setCustomers(rawData.results);
          setTotalCount(rawData.count || rawData.results.length);
        }
        // Check if data is directly an array
        else if (Array.isArray(rawData.data)) {
          setCustomers(rawData.data);
          setTotalCount(rawData.count || rawData.total || rawData.data.length);
        }
        // Check if rawData itself is an array
        else if (Array.isArray(rawData)) {
          setCustomers(rawData);
          setTotalCount(rawData.length);
        }
        // Fallback
        else {
          setCustomers([]);
          setTotalCount(0);
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalCount(0);
      setListError("Failed to load customers. Please try again.");
    }
  }, [getCustomers, page, rowsPerPage, debouncedSearch]);

  // Fetch customers on mount and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedRows([]); // Clear selections when changing page
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedRows([]); // Clear selections when changing page size
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;

    const customerId = selectedRows[0];
    const customer = customers.find((c) => c.id === customerId);

    if (customer) {
      setSelectedCustomer(customer);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteSelectClick = () => {
    setListError("");
    setSelectionMode((prev) => !prev);
    setSelectedRows([]);
  };

  const handleDeleteClick = () => {
    setListError("");
    if (selectedRows.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) return;

    setListError("");

    try {
      await Promise.all(
        selectedRows.map(async (id) => {
          const response = await deleteCustomer(id);
          if (response?.error) {
            console.log(response?.error);
            return false;
          }
        })
      );

      openSnackbar("Customer(s) deleted successfully", "success");
      setDeleteDialogOpen(false);
      setSelectionMode(false);
      setSelectedRows([]);
      fetchCustomers(); // Refresh the list
    } catch (error) {
      setListError(error?.message || "Failed to delete selected customers.");
      openSnackbar("Failed to delete customer(s)", "error");
      setDeleteDialogOpen(false);
    }
  };

  const handleClear = () => {
    setSelectionMode((prev) => !prev);
    setSelectedRows([]);
  };

  const handleRowClick = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    setSelectedRows([id]);
    setDeleteDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    setListError("");
    fetchCustomers(); // Refresh the list
    setSelectionMode(false);
    setSelectedRows([]);
  };

  const handleBack = () => {
    navigate("/pos/cash-register");
  };

  return (
    <>
      <Box className="p-4 h-[calc(100vh-86px)]">
        {/* Top Bar */}
        <Box className="flex justify-between items-center gap-4 mb-8">
          <Box className="flex justify-start items-center gap-4">
            <Button
              sx={{
                bgcolor: "#b01d39",
                color: "white",
                minHeight: 40,
                minWidth: 40,
                borderRadius: 50,
                "&:hover": { bgcolor: "#702626" },
              }}
              onClick={handleBack}
            >
              <ArrowLeft size={24} />
            </Button>
            <Box className="text-[24px] font-bold leading-[1.5] text-[#b01d39] uppercase">
              CUSTOMER MANAGEMENT
            </Box>
          </Box>
          <Box className="flex justify-start items-center gap-4">
            <Box className="relative">
              <KeyboardTextField
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: searchTerm && (
                    <IconButton
                      onClick={() => setSearchTerm("")}
                      sx={{
                        color: "#ffffff",
                        backgroundColor: "#b01d39",
                        borderRadius: "50%",
                        p: "3px",
                        "&:hover": {
                          backgroundColor: "#702626",
                        },
                      }}
                      size="small"
                    >
                      <X size={15} />
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "1px solid #000000",
                    borderRadius: "8px",
                    padding: "8px 0 8px 15px",
                    fontSize: "16px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    color: "#575757",
                    minWidth: "300px",
                    "& fieldset": {
                      border: "none",
                    },
                    "& input::placeholder": {
                      color: "#575757",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Button Bar */}
        <Box className="flex justify-between items-center gap-4 mb-8">
          <Box className="flex justify-start items-center gap-4">
            <Button
              onClick={handleAddCustomer}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Plus size={16} /> ADD
            </Button>
            <Button
              onClick={handleEditClick}
              disabled={selectedRows.length !== 1}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&.Mui-disabled": {
                  background: "#00000042",
                  color: "#000000",
                },
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Edit2 size={16} /> EDIT
            </Button>
            {selectionMode ? (
              <Button
                onClick={handleDeleteClick}
                disabled={selectedRows.length === 0 || isDeleting}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                CONFIRM DELETE ({selectedRows?.length ?? 0})
              </Button>
            ) : (
              <Button
                onClick={handleDeleteSelectClick}
                disabled={isDeleting}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                <Trash2 size={16} /> DELETE
              </Button>
            )}
            {selectionMode && (
              <Button
                onClick={handleClear}
                disabled={selectedRows.length === 0}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  color: "#ffffff",
                  background: "#b01d39",
                  padding: "8px 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  "&.Mui-disabled": {
                    background: "#00000042",
                    color: "#000000",
                  },
                  "&:hover": {
                    background: "#702626",
                  },
                }}
              >
                <Close size={16} /> Clear
              </Button>
            )}
          </Box>
          <Box className="flex justify-start items-center gap-4">
            <Box className="text-[20px] font-[500] leading-[1.5] text-black">
              Total : {totalCount}
            </Box>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  padding: "0",
                },
                "& .MuiIconButton-root": {
                  paddingTop: "0",
                  paddingBottom: "0",
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: 14,
                },
              }}
            />
            <Button
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "1.5",
                color: "#ffffff",
                background: "#b01d39",
                padding: "8px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                "&:hover": {
                  background: "#702626",
                },
              }}
            >
              <Filter size={20} /> FILTER
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            height: "calc(100vh - 280px)",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {selectionMode && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      fontSize: "16px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "#ffffff",
                      bgcolor: "#000000",
                      padding: "16px 16px",
                    }}
                  >
                    <Checkbox
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < customers.length
                      }
                      checked={
                        customers.length > 0 &&
                        selectedRows.length === customers.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(customers.map((c) => c.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "white",
                        },
                        "& .MuiSvgIcon-root": {
                          fill: "white",
                        },
                      }}
                    />
                  </TableCell>
                )}

                {[
                  "NAME",
                  "EMAIL",
                  "PHONE NUMBER",
                  "DATE OF BIRTH",
                  "POINTS",
                  "",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontSize: "16px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "#ffffff",
                      bgcolor: "#000000",
                      padding: "16px 16px",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={selectionMode ? 7 : 6}
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : listError ? (
                <TableRow>
                  <TableCell
                    colSpan={selectionMode ? 7 : 6}
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "#b01d39",
                      fontWeight: 600,
                    }}
                  >
                    {listError}
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={selectionMode ? 7 : 6}
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => {
                  const isSelected = selectedRows.includes(customer.id);
                  const fullName = customer.first_name && customer.last_name
                    ? `${customer.first_name} ${customer.last_name}`
                    : customer.name || "N/A";

                  return (
                    <TableRow
                      key={customer.id}
                      onClick={() => handleRowClick(customer.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: isSelected
                          ? "#b01d39"
                          : index % 2 === 0
                            ? "white"
                            : "grey.100",
                        "&:hover": {
                          bgcolor: isSelected ? "#b01d39" : "grey.50",
                        },
                        color: isSelected ? "white" : "inherit",
                      }}
                    >
                      {selectionMode && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.includes(customer.id)}
                            onChange={() => handleRowClick(customer.id)}
                            sx={{
                              color: "#b01d39",
                              "&.Mui-checked": {
                                color: "#b01d39",
                              },
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}

                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        {fullName}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        {customer.email || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        {customer.phone_number || customer.phone || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: isSelected ? "white" : "inherit" }}>
                        {customer.date_of_birth
                          ? new Date(customer.date_of_birth).toLocaleDateString(
                            "en-US"
                          )
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        ⭐ {customer.points || 0}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: isSelected ? "white" : "inherit",
                        }}
                      >
                        <Button
                          onClick={(e) => handleDeleteSingle(customer.id, e)}
                          sx={{
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: "1.5",
                            color: isSelected ? "#b01d39" : "#ffffff",
                            background: isSelected ? "#ffffff" : "#b01d39",
                            padding: "8px 8px",
                            minWidth: "0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "5px",
                            "&:hover": {
                              background: isSelected ? "#fef2f2" : "#702626",
                            },
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modals */}
      <CustomerAddEditModal
        open={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
        onSuccess={handleSaveCustomer}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${selectedRows.length} customer(s)?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmLoading={isDeleting}
      />
    </>
  );
};

export default CustomersPage;
