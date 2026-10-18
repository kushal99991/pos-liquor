import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import {
  applyFinalDiscount,
  applyMultiItemDiscount,
} from "store/slice/cart.slice";
import MultiItemDiscountDialog from "./components/MultiItemDiscountDialog";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";

import DiscountSidebar from "./components/DiscountSidebar";
import StandardDiscountPanel from "./components/StandardDiscountPanel";
import CustomDiscountPanel from "./components/CustomDiscountPanel";
import MultiItemDiscountPanel from "./components/MultiItemDiscountPanel";
import { useGetDiscountListQuery } from "services/discountSlice";
import { DiscountType } from "constants/discount";

// const standardDiscounts = [
//   {
//     id: "1",
//     name: "FRIENDS & FAMILY DISCOUNT",
//     type: "percentage",
//     value: 10.0,
//   },
//   { id: "2", name: "EMPLOYEE DISCOUNT", type: "percentage", value: 15.0 },
//   { id: "3", name: "SPEND $100 GET $5 OFF", type: "amount", value: 5.0 },
//   { id: "4", name: "SPEND $10 GET 1$ OFF", type: "amount", value: 1.0 },
// ];

export default function DiscountDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const appliedDiscount = useSelector((state) => state.cart.discount);
  const { data: standardDiscounts = []  } = useGetDiscountListQuery()
  

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState(null);
  const [selectedType, setSelectedType] = useState("standard");
  const [activeTab, setActiveTab] = useState(DiscountType.PERCENTAGE);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [customValue, setCustomValue] = useState("0.00");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showMultiItemCalculator, setShowMultiItemCalculator] = useState(false);
  const [multiItemDiscountsApplied, setMultiItemDiscountsApplied] =
    useState(false);

  // When dialog opens, sync form state from appliedDiscount (e.g. after resume cart)
  // so the correct discount_type, discount, and mode are selected in the Discount modal
  useEffect(() => {
    if (!open) return;

    if (!appliedDiscount || !appliedDiscount.discount_type) {
      // No discount applied: reset to defaults
      setSelectedType("standard");
      setSelectedDiscount(null);
      setActiveTab(DiscountType.PERCENTAGE);
      setCustomValue("0.00");
      setSelectedItems(new Set());
      setMultiItemDiscountsApplied(false);
      return;
    }

    const {
      discount_type,
      discount_id,
      discount_value,
      discount_mode,
      discount_amount,
      discount_calculation_type,
      selectedItems: storedSelectedItems,
    } = appliedDiscount;

    const modeUpper = (discount_mode || "").toUpperCase();
    // FAVOURITE: use discount_calculation_type for PERCENTAGE vs AMOUNT tab
    const tabMode = modeUpper === "FAVOURITE" ? (discount_calculation_type || "PERCENTAGE") : modeUpper;

    if (discount_type === "standard") {
      setSelectedType("standard");
      const list = Array.isArray(standardDiscounts) ? standardDiscounts : [];
      const found = list.find((d) => Number(d.id) === Number(discount_id)) || null;
      setSelectedDiscount(found);
      setActiveTab((tabMode || "").toUpperCase() === "AMOUNT" ? DiscountType.AMOUNT : DiscountType.PERCENTAGE);
    } else if (discount_type === "custom") {
      setSelectedType("custom");
      setActiveTab((tabMode || modeUpper) === "AMOUNT" ? DiscountType.AMOUNT : DiscountType.PERCENTAGE);
      // Show the value: prefer discount_value; if 0, derive from discount_amount (resume cart)
      if (discount_value != null && Number(discount_value) > 0) {
        setCustomValue(String(discount_value));
      } else if (discount_amount != null && Number(discount_amount) > 0) {
        if (modeUpper === "AMOUNT") {
          setCustomValue(Number(discount_amount).toFixed(2));
        } else {
          const subtotal = (cartItems || []).reduce(
            (s, i) => s + (i.sale_price || i.price || 0) * (i.quantity || 1),
            0
          );
          setCustomValue(
            subtotal > 0
              ? ((Number(discount_amount) / subtotal) * 100).toFixed(2)
              : "0.00"
          );
        }
      } else {
        setCustomValue("0.00");
      }
    } else if (discount_type === "multi_item") {
      setSelectedType("multi_item");
      setMultiItemDiscountsApplied(true);
      const itemIds = (storedSelectedItems || []).map((id) => Number(id));
      setSelectedItems(new Set(itemIds));
    }
  }, [open, appliedDiscount, standardDiscounts, cartItems]);

  const handleNumberClick = (num) => {
    if (customValue === "0.00") {
      setCustomValue(num === "." ? "0." : num);
    } else {
      setCustomValue(customValue + num);
    }
  };

  const handleClear = () => setCustomValue("0.00");

  const handleBackspace = () => {
    if (customValue.length > 1) setCustomValue(customValue.slice(0, -1));
    else setCustomValue("0.00");
  };

  const toggleItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    const itemIdNum = Number(itemId);
    if (newSelected.has(itemIdNum)) newSelected.delete(itemIdNum);
    else newSelected.add(itemIdNum);
    setSelectedItems(newSelected);
  };

  const calculateMultiItemTotals = useMemo(() => {
    if (!appliedDiscount || appliedDiscount.discount_type !== "multi_item") {
      return { originalTotal: 0, discountAmount: 0, tax: 0, discountGrandTotal: 0 };
    }

    const selectedCartItems = cartItems.filter((item) => {
      const itemId = item.id || item.item_id;
      return appliedDiscount.selectedItems?.some(selectedId => 
        Number(selectedId) === Number(itemId)
      );
    });

    if (selectedCartItems.length === 0) {
      return { originalTotal: 0, discountAmount: 0, tax: 0, discountGrandTotal: 0 };
    }

    // 🧮 Step 1: Calculate original total = item price × quantity (no discount, no tax)
    const originalTotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.sale_price || item.price || 0) * (item.quantity || 1),
      0
    );

    // FAVOURITE => use discount_calculation_type for PERCENTAGE vs AMOUNT
    const eff = (appliedDiscount?.discount_mode === "FAVOURITE" && appliedDiscount?.discount_calculation_type)
      ? appliedDiscount.discount_calculation_type
      : appliedDiscount?.discount_mode;
    const isPct = (eff || "").toUpperCase() === "PERCENTAGE" || (eff || "").toLowerCase() === "percentage";
    const isAmt = (eff || "").toUpperCase() === "AMOUNT" || (eff || "").toLowerCase() === "amount";

    let totalDiscount = 0;
    if (isPct) {
      totalDiscount = (originalTotal * (appliedDiscount.discount_value || 0)) / 100;
    } else if (isAmt) {
      if (appliedDiscount?.discount_amount != null && Number(appliedDiscount.discount_amount) > 0) {
        totalDiscount = appliedDiscount.discount_amount;
      } else {
        totalDiscount = appliedDiscount.discount_value || 0;
      }
    }

    const calculatedItems = selectedCartItems.map((item) => {
      const itemTotal = (item.sale_price || item.price || 0) * (item.quantity || 1);
      let itemDiscount = 0;
      if (isPct) {
        itemDiscount = (itemTotal * (appliedDiscount.discount_value || 0)) / 100;
      } else if (isAmt) {
        const proportion = originalTotal > 0 ? itemTotal / originalTotal : 0;
        itemDiscount = totalDiscount * proportion;
      }
      
      const itemTotalAfterDiscount = itemTotal - itemDiscount;

      return {
        ...item,
        itemTotal,
        discount: itemDiscount,
        discountedTotal: itemTotalAfterDiscount,
      };
    });

    // 🧮 Step 4: Calculate tax on discounted prices
    const totalTax = calculatedItems.reduce((sum, item) => {
      if (!item.taxes || !Array.isArray(item.taxes) || item.taxes.length === 0) {
        return sum;
      }
      // Calculate tax rate
      const totalTaxRate = item.taxes.reduce((taxSum, tax) => {
        const rate = parseFloat(tax.rate) || 0;
        return taxSum + rate;
      }, 0);
      // Tax calculated on discounted total
      const itemTax = (item.discountedTotal * totalTaxRate) / 100;
      return sum + itemTax;
    }, 0);

    // 🧮 Step 5: Compute totals
    // Calculate discount amount by summing all item discounts
    let calculatedDiscountAmount = calculatedItems.reduce(
      (sum, item) => sum + item.discount,
      0
    );
    
    // If discount_amount is explicitly set in appliedDiscount, use it as the source of truth
    // This ensures consistency with the discount that was actually applied
    if (appliedDiscount?.discount_amount !== undefined && appliedDiscount?.discount_amount !== null && appliedDiscount.discount_amount > 0) {
      calculatedDiscountAmount = appliedDiscount.discount_amount;
    }
    
    // Grand total = discounted total + tax
    const discountGrandTotal = calculatedItems.reduce(
      (sum, item) => sum + item.discountedTotal,
      0
    ) + totalTax;

    return {
      originalTotal: Number(originalTotal.toFixed(2)),
      discountAmount: Number(calculatedDiscountAmount.toFixed(2)),
      tax: Number(totalTax.toFixed(2)),
      discountGrandTotal: Number(discountGrandTotal.toFixed(2)),
    };
  }, [appliedDiscount, cartItems]);

  // STANDARD with discount_id => discount_mode=FAVOURITE, discount_calculation_type=PERCENTAGE|AMOUNT for math
  const calculateStandardDiscount = () => {
    if (!selectedDiscount) return null;
    const dtype = (selectedDiscount.type || "").toUpperCase();
    const isAmount = dtype === DiscountType.AMOUNT;
    return {
      discount_type: "standard",
      discount_id: selectedDiscount.id,
      discount_value: selectedDiscount.value || 0,
      discount_mode: DiscountType.FAVOURITE,
      discount_calculation_type: isAmount ? DiscountType.AMOUNT : DiscountType.PERCENTAGE,
      discount_amount: isAmount ? Number(selectedDiscount.value || 0) : undefined,
      selectedItems: [],
    };
  };

  // CUSTOM => discount_mode=PERCENTAGE or AMOUNT (from request)
  const calculateCustomDiscount = () => {
    const value = parseFloat(customValue);
    const isPercentage = activeTab === DiscountType.PERCENTAGE;
    return {
      discount_type: "custom",
      discount_id: null,
      discount_value: value || 0,
      discount_mode: activeTab,
      // For PERCENTAGE: don't set discount_amount (calculate from discount_value)
      // For AMOUNT: set discount_amount to the value
      discount_amount: isPercentage ? undefined : Number(value || 0),
      selectedItems: [],
    };
  };

  const handleApply = () => {
    let discountDetails;
    if (selectedType === "standard") {
      discountDetails = calculateStandardDiscount();
    } else if (selectedType === "custom") {
      discountDetails = calculateCustomDiscount();
      console.log(discountDetails, "calculateCustomDiscount");
    } else if (selectedType === "multi_item") {
      // 🧩 Collect all items that have a discount_meta
      const itemsWithDiscount = cartItems.filter((item) => {
        const itemId = item.id || item.item_id;
        return selectedItems.has(Number(itemId));
      });

      if (itemsWithDiscount.length > 0) {
        const firstMeta = itemsWithDiscount[0].discount_meta || {};

        const discount_amount = itemsWithDiscount.reduce(
          (sum, item) => sum + (item.discount_meta?.discount_amount || 0),
          0
        );

        const selectedItemIds = itemsWithDiscount.map((item) => item.id || item.item_id);
        // MULTI_ITEM: with discount_id => FAVOURITE; without (CUSTOM) => PERCENTAGE/AMOUNT
        const hasId = !!firstMeta.discount_id;
        const multiMode = hasId
          ? DiscountType.FAVOURITE
          : (firstMeta.discount_mode || DiscountType.PERCENTAGE);
        const multiCalc = hasId ? (firstMeta.discount_calculation_type || DiscountType.PERCENTAGE) : undefined;

        discountDetails = {
          discount_type: "multi_item",
          discount_id: firstMeta.discount_id || null,
          discount_value: firstMeta.discount_value || 0,
          discount_mode: multiMode,
          discount_calculation_type: multiCalc,
          discount_amount: Number(discount_amount.toFixed(2)),
          selectedItems: selectedItemIds,
        };
      } else {
        discountDetails = {
          discount_type: "multi_item",
          discount_id: null,
          discount_value: 0,
          discount_mode: null,
          discount_calculation_type: undefined,
          discount_amount: 0,
          selectedItems: [],
        };
      }
    }
    if (discountDetails) {
      setPendingDiscount(discountDetails);
      setConfirmOpen(true);
    }
  };

  const handleSelectDiscount = () => setShowMultiItemCalculator(true);
  const handleMultiItemCalculatorClose = () =>
    setShowMultiItemCalculator(false);

  const handleMultiItemApply = (discountData) => {
    const { discount_amount, discount_mode, selectedItems } = discountData;

    dispatch(
      applyMultiItemDiscount({
        skus: selectedItems,
        discountAmount: discount_amount,
        method: discount_mode,
        meta: discountData,
        discount: discountData,
      })
    );
    setMultiItemDiscountsApplied(true);
    setShowMultiItemCalculator(false);
  };

  const handleRemoveMultiItemDiscount = () => {
    dispatch(
      applyMultiItemDiscount({
        skus: Array.from(selectedItems),
        discountAmount: 0,
        method: "none",
        meta: null,
      })
    );
    setMultiItemDiscountsApplied(false);
  };

  const handleCancelMultiItem = () => {
    setSelectedItems(new Set());
    setMultiItemDiscountsApplied(false);
  };

  const handleRemoveStandardDiscount = () => {
    dispatch(applyFinalDiscount(null));
    setSelectedDiscount(null);
  };

  const handleRemoveCustomDiscount = () => {
    dispatch(applyFinalDiscount(null));
    setCustomValue("0.00");
  };

  const handleConfirmApply = () => {
    if (!pendingDiscount) return false;
    dispatch(applyFinalDiscount(pendingDiscount));
    setConfirmOpen(false);
    setPendingDiscount(null);
    onClose();
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setPendingDiscount(null);
  };

  const totals = calculateMultiItemTotals;
  console.log(totals, "totals");

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "85vh",
            borderRadius: 0,
            backgroundColor: "#e5e7eb",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#b91c1c",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            Discount
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", padding: 0 }}>
          <DiscountSidebar
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />

          <Box sx={{ flex: 1, backgroundColor: "white", overflow: "auto" }}>
            {selectedType === "standard" && (
              <StandardDiscountPanel
                standardDiscounts={standardDiscounts}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedDiscount={selectedDiscount}
                setSelectedDiscount={setSelectedDiscount}
                handleApply={handleApply}
                handleRemove={handleRemoveStandardDiscount}
                hasAppliedDiscount={appliedDiscount && appliedDiscount.discount_type === "standard"}
              />
            )}
            {selectedType === "custom" && (
              <CustomDiscountPanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                customValue={customValue}
                handleNumberClick={handleNumberClick}
                handleClear={handleClear}
                handleBackspace={handleBackspace}
                handleApply={handleApply}
                handleRemove={handleRemoveCustomDiscount}
                hasAppliedDiscount={appliedDiscount && appliedDiscount.discount_type === "custom"}
              />
            )}
            {selectedType === "multi_item" && (
              <MultiItemDiscountPanel
                cartItems={cartItems}
                selectedItems={selectedItems}
                toggleItem={toggleItem}
                totals={totals}
                multiItemDiscountsApplied={multiItemDiscountsApplied}
                handleRemoveMultiItemDiscount={handleRemoveMultiItemDiscount}
                handleCancelMultiItem={handleCancelMultiItem}
                handleApplyMultiItem={handleApply}
                handleSelectDiscount={handleSelectDiscount}
                appliedDiscount={appliedDiscount}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <MultiItemDiscountDialog
        open={showMultiItemCalculator}
        onClose={handleMultiItemCalculatorClose}
        selectedItems={selectedItems}
        cartItems={cartItems}
        favoriteDiscounts={standardDiscounts}
        onApply={handleMultiItemApply}
      />

      <ConfirmationDialog
        open={confirmOpen}
        title="Apply Discount"
        description="Are you sure you want to apply this discount to the cart?"
        onConfirm={handleConfirmApply}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}
