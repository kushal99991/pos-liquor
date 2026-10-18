import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartMeta: null,
  items: [],
  cartItems: [],
  discount: {
    discount_type: null, // 'standard', 'custom', 'multi_item'
    discount_id: null,
    discount_value: 0,
    selectedItems: [],
  },
  customer: {
    // Age verification fields
    isVerified: false,
    age: null,
    birthDate: null,
    verifiedAt: null,
    // Customer details
    id: null,
    phone_number: null,
    email: null,
    first_name: null,
    last_name: null,
    date_of_birth: null,
    points: null,
    loyalty_tier: null,
    note: null,
  },
  surcharge: {
    type: null, // 'PERCENTAGE' or 'AMOUNT'
    value: 0,
    amount: 0, // Calculated dollar amount
    selectedItems: [],
    mode: null,
  },
};

// Helper function to determine isPack based on pack field or unit_type
const getIsPack = (pack, unitType) => {
  // If unit_type is explicitly set, use that
  if (unitType === 'pack') return true;
  if (unitType === 'carton') return true; // Cartons are also considered "pack" type for backend compatibility
  if (unitType === 'single') return false;

  // Fallback to old logic for backward compatibility
  if (!pack) return false;
  // Extract number from pack string (e.g., "0 Pack", "1 Pack", "4 Pack")
  const match = pack.toString().match(/\d+/);
  if (!match) return false;
  const packNumber = parseInt(match[0], 10);
  // If pack is "0 Pack", return false, otherwise return true
  return packNumber !== 0;
};

