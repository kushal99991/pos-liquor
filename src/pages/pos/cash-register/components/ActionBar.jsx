import { Box, Button } from "@mui/material";
import {
  Print,
  ContentCopy,
  AttachMoney,
  Percent,
  LocalOffer,
  Inventory,
  Description,
  PauseCircleOutline,
  PlayCircle,
  Delete,
  Replay,
  ViewList,
  Logout,
  People,
} from "@mui/icons-material";
import { useState, useCallback, useEffect } from "react";
import DiscountDialog from "./actions/DiscountDialog/DiscountDialog";
import PriceCheckDialog from "./actions/PriceCheckDialog";
import DrawerDialog from "./actions/DrawerDialog";
import { useNavigate } from "react-router-dom";
import AgeCheckDialog from "./actions/AgeCheckDialog";
import HoldDialog from "./actions/HoldDialog";
import ResumeDialog from "./actions/ResumeDialog";
import VoidDialog from "./actions/VoidDialog";
import ItemsModal from "./actions/ItemsModal/ItemsModal";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "store/slice/cart.slice";
import SelectReturnTypeDialog from "./actions/ReturnModals/SelectReturnTypeDialog";
import SingleReturnConfirmDialog from "./actions/ReturnModals/SingleReturnConfirmDialog";
import TransactionListDialog from "./actions/ReturnModals/TransactionListDialog";
import ReturnDataDialog from "./actions/ReturnModals/ReturnDataDialog";
import ReturnCheckoutDialog from "./actions/ReturnModals/ReturnCheckoutDialog";
import ChangePriceDialog from "./actions/ChangePriceDialog";
import PrintReceiptModal from "../../re-print/components/PrintReceiptModal";
import { useLazyGetOrdersQuery } from "services/orderSlice";
import useSnackbar from "hooks/useSnackbar";
import EndShiftDialog from "./actions/EndShiftDialog";
import { useLazyGetOpenDrawerQuery } from "services/cashierDrawerSlice";
import { saveSession } from "store/slice/auth.slice";
import SurchargeDialog from "./actions/SurchargeDialog";

