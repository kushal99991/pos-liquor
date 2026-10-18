import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import ActionBar from "./components/ActionBar";
import SearchBar from "./components/SearchBar";
import CartTable from "./components/CartTable";
import CartTotals from "./components/CartTotals";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import PaymentButtons from "./components/PaymentButtons";
import { useLazyGetItemsQuery } from "services/itemSlice";
import { useGetCateogriesListQuery } from "services/categorySlice";

import { useDispatch, useSelector } from "react-redux";
import {
  addItem,
  incrementQuantity,
  decrementQuantity,
  removeItem,
  clearCart,
  setSelectedCustomer,
  clearSelectedCustomer,
} from "store/slice/cart.slice";
import { useCartCalculations, shouldRequireAgeVerification } from "utils/helperFunctions/common";
import CheckoutDialog from "./components/CheckoutDialog";
import { useCreateOrderMutation } from "services/orderSlice";
import PrintReceiptModal from "../re-print/components/PrintReceiptModal";
import ErrorDialog from "components/elements/ErrorDialog/ErrorDialog";
import AgeCheckDialog from "./components/actions/AgeCheckDialog";
import CustomerSelectionModal from "./components/actions/CustomerSelectionModal";
import SelectedCustomerDisplay from "./components/SelectedCustomerDisplay";
import useSnackbar from "hooks/useSnackbar";
import { mockLiquorProducts } from "mocks/liquorInventory";