// Helper to generate a unique cart key for an item based on SKU and unit type
const getCartItemKey = (product) => {
  const unitType = product.unit_type || 'single';
  return `${product.sku}_${unitType}`;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const product = action.payload;

      // Determine unit type (single/pack/carton)
      const unitType = product.unit_type || 'single';
      console.log('--- CART_SLICE: Adding Item ---', { sku: product.sku, unitType, incoming: product.unit_type });
      const cartItemKey = getCartItemKey(product);

      let packQuantity = 1;
      if (product.type?.toLowerCase() === "pack" && product.pack) {
        const match = product.pack.match(/\d+/);
        packQuantity = match ? parseInt(match[0], 10) : 1;
      }

      const basePrice = parseFloat(product.sale_price) || 0;
      const maxQuantity = product.maxQuantity || product.available_quantity || Infinity;
      const isPack = getIsPack(product.pack, unitType);

      // Support quantity when resuming cart (product.quantity > 1)
      const qty = typeof product.quantity === "number" && product.quantity >= 1 ? product.quantity : 1;

      // Find existing item by cart key (SKU + unit_type)
      const existingItem = state.items.find((item) => getCartItemKey(item) === cartItemKey);

      if (existingItem) {
        // Check if we can add more items
        const newQuantity = existingItem.quantity + qty;
        if (newQuantity > maxQuantity) {
          // Don't add if it exceeds available quantity
          return;
        }
        let newPrice =
          product.type?.toLowerCase() === "pack"
            ? ((newQuantity / packQuantity) * basePrice).toFixed(2)
            : (basePrice * newQuantity).toFixed(2);

        existingItem.quantity = newQuantity;
        existingItem.price = parseFloat(newPrice);
        existingItem.isPack = isPack;
        existingItem.unit_type = unitType;
        // Update maxQuantity if it changed
        if (product.maxQuantity !== undefined) {
          existingItem.maxQuantity = product.maxQuantity;
          existingItem.available_quantity = product.available_quantity;
        }
      } else {
        // Check if product is available
        if (maxQuantity <= 0) {
          // Don't add out of stock items
          return;
        }
        state.items.push({
          ...product,
          quantity: qty,
          price: parseFloat((basePrice * qty).toFixed(2)),
          maxQuantity: maxQuantity,
          isPack: isPack,
          unit_type: unitType,
          // Store a unique cart key for this item
          _cartKey: cartItemKey,
        });
      }
    },
    incrementQuantity: (state, action) => {
      // Support both old format (just sku) and new format (sku_unitType)
      const key = action.payload;
      const item = state.items.find((i) => {
        const itemKey = i._cartKey || `${i.sku}_${i.unit_type || 'single'}`;
        return itemKey === key || i.sku === key;
      });
      if (item) {
        const maxQuantity = item.maxQuantity || item.available_quantity || Infinity;
        if (item.quantity < maxQuantity) {
          item.quantity += 1;
        }
      }
    },
    decrementQuantity: (state, action) => {
      const key = action.payload;
      const item = state.items.find((i) => {
        const itemKey = i._cartKey || `${i.sku}_${i.unit_type || 'single'}`;
        return itemKey === key || i.sku === key;
      });
      if (item) item.quantity = Math.max(1, item.quantity - 1);
    },
    removeItem: (state, action) => {
      const key = action.payload;
      state.items = state.items.filter((i) => {
        const itemKey = i._cartKey || `${i.sku}_${i.unit_type || 'single'}`;
        return itemKey !== key && i.sku !== key;
      });
      // When all items removed, clear cart_id (cartMeta) and discount
      if (state.items.length === 0) {
        state.cartMeta = null;
        state.discount = {
          discount_type: null,
          discount_id: null,
          discount_value: 0,
          selectedItems: [],
        };
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.cartMeta = null;
      state.discount = {
        discount_type: null,
        discount_id: null,
        discount_value: 0,
        discount_mode: null,
        discount_amount: null,
        selectedItems: [],
      };
      state.customer = {
        // Age verification fields
        isVerified: false,
        age: null,
        birthDate: null,
        verifiedAt: null,
        // Customer details
        id: null,
        phone_number: null,
        email: null,
        first_name: null,
        last_name: null,
        date_of_birth: null,
        points: null,
        loyalty_tier: null,
        note: null,
      };
      state.surcharge = {
        type: null,
        value: 0,
        amount: 0,
        selectedItems: [],
        mode: null,
      };
    },
    applyDiscount: (state, action) => {
      /**
       * action.payload = {
       *   type: 'standard' | 'custom' | 'multi_item',
       *   value: number,
       *   method: 'percentage' | 'amount'
       * }
       */
      state.discount = action.payload;
    },
    applyMultiItemDiscount: (state, action) => {
      const { skus, discountAmount, meta, discount } = action.payload;

      if (!skus || skus.length === 0) {
        // 🧹 If no items selected, remove discount keys from all items
        state.items = state.items.map((item) => {
          const newItem = { ...item };
          delete newItem.discount;
          delete newItem.discount_meta;
          delete newItem.item_discount_amount; // Clear per-item discount from resume
          return newItem;
        });
        state.discount = null;
        return;
      }

      // 🧮 Calculate total of selected items (skus now contains item IDs)
      const totalPrice = state.items
        .filter((item) => {
          const itemId = item.id || item.item_id;
          return skus.some(selectedId => Number(selectedId) === Number(itemId));
        })
        .reduce((sum, item) => sum + item.sale_price, 0);

      // Clear cart_id: discount change means cart is out of sync with backend
      state.cartMeta = null;

      // 🧩 Apply discount only to selected items
      state.items = state.items.map((item) => {
        const itemId = item.id || item.item_id;
        const isSelected = skus.some(selectedId => Number(selectedId) === Number(itemId));
        if (isSelected) {
          const itemProportion = item.sale_price / totalPrice;
          const itemDiscount = discountAmount * itemProportion;

          const updatedItem = { ...item };
          delete updatedItem.item_discount_amount; // Clear old per-item discount from resume
          delete updatedItem.cart_id; // Clear cart_id from items
          return {
            ...updatedItem,
            discount: itemDiscount,
            discount_meta: meta,
          };
        } else {
          // ❌ Remove discount keys from non-selected items
          const newItem = { ...item };
          delete newItem.discount;
          delete newItem.discount_meta;
          delete newItem.item_discount_amount; // Clear per-item discount from resume
          delete newItem.cart_id; // Clear cart_id from items
          return newItem;
        }
      });
      state.discount = discount;
    },
    applyFinalDiscount: (state, action) => {
      const discountDetails = action.payload;

      // ✅ Reset any existing discount data (clear discount_meta and item_discount_amount from resume)
      state.items = state.items.map((item) => {
        const newItem = { ...item };
        delete newItem.discount;
        delete newItem.discount_meta;
        delete newItem.item_discount_amount; // Clear per-item discount from resume so new discount applies
        return newItem;
      });

      // Clear cart_id: discount change means cart is out of sync with backend
      state.cartMeta = null;
      state.items = state.items.map((item) => {
        const { cart_id, ...rest } = item;
        return rest;
      });

      // If no discount details provided, clear the discount
      if (!discountDetails) {
        state.discount = {
          discount_type: null,
          discount_id: null,
          discount_value: 0,
          selectedItems: [],
        };
        return;
      }

      console.log(discountDetails, "discountDetails");

      // 🧮 Apply discount based on type
      if (discountDetails.discount_type === "multi_item") {
        const { selectedItems, discount_amount } = discountDetails;
        const totalPrice = state.items
          .filter((item) => {
            const itemId = item.id || item.item_id;
            return selectedItems.some(selectedId => Number(selectedId) === Number(itemId));
          })
          .reduce((sum, item) => sum + item.sale_price, 0);

        state.items = state.items.map((item) => {
          const itemId = item.id || item.item_id;
          const isSelected = selectedItems.some(selectedId => Number(selectedId) === Number(itemId));
          if (isSelected) {
            const itemProportion = item.sale_price / totalPrice;
            const itemDiscount = discount_amount * itemProportion;

            const updatedItem = { ...item };
            delete updatedItem.item_discount_amount; // Clear old per-item discount from resume
            return {
              ...updatedItem,
              discount: itemDiscount,
              discount_meta: discountDetails,
            };
          }
          const newItem = { ...item };
          delete newItem.discount;
          delete newItem.discount_meta;
          delete newItem.item_discount_amount; // Clear per-item discount from resume
          return newItem;
        });
      }

      // 🧾 Store discount globally
      state.discount = discountDetails;
    },
    setAgeVerifiedCustomer: (state, action) => {
      const { age, birthDate, isVerified } = action.payload;

      state.customer = {
        ...state.customer,
        isVerified: isVerified,
        age,
        birthDate,
        verifiedAt: new Date().toISOString(),
      };
    },
    setSelectedCustomer: (state, action) => {
      const customer = action.payload;
      state.customer = {
        ...state.customer,
        id: customer.id,
        phone_number: customer.phone_number,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        date_of_birth: customer.date_of_birth,
        points: customer.points,
        loyalty_tier: customer.loyalty_tier,
        note: customer.note || null,
      };
    },
    clearSelectedCustomer: (state) => {
      state.customer = {
        ...state.customer,
        id: null,
        phone_number: null,
        email: null,
        first_name: null,
        last_name: null,
        date_of_birth: null,
        points: null,
        loyalty_tier: null,
        note: null,
      };
    },
    setSurcharge: (state, action) => {
      const { type, value, amount, selectedItems, mode } = action.payload;
      state.surcharge = {
        type,
        value: parseFloat(value) || 0,
        amount: parseFloat(amount) || 0,
        selectedItems: selectedItems || [],
        mode: mode || null, // Store the calculation mode (PERCENTAGE/AMOUNT) especially for multi_item
      };
    },
    setCartMeta: (state, action) => {
      const cartMeta = action.payload;
      state.cartMeta = cartMeta;
      state.items = state.items.map((item) => ({
        ...item,
        cart_id: cartMeta.cart_id, // 👈 Attach cart_id to each item
      }));
    },
    setBackendCarts: (state, action) => {
      state.cartItems = action.payload || [];
    },
    resumeCart: (state, action) => {
      const cartData = action.payload;

      if (!cartData || !cartData.items || cartData.items.length === 0) return;

      // 🧹 Clear current cart
      state.items = [];
      state.cartMeta = {
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
      };

      // 🧾 Extract and normalize discount info FIRST (before restoring items)
      let discountInfo = null;
      if (cartData.discount_summary && (cartData.discount_summary.discount_type || cartData.discount_summary.discount_mode)) {
        const discountSummary = cartData.discount_summary;

        // API returns swapped fields: discount_mode contains type (standard/custom/multi_item) and discount_type contains mode (PERCENTAGE/AMOUNT)
        let discountType = null;
        let discountMode = null;

        // Check if fields are swapped (API format)
        if (discountSummary.discount_mode &&
          (discountSummary.discount_mode === "STANDARD" ||
            discountSummary.discount_mode === "CUSTOM" ||
            discountSummary.discount_mode.toLowerCase() === "standard" ||
            discountSummary.discount_mode.toLowerCase() === "custom" ||
            discountSummary.discount_mode.toLowerCase() === "multi_item")) {
          // Fields are swapped: discount_mode is actually the type
          discountType = discountSummary.discount_mode.toLowerCase();
          discountMode = discountSummary.discount_type || null;
        } else if (discountSummary.discount_type &&
          (discountSummary.discount_type === "standard" ||
            discountSummary.discount_type === "custom" ||
            discountSummary.discount_type === "multi_item")) {
          // Fields are in correct order
          discountType = discountSummary.discount_type;
          discountMode = discountSummary.discount_mode || null;
        } else {
          // Fallback: try to determine from context
          discountType = discountSummary.discount_type || discountSummary.discount_mode?.toLowerCase() || null;
          discountMode = discountSummary.discount_mode || discountSummary.discount_type || null;
        }

        // Normalize discount_mode to match DiscountType constants (PERCENTAGE or AMOUNT)
        let normalizedDiscountMode = null;
        if (discountMode) {
          const mode = discountMode.toString().toUpperCase();
          if (mode === "PERCENTAGE" || mode === "PERCENT") {
            normalizedDiscountMode = "PERCENTAGE";
          } else if (mode === "AMOUNT" || mode === "FLAT") {
            normalizedDiscountMode = "AMOUNT";
          } else {
            normalizedDiscountMode = discountMode;
          }
        }

        // For multi_item discounts, identify selected items
        let selectedItems = [];
        if (discountType === "multi_item") {
          selectedItems = cartData.items
            .filter((item) => {
              const itemHasDiscount = (item.discount_mode && item.discount_mode !== "STANDARD" && item.discount_mode !== "CUSTOM") ||
                (item.discount_type && item.discount_type !== "STANDARD" && item.discount_type !== "CUSTOM");
              return itemHasDiscount;
            })
            .map((item) => item.item_id);
        }

        // Calculate discount_amount - use discount_total from API as it's the actual applied discount
        const discountAmount = discountSummary.discount_total || discountSummary.discount_amount || null;

        discountInfo = {
          discount_type: discountType,
          discount_id: discountSummary.discount_id || null,
          discount_value: discountSummary.discount_value || 0,
          discount_mode: normalizedDiscountMode,
          discount_amount: discountAmount,
          selectedItems: selectedItems,
        };
      }

      // 🛒 Rebuild items from held cart - restore only original prices
      // Let useCartCalculations recalculate everything based on discount
      cartData.items.forEach((cartItem) => {
        if (!cartItem) return;

        // Calculate unit price from original_amount and quantity
        const itemQuantity = cartItem.quantity || 1;
        const originalAmount = parseFloat(cartItem.original_amount || 0);
        const unitPrice = itemQuantity > 0 ? originalAmount / itemQuantity : 0;

        const itemExists = state.items.find((i) => (i.item_id || i.id) === cartItem.item_id);
        const isPack = cartItem.is_pack || false;

        if (itemExists) {
          // If item already exists, just increment quantity
          const newQuantity = itemExists.quantity + itemQuantity;
          itemExists.quantity = newQuantity;
          // Update price based on new quantity
          itemExists.price = parseFloat((unitPrice * newQuantity).toFixed(2));
          itemExists.isPack = isPack;
          // Update sale_price (useCartCalculations will set sale_final_price)
          itemExists.sale_price = unitPrice;
          // Restore/update taxes if available (needed for tax calculations)
          if (cartItem.taxes && Array.isArray(cartItem.taxes) && cartItem.taxes.length > 0) {
            itemExists.taxes = cartItem.taxes;
          } else if (cartItem.tax_ids && Array.isArray(cartItem.tax_ids) && cartItem.tax_ids.length > 0) {
            // If only tax_ids are provided, create tax objects from tax_ids
            itemExists.taxes = cartItem.tax_ids.map((taxId) => ({
              id: taxId,
            }));
          }
        } else {
          // Restore taxes from API response
          // API may provide taxes array or tax_ids array with tax amount
          let itemTaxes = [];
          if (cartItem.taxes && Array.isArray(cartItem.taxes) && cartItem.taxes.length > 0) {
            // If taxes array is provided, use it directly
            itemTaxes = cartItem.taxes;
          } else if (cartItem.tax_ids && Array.isArray(cartItem.tax_ids) && cartItem.tax_ids.length > 0) {
            // If only tax_ids are provided, create tax objects from tax_ids
            // Note: We'll need tax rate information, which might need to be fetched
            // For now, create minimal tax objects with IDs
            itemTaxes = cartItem.tax_ids.map((taxId) => ({
              id: taxId,
              // If tax amount is provided, we can calculate rate, but we need the base amount
              // For now, just store the ID - tax calculation will need full tax details
            }));
          }

          // Add fresh item with data from cartItem
          // Only restore original prices - useCartCalculations will handle discount calculations
          state.items.push({
            // Core identifiers
            cart_item_id: cartItem.cart_item_id,
            item_id: cartItem.item_id,
            id: cartItem.item_id, // Also set id for compatibility
            sku: cartItem.sku || `ITEM-${cartItem.item_id}`, // Fallback if sku not available
            name: cartItem.item_name || cartItem.name || `Item ${cartItem.item_id}`,

            // Pricing - restore only original price
            // useCartCalculations will calculate sale_final_price based on discount
            sale_price: unitPrice, // Original unit price
            price: parseFloat((unitPrice * itemQuantity).toFixed(2)), // Total original price for this quantity

            // Quantity and pack info
            quantity: itemQuantity,
            is_pack: cartItem.is_pack || false,
            isPack: isPack,
            cart_id: cartData.cart_id,

            // Restore taxes if available (needed for tax calculations)
            // Taxes should be in format: [{ id: 1, name: "TAX1", rate: 6.25 }, ...]
            taxes: itemTaxes,
          });
        }
      });

      // 🧾 Restore discount state
      // useCartCalculations will handle all discount calculations and set discount_meta on items
      if (discountInfo) {
        state.discount = discountInfo;
      } else if (cartData.discount && cartData.discount.discount_type) {
        // Fallback: check for discount in old format
        // Normalize discount_mode to match DiscountType constants
        let normalizedDiscountMode = null;
        if (cartData.discount.discount_mode) {
          const mode = cartData.discount.discount_mode.toString().toUpperCase();
          if (mode === "PERCENTAGE" || mode === "PERCENT") {
            normalizedDiscountMode = "PERCENTAGE";
          } else if (mode === "AMOUNT" || mode === "FLAT") {
            normalizedDiscountMode = "AMOUNT";
          } else {
            normalizedDiscountMode = cartData.discount.discount_mode;
          }
        }

        state.discount = {
          discount_type: cartData.discount.discount_type || null,
          discount_id: cartData.discount.discount_id || null,
          discount_value: cartData.discount.discount_value || 0,
          discount_mode: normalizedDiscountMode,
          discount_amount: cartData.discount.discount_amount || null,
          selectedItems: cartData.discount.selectedItems || [],
        };
      } else {
        // Reset discount if not present
        state.discount = {
          discount_type: null,
          discount_id: null,
          discount_value: 0,
          discount_mode: null,
          discount_amount: null,
          selectedItems: [],
        };
      }

      // Reset customer state
      state.customer = {
        // Age verification fields
        isVerified: false,
        age: null,
        birthDate: null,
        verifiedAt: null,
        // Customer details
        id: null,
        phone_number: null,
        email: null,
        first_name: null,
        last_name: null,
        date_of_birth: null,
        points: null,
        loyalty_tier: null,
        note: null,
      };
    },
  },
});

export const {
  addItem,
  incrementQuantity,
  decrementQuantity,
  removeItem,
  clearCart,
  applyDiscount,
  applyMultiItemDiscount,
  applyFinalDiscount,
  setAgeVerifiedCustomer,
  setSelectedCustomer,
  clearSelectedCustomer,
  setCartMeta,
  setBackendCarts,
  resumeCart,
  setSurcharge,
} = cartSlice.actions;

export default cartSlice.reducer;
