import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useAddToCartItemMutation,
  useHoldCartMutation,
  useResumeCartMutation,
  useVoidCartMutation,
  useLazyGetCartListQuery,
} from "services/cartSlice";
import { useGetDiscountListQuery } from "services/discountSlice";
import {
  clearCart,
  setCartMeta,
  setBackendCarts,
  addItem,
  applyFinalDiscount,
} from "store/slice/cart.slice";
import { useCartCalculations } from "utils/helperFunctions/common";
import { DiscountType } from "constants/discount";
import useSnackbar from "./useSnackbar";

/**
 * Custom hook for cart operations
 * Provides all cart-related functionality including API calls, discount logic, and state management
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { openSnackbar } = useSnackbar();

  // Redux state
  const cartItems = useSelector((state) => state.cart.items);
  const discount = useSelector((state) => state.cart.discount);
  const cartMeta = useSelector((state) => state.cart.cartMeta);
  const storeConfig = useSelector(
    (state) => state.pos.installation.storeConfig
  );

  // API mutations
  const [addToCartItem] = useAddToCartItemMutation();
  const [holdCartMutation] = useHoldCartMutation();
  const [resumeCartMutation] = useResumeCartMutation();
  const [voidCartMutation] = useVoidCartMutation();
  const [getCartList] = useLazyGetCartListQuery();

  // Discount list query
  const { data: standardDiscounts = [] } = useGetDiscountListQuery();

  // Cart calculations
  const {
    adjustedCartItems,
    subtotal,
    discountAmount,
    tax,
    surcharge,
    grandTotal,
  } = useCartCalculations(cartItems, discount, storeConfig);

  // ==================== Utility Functions ====================

  /**
   * Resolve discount_mode for API payload
   * STANDARD with discount_id => FAVOURITE
   * CUSTOM => PERCENTAGE/AMOUNT
   * MULTI_ITEM with discount_id => FAVOURITE, else PERCENTAGE/AMOUNT
   */
  const resolveDiscountModeForApi = useCallback((discount) => {
    if (!discount?.discount_type) return null;
    const mode = (discount.discount_mode || "").toUpperCase();
    if (discount.discount_type === "standard")
      return discount.discount_id ? DiscountType.FAVOURITE : mode || null;
    if (discount.discount_type === "custom")
      return mode === "AMOUNT" || mode === "PERCENTAGE" ? mode : null;
    if (discount.discount_type === "multi_item")
      return discount.discount_id ? DiscountType.FAVOURITE : (mode || null);
    return mode || null;
  }, []);

  /**
   * Resolve item-level discount_mode
   */
  const resolveItemDiscountMode = useCallback((discount, item, isSelected) => {
    if (!discount?.discount_type) return null;
    const mode = (discount.discount_mode || "").toUpperCase();
    if (discount.discount_type === "standard")
      return discount.discount_id ? DiscountType.FAVOURITE : (mode || null);
    if (discount.discount_type === "custom") return mode || null;
    if (discount.discount_type === "multi_item") {
      if (!isSelected) return null;
      return discount.discount_id ? DiscountType.FAVOURITE : (mode || null);
    }
    return null;
  }, []);

  /**
   * Get discount value, looking up from standardDiscounts if needed
   */
  const getDiscountValue = useCallback(
    (discount) => {
      if (!discount || !discount.discount_type) return 0;

      // First, try to use discount_value from discount state
      if (discount.discount_value != null) {
        return Number(discount.discount_value);
      }

      // For STANDARD discounts, if discount_value is 0/null, look up the value from standardDiscounts
      if (
        discount.discount_type === "standard" &&
        discount.discount_id
      ) {
        const list = Array.isArray(standardDiscounts) ? standardDiscounts : [];
        const foundDiscount = list.find(
          (d) => Number(d.id) === Number(discount.discount_id)
        );
        if (foundDiscount && foundDiscount.value != null) {
          return Number(foundDiscount.value);
        }
      }

      return Number(discount.discount_value || 0);
    },
    [standardDiscounts]
  );

  /**
   * Build discount_summary for API payload
   */
  const buildDiscountSummary = useCallback(
    (originalSubtotal) => {
      if (!discount || !discount.discount_type) {
        return {
          original_total: parseFloat(originalSubtotal.toFixed(2)),
          discount_total: 0,
          discount_mode: null,
          discount_type: null,
          discount_value: 0,
          discount_id: 0,
        };
      }

      const summaryMode = resolveDiscountModeForApi(discount);
      const finalDiscountValue = getDiscountValue(discount);

      return {
        original_total: parseFloat(originalSubtotal.toFixed(2)),
        discount_total: parseFloat(discountAmount.toFixed(2)),
        discount_mode: summaryMode,
        discount_type:
          discount.discount_type === "standard" ||
            discount.discount_type === "custom" ||
            discount.discount_type === "multi_item"
            ? discount.discount_type
            : null,
        discount_value: finalDiscountValue,
        discount_id: discount.discount_id || 0,
      };
    },
    [discount, discountAmount, resolveDiscountModeForApi, getDiscountValue]
  );

  /**
   * Build items array for API payload
   */
  const buildCartItems = useCallback(() => {
    const getIsPack = (supportsPack, unitType) => {
      // If unit_type is pack or carton, it's a pack type
      if (unitType === 'pack' || unitType === 'carton') return true;
      return supportsPack === true;
    };

    // Map internal unit type names to API format (uppercase)
    const unitTypeToApi = (internalType) => {
      const type = String(internalType || 'single').toLowerCase();
      const map = {
        'single': 'PIECE',
        'pack': 'PACK',
        'carton': 'CARTON',
        'piece': 'PIECE',
      };
      return map[type] || 'PIECE';
    };

    return adjustedCartItems.map((item) => {
      const originalPrice = parseFloat(item.sale_price || item.price || 0);
      const qty = item.quantity || 1;
      const original_amount = originalPrice * qty;
      const finalPrice = parseFloat(
        item.sale_final_price || item.sale_price || 0
      );
      const final_amount = finalPrice * qty;
      const discount_amount = original_amount - final_amount;

      // Get unit type for API
      const internalUnitType = item.unit_type || 'single';
      const apiUnitType = unitTypeToApi(internalUnitType);

      // Item-level discount mode and type
      let itemDiscountMode = null;
      let itemDiscountType = null;
      let itemDiscountId = 0;
      if (discount && discount.discount_type) {
        const itemId = item.id || item.item_id;
        const isSelected =
          discount.discount_type === "multi_item"
            ? discount.selectedItems?.some((id) => Number(id) === Number(itemId))
            : true;
        itemDiscountMode = resolveItemDiscountMode(discount, item, isSelected);
        if (itemDiscountMode != null) {
          itemDiscountType = discount.discount_type;
          itemDiscountId = discount.discount_id || 0;
        }
      }

      // Calculate item-wise tax
      let itemTax = 0;
      let taxIds = [];

      if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0) {
        const totalTaxRate = item.taxes.reduce((taxSum, tax) => {
          const rate = parseFloat(tax.rate) || 0;
          return taxSum + rate;
        }, 0);

        // Calculate tax based on discount type
        const priceForTax =
          discount &&
            (discount.discount_type === "standard" ||
              discount.discount_type === "custom")
            ? originalPrice
            : finalPrice;

        const itemSubtotal = priceForTax * qty;
        itemTax = (itemSubtotal * totalTaxRate) / 100;
        taxIds = item.taxes.map((tax) => tax.id).filter((id) => id != null);
      }

      console.log(`--- USE_CART: Mapping Item ${item.id} ---`, { internalUnitType, apiUnitType });
      return {
        item_id: item.id || item.item_id,
        quantity: qty,
        unit_type: apiUnitType, // API format: CARTON, PACK, or PIECE
        is_pack: getIsPack(item.supports_pack, internalUnitType),
        original_amount: parseFloat(original_amount.toFixed(2)),
        discount_amount: parseFloat(discount_amount.toFixed(2)),
        discount_mode: itemDiscountMode,
        discount_type: itemDiscountType,
        discount_id: itemDiscountId,
        tax: parseFloat(itemTax.toFixed(2)),
        tax_ids: taxIds,
        final_amount: parseFloat(final_amount.toFixed(2)),
      };
    });
  }, [adjustedCartItems, discount, resolveItemDiscountMode]);

  /**
   * Build complete cart payload for add to cart API
   */
  const buildCartPayload = useCallback(
    (remark = "") => {
      // Calculate original subtotal (before discounts)
      const originalSubtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.sale_price || item.price || 0);
        const qty = item.quantity || 1;
        return sum + price * qty;
      }, 0);

      const discount_summary = buildDiscountSummary(originalSubtotal);
      const items = buildCartItems();

      // Ensure total_amount has a minimum value of 0 (clamp to 0 if negative)
      const finalTotalAmount = Math.max(0, parseFloat(grandTotal.toFixed(2)));

      return {
        sub_total: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total_amount: finalTotalAmount,
        discount_summary,
        remark,
        items,
      };
    },
    [cartItems, subtotal, tax, grandTotal, buildDiscountSummary, buildCartItems]
  );

  /**
   * Build discount data for hold cart API
   */
  const buildDiscountDataForHold = useCallback(() => {
    if (!discount || !discount.discount_type) return null;

    return {
      discount_type: discount.discount_type,
      discount_id: discount.discount_id || null,
      discount_value: discount.discount_value || 0,
      discount_mode: resolveDiscountModeForApi(discount),
      discount_amount: discountAmount || null,
      discount_calculation_type: discount.discount_calculation_type || null,
      selectedItems: discount.selectedItems || [],
    };
  }, [discount, discountAmount, resolveDiscountModeForApi]);

  // ==================== Helper Functions for Resume ====================

  /**
   * Map cart item from resume API response to addItem payload
   */
  const mapCartToAddItem = useCallback((cart) => {
    const hasItemDiscount =
      (cart.discount_amount != null && Number(cart.discount_amount) > 0) ||
      (cart.discount_mode &&
        !["STANDARD", "CUSTOM"].includes(
          String(cart.discount_mode || "").toUpperCase()
        ));

    // Convert API unit_type (CARTON, PACK, PIECE) to internal format (carton, pack, single)
    const apiToInternalUnitType = (apiType) => {
      const map = {
        'CARTON': 'carton',
        'PACK': 'pack',
        'PIECE': 'single',
      };
      return map[String(apiType || '').toUpperCase()] || 'single';
    };

    const internalUnitType = apiToInternalUnitType(cart.unit_type);

    return {
      sku: cart.sku,
      sale_price: cart.price ?? cart.original_amount / (cart.quantity || 1),
      type: cart.is_pack ? "pack" : "PIECE",
      pack: cart.is_pack ? "1 Pack" : "0 Pack",
      quantity: cart.quantity || 1,
      maxQuantity: (cart.quantity || 1) + 100,
      item_id: cart.item_id,
      id: cart.item_id,
      name: cart.item_name,
      cart_item_id: cart.cart_item_id,
      taxes: cart.tax_details || [],
      supports_pack: cart.is_pack,
      unit_type: internalUnitType, // Internal format: carton, pack, or single
      // Include stock info if available for cascading calculations
      carton_stock: cart.carton_stock,
      pack_stock: cart.pack_stock,
      single_stock: cart.single_stock,
      units_per_pack: cart.units_per_pack,
      packs_per_carton: cart.packs_per_carton,
      ...(hasItemDiscount && {
        item_discount_amount: Number(cart.discount_amount) || 0,
      }),
    };
  }, []);

  /**
   * Build discount info from resume API response
   */
  const buildDiscountInfoFromResume = useCallback((cartData) => {
    const ds = cartData?.discount_summary;
    if (!ds || (!ds.discount_type && !ds.discount_mode)) return null;

    // Handle swapped discount_mode/discount_type
    let discountType = null;
    let rawMode = null;
    if (
      ds.discount_mode &&
      ["STANDARD", "CUSTOM", "MULTI_ITEM"].includes(
        String(ds.discount_mode).toUpperCase()
      )
    ) {
      discountType = String(ds.discount_mode).toLowerCase();
      rawMode = ds.discount_type || null;
    } else if (
      ds.discount_type &&
      ["standard", "custom", "multi_item"].includes(
        String(ds.discount_type).toLowerCase()
      )
    ) {
      discountType = String(ds.discount_type).toLowerCase();
      rawMode = ds.discount_mode || null;
    } else {
      discountType = ds.discount_type || ds.discount_mode?.toLowerCase() || null;
      rawMode = ds.discount_mode || ds.discount_type || null;
    }

    const m = String(rawMode || "").toUpperCase();
    let discount_mode = null;
    let discount_calculation_type = ds.discount_calculation_type || null;

    if (discountType === "standard") {
      if (ds.discount_id) {
        discount_mode = "FAVOURITE";
        discount_calculation_type =
          discount_calculation_type ||
          (m === "AMOUNT" ? "AMOUNT" : "PERCENTAGE");
      } else {
        discount_mode =
          m === "AMOUNT"
            ? "AMOUNT"
            : m === "PERCENTAGE" || m === "PERCENT"
              ? "PERCENTAGE"
              : rawMode;
      }
    } else if (discountType === "custom") {
      discount_mode =
        m === "AMOUNT"
          ? "AMOUNT"
          : m === "PERCENTAGE" || m === "PERCENT"
            ? "PERCENTAGE"
            : rawMode;
    } else if (discountType === "multi_item") {
      if (ds.discount_id) {
        discount_mode = "FAVOURITE";
        discount_calculation_type =
          discount_calculation_type ||
          (m === "AMOUNT" ? "AMOUNT" : "PERCENTAGE");
      } else {
        discount_mode =
          m === "AMOUNT"
            ? "AMOUNT"
            : m === "PERCENTAGE" || m === "PERCENT"
              ? "PERCENTAGE"
              : rawMode;
      }
    }

    // Extract selectedItems for multi_item discounts
    let selectedItems = [];
    if (discountType === "multi_item" && Array.isArray(cartData?.items)) {
      selectedItems = cartData.items
        .filter(
          (it) =>
            (it.discount_amount != null && Number(it.discount_amount) > 0) ||
            (it.discount_mode &&
              !["STANDARD", "CUSTOM"].includes(
                String(it.discount_mode).toUpperCase()
              )) ||
            (it.discount_type &&
              !["STANDARD", "CUSTOM"].includes(
                String(it.discount_type || "").toUpperCase()
              ))
        )
        .map((it) => it.item_id);
    }

    const discount_amount = ds.discount_total ?? ds.discount_amount ?? null;
    let discount_value = ds.discount_value ?? 0;
    if (
      discountType === "multi_item" &&
      (discount_value == null || Number(discount_value) === 0) &&
      discount_amount != null &&
      Number(discount_amount) > 0
    ) {
      discount_value = Number(discount_amount);
    }

    return {
      discount_type: discountType,
      discount_id: ds.discount_id || null,
      discount_value,
      discount_mode,
      discount_calculation_type: discount_calculation_type || undefined,
      discount_amount,
      selectedItems,
    };
  }, []);

  // ==================== API Methods ====================

  /**
   * Add to cart or update existing cart
   * Returns cart_id if successful, null otherwise
   */
  const addToCart = useCallback(
    async (remark = "") => {
      try {
        // Check if cart already exists
        const existingCartId = cartItems.find((item) => item.cart_id)?.cart_id;
        if (existingCartId) {
          return existingCartId;
        }

        const formData = buildCartPayload(remark);
        console.log(formData, "formData===>");
        console.log("Discount state:", discount);

        const response = await addToCartItem(formData);
        if (response?.error) {
          openSnackbar(response.error, "error");
          return null;
        }

        const sources = response.data;
        if (sources?.cart_id) {
          dispatch(setCartMeta(sources));
          return sources.cart_id;
        } else {
          openSnackbar("Failed to create cart", "error");
          return null;
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        openSnackbar("Error adding to cart", "error");
        return null;
      }
    },
    [cartItems, buildCartPayload, discount, addToCartItem, dispatch, openSnackbar]
  );

  /**
   * Fetch held carts list
   */
  const fetchHeldCarts = useCallback(async () => {
    try {
      const res = await getCartList();
      if (res?.error) {
        openSnackbar(res.error, "error");
        return [];
      }
      dispatch(setBackendCarts(res.data));
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch held carts", err);
      openSnackbar("Failed to fetch held carts", "error");
      return [];
    }
  }, [getCartList, dispatch, openSnackbar]);

  /**
   * Hold cart
   */
  const holdCart = useCallback(
    async (remark = "") => {
      try {
        const cartId = await addToCart(remark);
        if (!cartId) return false;

        const discountData = buildDiscountDataForHold();
        const response = await holdCartMutation({
          cartId,
          remark,
          discount: discountData,
        });

        if (response?.error) {
          openSnackbar(response.error, "error");
          return false;
        }

        openSnackbar("Cart held successfully", "success");
        dispatch(clearCart());
        await fetchHeldCarts();
        return true;
      } catch (error) {
        console.error("Error holding cart:", error);
        openSnackbar("Error holding cart", "error");
        return false;
      }
    },
    [addToCart, buildDiscountDataForHold, holdCartMutation, dispatch, openSnackbar, fetchHeldCarts]
  );

  /**
   * Resume cart
   */
  const resumeCart = useCallback(
    async (cartId) => {
      try {
        const response = await resumeCartMutation({ cartId });
        if (response?.error) {
          openSnackbar(response.error, "error");
          return null;
        }

        const cartData = response?.data;
        if (!cartData?.items?.length) {
          openSnackbar("No items in cart to resume", "warning");
          return null;
        }

        // Clear current cart
        dispatch(clearCart());

        // Add each cart item
        const mappedItems = cartData.items.map((cart) => mapCartToAddItem(cart));
        mappedItems.forEach((item) => {
          dispatch(addItem(item));
        });

        // Set cart meta
        dispatch(
          setCartMeta({
            cart_id: cartData.cart_id,
            user_id: cartData.user_id,
            status: cartData.status,
            sub_total: cartData.sub_total,
            tax: cartData.tax,
            total_amount: cartData.total_amount,
            remark: cartData.remark,
            created_at: cartData.created_at,
            updated_at: cartData.updated_at,
            created_by: cartData.created_by,
            updated_by: cartData.updated_by,
          })
        );

        // Restore discount
        const discountInfo = buildDiscountInfoFromResume(cartData);
        dispatch(applyFinalDiscount(discountInfo));

        openSnackbar("Cart resumed successfully", "success");
        return cartData;
      } catch (error) {
        console.error("Error resuming cart:", error);
        openSnackbar("Error resuming cart", "error");
        return null;
      }
    },
    [resumeCartMutation, dispatch, openSnackbar, mapCartToAddItem, buildDiscountInfoFromResume]
  );

  /**
   * Void cart
   */
  const voidCart = useCallback(
    async (cartId) => {
      try {
        const response = await voidCartMutation({ cartId });
        if (response?.error) {
          openSnackbar(response.error, "error");
          return false;
        }

        openSnackbar("Cart voided successfully", "success");
        await fetchHeldCarts();
        return true;
      } catch (error) {
        console.error("Error voiding cart:", error);
        openSnackbar("Error voiding cart", "error");
        return false;
      }
    },
    [voidCartMutation, openSnackbar, fetchHeldCarts]
  );

  // ==================== Return Hook Interface ====================

  return {
    // State
    cart: {
      items: cartItems,
      discount,
      meta: cartMeta,
      adjustedItems: adjustedCartItems,
      subtotal,
      discountAmount,
      tax,
      surcharge,
      grandTotal,
    },
    // API Methods
    addToCart,
    holdCart,
    resumeCart,
    voidCart,
    fetchHeldCarts,
    // Utility methods (exposed if needed)
    buildCartPayload,
    buildDiscountDataForHold,
  };
};

export default useCart;