const ActionBar = ({ onRefreshItems }) => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const [dialogType, setDialogType] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [getOrders, { isLoading: isOrdersLoading }] = useLazyGetOrdersQuery();
  const { openSnackbar } = useSnackbar();
  const user = useSelector((state) => state.auth.user);
  const [getOpenDrawer] = useLazyGetOpenDrawerQuery();
  const [hasActiveDrawer, setHasActiveDrawer] = useState(false);

  // Check for active drawer session when component mounts or user changes
  useEffect(() => {
    const checkActiveDrawer = async () => {
      if (user && (user?.role === "Cashier" || user?.role === "cashier")) {
        try {
          // First check if drawer_id exists in user state
          if (user?.drawer_id) {
            setHasActiveDrawer(true);
            return;
          }
          
          // If no drawer_id in state, check for open drawer from API
          const response = await getOpenDrawer();
          if (response?.data && !response?.error) {
            const drawerData = response.data;
            if (drawerData?.id) {
              // Update user session with drawer_id
              const updatedUser = {
                ...user,
                drawer_id: drawerData.id,
              };
              dispatch(saveSession(updatedUser));
              localStorage.setItem("session", JSON.stringify(updatedUser));
              setHasActiveDrawer(true);
              return;
            }
          }
          setHasActiveDrawer(false);
        } catch (error) {
          console.error("Error checking active drawer:", error);
          // If there's an error, still show if drawer_id exists in user state
          setHasActiveDrawer(!!user?.drawer_id);
        }
      } else {
        setHasActiveDrawer(false);
      }
    };

    checkActiveDrawer();
  }, [user, getOpenDrawer, dispatch]);

  const isCashier = user?.role === "Cashier" || user?.role === "cashier";
  const isAdmin = user?.roles?.some(role => role === "Admin") || false;
  const shouldShowEndShift = isCashier && hasActiveDrawer;
  const shouldShowAgeCheck = !isAdmin; // Hide Age Check for Admin users
  const shouldDisableVoid = isCashier; // Disable Void for Cashier users

  // Return flow state management
  const [returnStep, setReturnStep] = useState("select-type"); // select-type, transaction-list, return-data, checkout
  
  const handleOpenDialog = (type) => {
    setDialogType(type);
    // Reset return flow when opening return dialog
    if (type === "return") {
      setReturnStep("select-type");
    }
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    // Reset return flow when closing any dialog
    if (dialogType === "return") {
      setReturnStep("select-type");
    }
  };

  const handleResumeConfirm = (transactionId) => {
    console.log("Resume transaction:", transactionId);
  };

  const handleVoidConfirm = () => {
    dispatch(clearCart());
  };

  const formatDisplayDate = useCallback((value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return value;
  }, []);

  const mapOrderToTransaction = useCallback(
    (order) => {
      const toNumber = (val, fallback = 0) => {
        const num = Number(val);
        return Number.isFinite(num) ? num : fallback;
      };

      const items = Array.isArray(order?.items) ? order.items : [];
      const subtotalFromItems = items.reduce(
        (sum, item) => sum + toNumber(item?.total_amount),
        0
      );
      const subtotal = toNumber(order?.sub_total, subtotalFromItems);
      const tax = toNumber(order?.tax);
      const discount = toNumber(order?.discount_value);
      const computedTotal = subtotal - discount + tax;
      const total = toNumber(
        order?.total ?? order?.total_amount ?? order?.payment?.amount,
        Number.isFinite(computedTotal) ? computedTotal : 0
      );

      const mappedItems = items.map((item) => {
        const unitPrice = toNumber(
          item?.price ?? item?.item?.retail_price ?? item?.total_amount
        );
        return {
          name:
            item?.item?.name ??
            item?.name ??
            (item?.item_id ? `Item ${item.item_id}` : "Unknown Item"),
          qty: toNumber(item?.qty ?? item?.quantity),
          price: unitPrice.toFixed(2),
        };
      });

      const paymentTypeSource =
        order?.payment_type ?? order?.payment?.method ?? "N/A";

      return {
        id: order?.id ?? crypto.randomUUID(),
        barcode:
          order?.order_number ??
          order?.receipt_number ??
          `ORDER-${order?.id ?? ""}`,
        date: order?.order_date ?? null,
        displayDate: formatDisplayDate(order?.order_date),
        salesDate: order?.sales_date ?? order?.order_date ?? null,
        subtotal,
        tax,
        discount,
        total,
        customer: order?.customer?.name ?? "N/A",
        paymentType: paymentTypeSource
          .toString()
          .replace(/_/g, " ")
          .toUpperCase(),
        status: (order?.status ?? "COMPLETE").toString().toUpperCase(),
        items: mappedItems,
      };
    },
    [formatDisplayDate]
  );

  const handleLastPrint = async () => {
    try {
      const response = await getOrders();

      if (response?.error) {
        openSnackbar(
          response?.error?.data?.detail ||
          response?.error?.data?.message ||
          "Failed to fetch last order",
          "error"
        );
        return;
      }

      // Handle different response structures
      let ordersData = response?.data;

      // If data is nested (e.g., { data: { results: [...] } })
      if (
        ordersData &&
        typeof ordersData === "object" &&
        !Array.isArray(ordersData)
      ) {
        ordersData =
          ordersData.results || ordersData.data || ordersData.orders || [];
      }

      // Ensure it's an array
      if (!Array.isArray(ordersData)) {
        ordersData = [];
      }

      // Check if no orders found
      if (ordersData.length === 0) {
        openSnackbar(
          "No orders found. Please create an order first.",
          "warning"
        );
        return;
      }

      // Get the last order (assuming orders are sorted by date descending)
      // If not sorted, sort them by order_date descending
      const sortedOrders = [...ordersData].sort((a, b) => {
        const dateA = new Date(a?.order_date || a?.created_at || 0);
        const dateB = new Date(b?.order_date || b?.created_at || 0);
        return dateB - dateA;
      });

      const lastOrder = sortedOrders[0];

      if (!lastOrder) {
        openSnackbar(
          "No orders found. Please create an order first.",
          "warning"
        );
        return;
      }

      const transaction = mapOrderToTransaction(lastOrder);

      setSelectedTransaction(transaction);
      setPrintModalOpen(true);
    } catch (error) {
      openSnackbar("Failed to fetch last order", "error");
      console.error("Error fetching last order:", error);
    }
  };

  return (
    <>
      <Box className="bg-black px-5 py-3 shadow-lg">
        <Box className="flex items-center justify-between">
          <Box
            className="flex gap-5 lg:gap-7 overflow-x-auto w-full"
            sx={{
              "&::-webkit-scrollbar": { height: "6px" },
              "&::-webkit-scrollbar-thumb": {
                background: "#666",
                borderRadius: "3px",
              },
            }}
          >
            <Button
              onClick={handleLastPrint}
              disabled={isOrdersLoading}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "0",
                width: "100%",
                "&:disabled": { opacity: 0.5 },
              }}
            >
              <Print sx={{ fontSize: "35px" }} />
              <span className="text-[16px] font-medium text-nowrap">
                Last Print
              </span>
            </Button>
            <Box className="bg-white w-0.5 h-13.5"></Box>
            <Button
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "0",
                width: "100%",
              }}
              onClick={() => Navigate(`/pos/cash-register/reprint`)}
            >
              <ContentCopy sx={{ fontSize: "35px" }} />
              <span className="text-[16px] font-medium text-nowrap">
                Reprint
              </span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("surcharge")}
            >
              <AttachMoney sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Surcharge</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("discount")}
            >
              <Percent sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Discount</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("price-check")}
            >
              <LocalOffer sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Price-Check</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("drawer")}
            >
              <Inventory sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Drawer</span>
            </Button>
            {shouldShowAgeCheck && (
              <Button
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                  "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                  transition: "color 0.2s",
                  minWidth: "auto",
                  padding: "4px 8px",
                  width: "100%",
                }}
                onClick={() => handleOpenDialog("age-check")}
              >
                <Description sx={{ fontSize: "26px" }} />
                <span className="text-xs mt-1 font-medium">Age Check</span>
              </Button>
            )}
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={async () => {
                handleOpenDialog("hold");
              }}
            >
              <PauseCircleOutline sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Hold</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("resume")}
            >
              <PlayCircle sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Resume</span>
            </Button>
            <Button
              disabled={shouldDisableVoid}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
                "&.Mui-disabled": {
                  color: "#666",
                  opacity: 0.5,
                },
              }}
              onClick={() => handleOpenDialog("void")}
            >
              <Delete sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Void</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("return")}
            >
              <Replay sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Return</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => handleOpenDialog("changeprice")}
            >
              <LocalOffer sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Chg-Price</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => Navigate(`/pos/cash-register/items`)}
            >
              <ViewList sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Items</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                "&:hover": { color: "#ef4444", backgroundColor: "transparent" },
                transition: "color 0.2s",
                minWidth: "auto",
                padding: "4px 8px",
                width: "100%",
              }}
              onClick={() => Navigate(`/pos/customers`)}
            >
              <People sx={{ fontSize: "26px" }} />
              <span className="text-xs mt-1 font-medium">Customers</span>
            </Button>
            {shouldShowEndShift && (
              <Button
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                  "&:hover": {
                    color: "#ef4444",
                    backgroundColor: "transparent",
                  },
                  transition: "color 0.2s",
                  minWidth: "auto",
                  padding: "4px 8px",
                  width: "100%",
                }}
                onClick={() => handleOpenDialog("end-shift")}
              >
                <Logout sx={{ fontSize: "26px" }} />
                <span className="text-xs mt-1 font-medium">End Shift</span>
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      {dialogType === "discount" && (
        <DiscountDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "price-check" && (
        <PriceCheckDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "drawer" && (
        <DrawerDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "age-check" && (
        <AgeCheckDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "hold" && <HoldDialog open onClose={handleCloseDialog} />}

      {dialogType === "resume" && (
        <ResumeDialog
          open
          onClose={handleCloseDialog}
          onResume={handleResumeConfirm}
        />
      )}

      {dialogType === "void" && (
        <VoidDialog
          open
          onClose={handleCloseDialog}
          onConfirm={handleVoidConfirm}
        />
      )}

      {dialogType === "return" && (
        <>
          <SelectReturnTypeDialog
            open
            returnStep={returnStep}
            setReturnStep={setReturnStep}
            onClose={handleCloseDialog}
            onRefreshItems={onRefreshItems}
          />
        </>
      )}

      {dialogType === "changeprice" && (
        <ChangePriceDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "items" && (
        <ItemsModal open onClose={handleCloseDialog} />
      )}

      {dialogType === "end-shift" && (
        <EndShiftDialog open onClose={handleCloseDialog} />
      )}

      {dialogType === "surcharge" && (
        <SurchargeDialog open onClose={handleCloseDialog} />
      )}

      <PrintReceiptModal
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default ActionBar;