const CashRegister = () => {
  const [getItems] = useLazyGetItemsQuery();
  const { data: categories = [] } = useGetCateogriesListQuery();
  const [mockProducts, setProductList] = useState(mockLiquorProducts);
  const [cashPaid, setCashPaid] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("top_sell");
  const [searchUPC, setSearchUPC] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [isAgeCheckOpen, setIsAgeCheckOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const previousCategoryRef = useRef(null);

  const dispatch = useDispatch();
  const { openSnackbar } = useSnackbar();
  const carts = useSelector((state) => state.cart.items);
  const discount = useSelector((state) => state.cart.discount);
  const surchargeState = useSelector((state) => state.cart.surcharge);
  const customer = useSelector((state) => state.cart.customer);
  const user = useSelector((state) => state.auth.user);
  const storeConfig = useSelector(
    (state) => state.pos.installation.storeConfig
  );
  const [createOrder] = useCreateOrderMutation();
  const {
    adjustedCartItems: cartItems,
    subtotal,
    discountAmount,
    tax,
    surcharge,
    grandTotal,
  } = useCartCalculations(carts, discount, storeConfig, surchargeState);

  // Function to play beep sound
  const playBeep = useCallback((frequency = 800, duration = 200, type = "success") => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for success and error
      oscillator.frequency.value = type === "success" ? 800 : 400;
      oscillator.type = "sine";

      // Volume envelope
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Audio playback not supported:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    const response = await getItems();
    if (response?.error) {
      setProductList(mockLiquorProducts);
      return false;
    }
    const sources = response?.data;
    const items = Array.isArray(sources)
      ? sources
      : sources?.data || sources?.items || mockLiquorProducts;

    setProductList(items && items.length > 0 ? items : mockLiquorProducts);
    return true;
  }, [getItems]);

  useEffect(() => {
    onRefresh();
  }, []);

  // Check if top_sell data exists (products with sell_count > 0)
  const hasTopSellData = useMemo(() => {
    return mockProducts.some((product) => (product.sell_count || 0) > 0);
  }, [mockProducts]);

  // Clear selected category when searching, restore when search is cleared
  useEffect(() => {
    const hasSearchTerm = searchItem && searchItem.trim() !== "";
    if (hasSearchTerm) {
      // Store the current category before clearing it (only if not already stored)
      if (selectedCategory && !previousCategoryRef.current) {
        previousCategoryRef.current = selectedCategory;
      }
      // Clear the selected category to show all items
      if (selectedCategory) {
        setSelectedCategory(null);
      }
    } else {
      // Restore the previous category when search is cleared
      if (previousCategoryRef.current) {
        setSelectedCategory(previousCategoryRef.current);
        previousCategoryRef.current = null;
      } else if (!selectedCategory && categories?.length > 0) {
        // If no previous category was stored, set default
        if (hasTopSellData) {
          setSelectedCategory("top_sell");
        } else {
          setSelectedCategory(categories[0].id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchItem]);

  // Set default category when categories are loaded (only when not searching)
  useEffect(() => {
    if (categories?.length > 0 && !searchItem?.trim() && !previousCategoryRef.current) {
      // If top_sell is selected but no data exists, switch to first category
      if (selectedCategory === "top_sell" && !hasTopSellData) {
        setSelectedCategory(categories[0].id);
      }
      // If no category is selected and top_sell has no data, select first category
      else if (!selectedCategory && !hasTopSellData) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [categories, hasTopSellData, selectedCategory, searchItem]);

  // Handle UPC/Barcode scanning
  useEffect(() => {
    if (searchUPC && searchUPC.trim() !== "") {
      const upcValue = searchUPC.trim();

      // Find product by UPC/barcode - check main upc field and upcs array
      const product = mockProducts.find((p) => {
        // Check main UPC field
        if (p.upc === upcValue || p.upc?.toString() === upcValue) {
          return true;
        }
        // Check upcs array if it exists
        if (p.upcs && Array.isArray(p.upcs)) {
          return p.upcs.some(
            (upc) => upc?.upc === upcValue || upc?.upc?.toString() === upcValue
          );
        }
        return false;
      });

      if (product) {
        // Check stock availability using new structure
        // Barcode scanning defaults to adding single units
        const singleStock = product.single_stock || 0;
        const totalQuantity = product.total_quantity || product.available_quantity || singleStock;
        
        if (singleStock > 0 || totalQuantity > 0) {
          // Add as single unit when scanned
          const singlePrice = Number(product.sale_price) || 0;
          dispatch(addItem({
            ...product,
            unit_type: 'single',
            sale_price: singlePrice,
            maxQuantity: singleStock > 0 ? singleStock : totalQuantity,
            available_quantity: singleStock > 0 ? singleStock : totalQuantity,
          }));
          openSnackbar(`Added ${product.name} (Single) to cart`, "success");
          // Play success beep
          playBeep(800, 200, "success");
        } else {
          openSnackbar(`${product.name} is out of stock`, "error");
          // Play error beep for out of stock
          playBeep(400, 300, "error");
        }
        // Clear UPC search after processing
        setSearchUPC("");
      } else {
        openSnackbar("Product not found with this UPC/Barcode", "error");
        // Play error beep for not found
        playBeep(400, 300, "error");
        // Clear UPC search after showing error
        setSearchUPC("");
      }
    }
  }, [searchUPC, mockProducts, dispatch, openSnackbar, playBeep]);

  const categoryWiseProduct = useMemo(() => {
    let filteredProducts = [];

    // If there's a search term, search across ALL items regardless of category
    if (searchItem && searchItem.trim() !== "") {
      const searchTerm = searchItem.trim().toLowerCase();
      filteredProducts = mockProducts.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const sku = (product.sku || "").toLowerCase();
        const distributor = (product.distributor || product.brand?.name || "").toLowerCase();

        return name.includes(searchTerm) ||
          sku.includes(searchTerm) ||
          distributor.includes(searchTerm);
      });
    } else {
      // Filter by category or top sell only when there's no search term
      if (!selectedCategory) {
        // If no category is selected, show all products
        filteredProducts = [...mockProducts];
      } else if (selectedCategory === "top_sell") {
        // Filter and sort by sell_count in descending order
        filteredProducts = [...mockProducts]
          .filter((product) => (product.sell_count || 0) > 0)
          .sort((a, b) => (b.sell_count || 0) - (a.sell_count || 0));
      } else {
        filteredProducts = mockProducts.filter((a) => a.category_id === selectedCategory);
      }
    }

    return filteredProducts;
  }, [selectedCategory, mockProducts, searchItem]);


  const handleAddToCart = (product) => {
    dispatch(addItem(product));
  };

  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };
  const handleCloseCheckout = () => {
    setIsOpen(false);
  };

  const handleCheckout = () => {
    // Check if age verification is required
    const ageVerificationRequired = shouldRequireAgeVerification(cartItems, customer, user);

    if (ageVerificationRequired) {
      // Open age check dialog first
      setIsAgeCheckOpen(true);
      setPendingCheckout(true);
    } else {
      // Directly open checkout dialog
      setIsOpen(true);
    }
  };

  const handleAgeCheckClose = () => {
    setIsAgeCheckOpen(false);

    // If age verification was completed and checkout was pending, open checkout dialog
    if (pendingCheckout && customer?.isVerified) {
      setPendingCheckout(false);
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setIsOpen(true);
      }, 0);
    } else if (!customer?.isVerified) {
      // Reset pending checkout if user closes without verifying
      setPendingCheckout(false);
    }
  };

  const onPayment = async (selectedMethod, paymentAmount = null, tipAmount = 0) => {
    try {
      const amount = paymentAmount !== null
        ? paymentAmount
        : selectedMethod === "cash"
          ? cashPaid
          : parseFloat(grandTotal.toFixed(2));

      // Build discount payload based on discount type
      const discountPayload = discount && discount.discount_type ? {
        discount_type: discount.discount_type, // 'standard', 'custom', or 'multi_item'
        discount_mode: discount.discount_mode || null, // 'percentage' or 'amount'
        discount_value: discount.discount_value || 0,
        ...(discount.discount_type === 'standard' && discount.discount_id && {
          discount_id: discount.discount_id,
        }),
        ...(discount.discount_type === 'multi_item' && discount.selectedItems && {
          selected_items: discount.selectedItems, // Array of item IDs
        }),
      } : null;

      const payload = {
        items: cartItems.map((item) => {
          // Get unit type from cart item and convert to API format (uppercase)
          const internalUnitType = String(item.unit_type || 'single').toLowerCase();
          console.log(`--- PAGE_JS: Mapping Item ${item.id} ---`, { internalUnitType, original: item.unit_type });
          // Map internal names to API names: single -> PIECE, pack -> PACK, carton -> CARTON
          const unitTypeMap = {
            'single': 'PIECE',
            'pack': 'PACK',
            'carton': 'CARTON',
            'piece': 'PIECE',
          };
          const apiUnitType = unitTypeMap[internalUnitType] || 'PIECE';
          console.log(`--- PAGE_JS: Result for ${item.id} ---`, { apiUnitType });
          
          // Determine is_pack for backward compatibility
          const isPack = internalUnitType === 'pack' || internalUnitType === 'carton' || item.isPack || false;
          
          // Calculate amounts
          const unitPrice = item.sale_price || 0;
          const originalAmount = parseFloat((item.quantity * unitPrice).toFixed(2));
          const finalUnitPrice = item.sale_final_price || unitPrice;
          const totalAmount = parseFloat((item.quantity * finalUnitPrice).toFixed(2));
          const itemDiscountAmount = parseFloat((originalAmount - totalAmount).toFixed(2));
          
          return {
            item_id: item.id,
            quantity: item.quantity,
            unit_type: apiUnitType, // API format: CARTON, PACK, or PIECE
            // is_pack: isPack,
            discount_id: item.discount_id || 0,
            discount_amount: itemDiscountAmount,
            total_amount: totalAmount,
          };
        }),
        payment_method: selectedMethod,
        total_amount: parseFloat(grandTotal.toFixed(2)),
        amount: amount,
        coupon_discount: discountAmount,
        ...(discountPayload && discountPayload),
        additional_info: customer?.note || "",
        customer_id: customer?.id || null,
        tips: tipAmount,
        tax,
        surcharge,
        subtotal,
        cash_drawer_id: user?.drawer_id || null,
      };

      console.log("--- FINAL API PAYLOAD ---", JSON.stringify(payload, null, 2));
      const response = await createOrder(payload);
      setIsOpen(false);
      setIsOpen(false);

      if (!response || response?.error) {
        // Show error dialog
        setErrorDialogMessage(
          response?.error || "Failed to create order. Please try again."
        );
        setErrorDialogOpen(true);
        return false;
      }
      const sources = response.data;
      // ✅ Build transaction object for receipt modal
      const transaction = {
        barcode: sources.order?.id?.toString() || "UNKNOWN-ORDER-ID",
        date: sources.order?.order_date ?? new Date().toLocaleString(),
        salesDate: sources.payment?.date ?? new Date().toLocaleString(),
        items: (sources.items || []).map((item) => ({
          name: item.name,
          qty: item.quantity,
          price: (item.total_amount || item.amount || 0).toFixed(2),
        })),
        subtotal: cartItems.reduce(
          (sum, item) => sum + item.sale_price * item.quantity,
          0
        ),

        discount: sources.order?.discount_value ?? 0,
        tax: tax,
        surcharge: surcharge,
        total: sources.payment?.amount ?? 0,
        paymentType: sources.payment?.method ?? 'Cash',
        // Prioritize customer details from API response, fall back to local customer state
        customer: sources.customer ? {
          id: sources.customer.id ?? null,
          name: sources.customer.name ?? 'N/A',
          email: sources.customer.email ?? 'N/A',
          phone: sources.customer.phone ?? 'N/A',
          points: sources.customer.points ?? '0',
        } : customer ? {
          id: customer.id ?? null,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.name || 'N/A',
          email: customer.email || 'N/A',
          phone: customer.phone_number || customer.phone || 'N/A',
          points: customer.points || '0',
        } : {
          id: null,
          name: 'N/A',
          email: 'N/A',
          phone: 'N/A',
          points: '0',
        },
      };
      dispatch(clearCart());
      setTransactionData(transaction);
      setIsReceiptOpen(true);

      // Refresh product list to update stock quantities
      await onRefresh();

      // Optional: reset cart, navigate, or show success toast
    } catch (error) {
      console.error("Payment failed:", error);
      // Optional: show error toast or message to user
    }
  };

  const handleSelectCustomer = (customer) => {
    dispatch(setSelectedCustomer(customer));
  };

  const handleClearCustomer = () => {
    dispatch(clearSelectedCustomer());
  };

  const addCash = (amount) => {
    setCashPaid((prev) => parseFloat((prev + amount).toFixed(2)));
  };

  const payExactAmount = () => {
    setCashPaid(parseFloat(grandTotal.toFixed(2)));
  };

  return (
    <Box className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Box className="flex flex-1 overflow-hidden">
        {/* Left Side */}
        <Box className="w-full md:w-[45%] lg:w-[40%] bg-white flex flex-col border-r-4 border-blue-500 overflow-hidden">
          <Box className="flex-none">
            <SearchBar
              searchUPC={searchUPC}
              searchItem={searchItem}
              setSearchUPC={setSearchUPC}
              setSearchItem={setSearchItem}
              onSelectCustomer={() => setIsCustomerModalOpen(true)}
            />
          </Box>

          <Box className="flex-1 overflow-auto">
            <CartTable
              cartItems={cartItems}
              incrementQuantity={handleIncrement}
              decrementQuantity={handleDecrement}
              removeItem={handleRemove}
            />
          </Box>

          <Box className="flex-none">
            <SelectedCustomerDisplay
              customer={customer}
              onClear={handleClearCustomer}
            />
            <CartTotals
              cartItems={cartItems}
              subtotal={subtotal}
              discount={discountAmount}
              tax={tax}
              surcharge={surcharge}
              grandTotal={grandTotal}
              customer={customer}
              user={user}
              onCheckout={handleCheckout}
            />
          </Box>
        </Box>

        {/* Right Side */}
        <Box className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
          <Box className="flex-none">
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              hasTopSellData={hasTopSellData}
            />
          </Box>

          <Box className="flex-1 overflow-auto">
            <ProductGrid
              products={categoryWiseProduct}
              addToCart={handleAddToCart}
            />
          </Box>

          <Box className="flex-none">
            <PaymentButtons
              addCash={addCash}
              payExactAmount={payExactAmount}
              grandTotal={grandTotal}
            />
          </Box>
        </Box>
      </Box>

      <Box className="flex-none">
        <ActionBar onRefreshItems={onRefresh} />
      </Box>
      <CheckoutDialog
        isOpen={isOpen}
        onClose={handleCloseCheckout}
        cartItems={cartItems}
        subtotal={subtotal}
        discount={discountAmount}
        tax={tax}
        surcharge={surcharge}
        tips={0}
        grandTotal={grandTotal}
        onPayment={onPayment}
        cashPaid={cashPaid}
        addCash={addCash}
        incrementQuantity={handleIncrement}
        decrementQuantity={handleDecrement}
        removeItem={handleRemove}
      />
      <PrintReceiptModal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={transactionData}
      />
      <ErrorDialog
        open={errorDialogOpen}
        message={errorDialogMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
      <AgeCheckDialog
        open={isAgeCheckOpen}
        onClose={handleAgeCheckClose}
      />
      <CustomerSelectionModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </Box>
  );
};

export default CashRegister;
