import { DiscountType } from "constants/discount";
import { useMemo } from "react";

export const transformErrorResponse = (error) => {
  if (error?.data?.detail) {
    return error?.data?.detail;
  }

  return (
    error?.message || "An unexpected error occurred. Please try again later."
  );
};

export const useCartCalculations = (cartItems, discount, storeConfig, surcharge = null) => {
  // Step 1: Apply discount to items
  const itemsWithDiscount = useMemo(() => {
    if (!discount) {
      return cartItems.map((item) => ({
        ...item,
        sale_final_price: item.sale_price,
      }));
    }

    const {
      discount_type,
      discount_mode,
      discount_value,
      discount_calculation_type,
      selectedItems = [],
    } = discount;

    const effectiveMode = (discount_mode === "FAVOURITE" && discount_calculation_type)
      ? discount_calculation_type
      : discount_mode;

    if (discount_type === "standard" || discount_type === "custom") {
      return cartItems.map((item) => ({
        ...item,
        sale_final_price: item.sale_price,
        discount_meta: {
          discount_mode: discount_mode,
          discount_value: discount_value,
        },
      }));
    } else if (discount_type === "multi_item") {
      return cartItems.map((item) => {
        let sale_final_price = item.sale_price;
        let itemDiscountMeta = null;

        const itemId = item.id || item.item_id;
        const isSelected = selectedItems.some((selectedId) => Number(selectedId) === Number(itemId));

        if (isSelected) {
          if (effectiveMode === DiscountType.PERCENTAGE) {
            const itemTotal = item.sale_price * (item.quantity || 1);
            const itemTotalDiscount = (itemTotal * discount_value) / 100;
            const itemTotalAfterDiscount = itemTotal - itemTotalDiscount;
            sale_final_price = (item.quantity || 1) > 0
              ? Math.max(0, itemTotalAfterDiscount / (item.quantity || 1))
              : item.sale_price;
            itemDiscountMeta = { discount_mode: discount_mode, discount_value: discount_value };
          } else if (effectiveMode === DiscountType.AMOUNT) {
            const itemTotal = item.sale_price * (item.quantity || 1);
            const amt = (item.item_discount_amount != null && Number(item.item_discount_amount) > 0)
              ? Number(item.item_discount_amount)
              : (discount_value || 0);
            const itemTotalAfterDiscount = Math.max(0, itemTotal - amt);
            sale_final_price = (item.quantity || 1) > 0
              ? itemTotalAfterDiscount / (item.quantity || 1)
              : item.sale_price;
            itemDiscountMeta = { discount_mode: discount_mode, discount_value: amt };
          }
        }

        return {
          ...item,
          sale_final_price,
          ...(itemDiscountMeta && { discount_meta: itemDiscountMeta }),
        };
      });
    }

    return cartItems.map((item) => ({
      ...item,
      sale_final_price: item.sale_price,
    }));
  }, [cartItems, discount]);

  // Step 2: Apply surcharge to items for per-item surcharge metadata & display
  const adjustedCartItems = useMemo(() => {
    if (!surcharge || !surcharge.value) {
      return itemsWithDiscount;
    }

    const surchargeValue = parseFloat(surcharge.value);

    // Multi-Item Surcharge
    if (surcharge.type === "multi_item") {
      const selectedIds = new Set((surcharge.selectedItems || []).map(id => Number(id)));

      const selectedSubtotal = itemsWithDiscount.reduce((sum, item) => {
        const itemId = item.id || item.item_id;
        if (selectedIds.has(Number(itemId))) {
          return sum + (item.sale_final_price * (item.quantity || 1));
        }
        return sum;
      }, 0);

      let totalSurchargeAmount = 0;
      if (surcharge.mode === "PERCENTAGE" || surcharge.mode === "percentage") {
        totalSurchargeAmount = (selectedSubtotal * surchargeValue) / 100;
      } else {
        totalSurchargeAmount = surchargeValue;
      }

      return itemsWithDiscount.map((item) => {
        const itemId = item.id || item.item_id;
        if (selectedIds.has(Number(itemId))) {
          const itemTotal = item.sale_final_price * (item.quantity || 1);
          const itemProportion = selectedSubtotal > 0 ? itemTotal / selectedSubtotal : 0;
          const itemSurchargeAmount = totalSurchargeAmount * itemProportion;
          const itemSurchargePerUnit = (item.quantity || 1) > 0 ? itemSurchargeAmount / (item.quantity || 1) : 0;

          return {
            ...item,
            sale_final_price: item.sale_final_price + itemSurchargePerUnit,
            surcharge_meta: {
              surcharge_mode: surcharge.mode || "AMOUNT",
              surcharge_value: surcharge.mode === "PERCENTAGE" ? surchargeValue : itemSurchargePerUnit,
            },
          };
        }
        return item;
      });
    }

    // Standard/Custom Surcharge (Global) - apply to all items
    if (surcharge.type === "PERCENTAGE") {
      return itemsWithDiscount.map((item) => {
        const itemSurchargePerUnit = (item.sale_final_price * surchargeValue) / 100;
        return {
          ...item,
          sale_final_price: item.sale_final_price + itemSurchargePerUnit,
          surcharge_meta: {
            surcharge_mode: "PERCENTAGE",
            surcharge_value: surchargeValue,
          },
        };
      });
    } else if (surcharge.type === "AMOUNT") {
      const totalSubtotal = itemsWithDiscount.reduce((sum, item) =>
        sum + (item.sale_final_price * (item.quantity || 1)), 0);

      return itemsWithDiscount.map((item) => {
        const itemTotal = item.sale_final_price * (item.quantity || 1);
        const itemProportion = totalSubtotal > 0 ? itemTotal / totalSubtotal : 0;
        const itemSurchargeAmount = surchargeValue * itemProportion;
        const itemSurchargePerUnit = (item.quantity || 1) > 0 ? itemSurchargeAmount / (item.quantity || 1) : 0;

        return {
          ...item,
          sale_final_price: item.sale_final_price + itemSurchargePerUnit,
          surcharge_meta: {
            surcharge_mode: "AMOUNT",
            surcharge_value: itemSurchargePerUnit,
          },
        };
      });
    }

    return itemsWithDiscount;
  }, [itemsWithDiscount, surcharge]);

  // ✅ Base Subtotal: original item prices (or discounted item prices for multi-item discount)
  const subtotal = useMemo(() => {
    return itemsWithDiscount.reduce(
      (sum, item) => sum + item.sale_final_price * (item.quantity || 1),
      0
    );
  }, [itemsWithDiscount]);

  // 🧾 Tax calculation: sum of all item-wise taxes (calculated on subtotal before discount)
  const tax = useMemo(() => {
    // For STANDARD/CUSTOM discounts, calculate tax on original prices (before discount)
    // For other discounts (multi_item), tax is calculated on discounted prices
    const itemsForTax = discount && (discount.discount_type === "standard" || discount.discount_type === "custom")
      ? cartItems.map(item => ({ ...item, sale_final_price: item.sale_price }))
      : itemsWithDiscount;

    return itemsForTax.reduce((sum, item) => {
      if (!item.taxes || !Array.isArray(item.taxes) || item.taxes.length === 0) {
        return sum;
      }
      // Sum all tax rates for this item
      const totalTaxRate = item.taxes.reduce((taxSum, tax) => {
        const rate = parseFloat(tax.rate) || 0;
        return taxSum + rate;
      }, 0);
      // Calculate tax: (sale_final_price * quantity) * (totalTaxRate / 100)
      const itemSubtotal = item.sale_final_price * (item.quantity || 1);
      const itemTax = (itemSubtotal * totalTaxRate) / 100;
      return sum + itemTax;
    }, 0);
  }, [itemsWithDiscount, discount, cartItems]);

  // ✅ Discount amount: include quantity
  const discountAmount = useMemo(() => {
    if (discount && (discount.discount_type === "standard" || discount.discount_type === "custom")) {
      const mode = discount.discount_mode;
      const calcType = discount.discount_calculation_type || mode;
      // FAVOURITE: use discount_calculation_type for math
      const isFav = mode === "FAVOURITE";
      const effective = isFav ? (calcType === "AMOUNT" ? "AMOUNT" : "PERCENTAGE") : mode;

      // For FAVOURITE AMOUNT or when discount_value is 0/null, prefer discount_amount if available
      if (isFav && effective === DiscountType.AMOUNT) {
        const explicitAmount = discount.discount_amount;
        if (explicitAmount != null && Number(explicitAmount) > 0) return Number(explicitAmount);
        return discount.discount_value || 0;
      }

      // For PERCENTAGE: always calculate from discount_value (don't use discount_amount shortcut)
      if (effective === DiscountType.PERCENTAGE) {
        const sub = cartItems.reduce((sum, item) => sum + (item.sale_price || item.price || 0) * (item.quantity || 1), 0);
        if (discount.discount_value != null && Number(discount.discount_value) > 0) {
          return (sub * discount.discount_value) / 100;
        }
        return 0;
      }

      // For AMOUNT (non-FAVOURITE): prefer discount_amount if available, else use discount_value
      if (effective === DiscountType.AMOUNT && !isFav) {
        const explicitAmount = discount.discount_amount;
        if (explicitAmount != null && Number(explicitAmount) > 0) return Number(explicitAmount);
        return discount.discount_value || 0;
      }

      if (effective === DiscountType.AMOUNT) return discount.discount_value || 0;
      return 0;
    }

    // Multi-item discount: calculate only if discount exists and is multi_item type
    if (discount && discount.discount_type === "multi_item") {
      return cartItems.reduce(
        (sum, item) => {
          const matchingAdjusted = itemsWithDiscount.find(adj => (adj.id || adj.item_id) === (item.id || item.item_id));
          if (matchingAdjusted && matchingAdjusted.sale_final_price < item.sale_price) {
            return sum + (item.sale_price - matchingAdjusted.sale_final_price) * (item.quantity || 1);
          }
          return sum;
        },
        0
      );
    }

    // No discount applied
    return 0;
  }, [itemsWithDiscount, cartItems, discount]);

  // Surcharge Calculation
  const surchargeAmount = useMemo(() => {
    if (!surcharge || !surcharge.value) return 0;

    const value = parseFloat(surcharge.value);

    // Multi-Item Surcharge
    if (surcharge.type === "multi_item") {
      const selectedIds = new Set((surcharge.selectedItems || []).map(id => Number(id)));

      const selectedSubtotal = itemsWithDiscount.reduce((sum, item) => {
        const itemId = item.id || item.item_id;
        if (selectedIds.has(Number(itemId))) {
          return sum + (item.sale_final_price * (item.quantity || 1));
        }
        return sum;
      }, 0);

      if (surcharge.mode === "PERCENTAGE" || surcharge.mode === "percentage" || surcharge.value_type === "PERCENTAGE") {
        return (selectedSubtotal * value) / 100;
      }
      return value; // If not percentage, it's a fixed amount per selected item
    }

    // Standard/Custom Surcharge (Global)
    if (surcharge.type === "PERCENTAGE") {
      // Surcharge percentage on subtotal
      return (subtotal * value) / 100;
    } else {
      // Fixed amount
      return value;
    }
  }, [surcharge, subtotal, itemsWithDiscount]);


  const grandTotal = useMemo(() => {
    const d = discount;
    const subtractDiscount =
      d && (d.discount_type === "standard" || d.discount_type === "custom") &&
      (d.discount_mode === DiscountType.AMOUNT ||
        d.discount_mode === DiscountType.PERCENTAGE ||
        d.discount_mode === "FAVOURITE");

    // grandTotal = (Subtotal - Discount) + Tax + Surcharge
    const base = subtractDiscount ? Math.max(0, subtotal - discountAmount) : subtotal;
    return Math.max(0, base + tax + surchargeAmount);
  }, [subtotal, discountAmount, tax, surchargeAmount, discount]);

  return {
    adjustedCartItems, // includes sale_final_price with discount and surcharge annotations
    subtotal,
    discountAmount,
    tax,
    surcharge: surchargeAmount, // Return the calculated amount, not the object
    grandTotal,
  };
};

/**
 * Checks if any item in the cart requires age verification
 * and whether the customer is verified.
 *
 * @param {Array} cartItems - Array of cart items
 * @param {Object} customer - Customer object with age verification info
 * @param {Object} user - User object with role information (optional)
 * @returns {Boolean} - True if age verification is required and not done
 */
export const shouldRequireAgeVerification = (cartItems, customer, user = null) => {
  const hasAgeRestrictedItem = cartItems.some((item) => item.age_check === true);
  
  const isCustomerVerified = customer?.isVerified === true;
  
  // If user is Admin, bypass age verification
  const isAdmin = user?.roles?.some(role => role === "Admin") || false;
  if (isAdmin) {
    return false;
  }

  return hasAgeRestrictedItem && !isCustomerVerified;
};
