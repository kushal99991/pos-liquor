import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Button, Checkbox,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { X, Minus, Plus, Scan } from 'lucide-react';
import { useLazyGetItemsQuery, useLazyGetItemQuery } from 'services/itemSlice';
import { useLazyGetItemTaxesQuery } from 'services/taxSlice';
import { useDispatch } from 'react-redux';
import { addItem } from 'store/slice/cart.slice';
import BarcodeScannerDialog from './BarcodeScannerDialog';

export default function PriceCheckDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const [upc, setUpc] = useState('');
  const [sku, setSku] = useState('');
  const [itemName, setItemName] = useState('');
  const [size, setSize] = useState('');
  const [pack, setPack] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [qoh, setQoh] = useState('');
  const [surcharge, setSurcharge] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [appliedPromotion, setAppliedPromotion] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [itemTaxes, setItemTaxes] = useState([]);
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef(null);
  const searchTimeout = useRef(null);

  const [getItems, { isFetching: isSearching }] = useLazyGetItemsQuery();
  const [getItem] = useLazyGetItemQuery();
  const [getItemTaxes] = useLazyGetItemTaxesQuery();

  useEffect(() => {
    if (!open || scannerOpen) return;

    const handleKeyPress = (e) => {
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if (e.key === 'Enter' && barcodeBuffer.current.length > 0) {
        const barcode = barcodeBuffer.current;
        barcodeBuffer.current = '';
        handleBarcodeSearch(barcode);
      } else if (e.key.length === 1 && /[0-9]/.test(e.key)) {
        barcodeBuffer.current += e.key;

        if (barcodeTimeout.current) {
          clearTimeout(barcodeTimeout.current);
        }

        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [open, scannerOpen]);

  const normalizeItemsResponse = useCallback((rawData) => {
    return Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.results)
      ? rawData.results
      : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
      ? rawData.data
      : rawData && typeof rawData === "object"
      ? [rawData]
      : [];
  }, []);

  const handleItemNameChange = async (value) => {
    setItemName(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length >= 2) {
      // Debounce API call
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await getItem({ 
            name: value 
          });
          
          if (response?.error) {
            setFilteredProducts([]);
            setShowSuggestions(false);
            return;
          }

          const items = normalizeItemsResponse(response?.data);
          setFilteredProducts(items);
          setShowSuggestions(items.length > 0);
        } catch (error) {
          setFilteredProducts([]);
          setShowSuggestions(false);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setFilteredProducts([]);
    }
  };

  // gift list item eye cold, mani cure, 

  // Used when user chooses an item from the name suggestions dropdown
  const handleProductSelect = (product) => {
    // Only set name and close suggestions; full form fill is done via Lookup
    setSelectedProduct(product);
    setItemName(product.item_name || product.name || '');
    setShowSuggestions(false);
  };

  // Helper to fetch item-specific taxes when we have a confirmed item
  const fetchItemTaxes = useCallback(
    async (itemId) => {
      if (!itemId) {
        setItemTaxes([]);
        return;
      }
      try {
        const response = await getItemTaxes(itemId);
        if (response?.error) {
          setItemTaxes([]);
          return;
        }
        setItemTaxes(response?.data ?? []);
      } catch {
        setItemTaxes([]);
      }
    },
    [getItemTaxes]
  );

  // Used when we have a confirmed item from Lookup / barcode search
  const applyLookupResult = async (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setUpc(product.upc || product.upc_code || '');
    setSku(product.sku || product.sku_code || '');
    setItemName(product.item_name || product.name || '');
    setSize(product.size || '');
    setPack(product.pack || product.units_pack || '');
    setUnitCost(product.unit_cost || product.cost || 0);
    setRetailPrice(product.retail_price || product.price || 0);
    setSalePrice(product.sale_price || 0);
    setQoh(
      product.qoh ||
        product.quantity_on_hand ||
        product.stock ||
        product.available_quantity ||
        product.total_quantity ||
        0
    );
    setSurcharge(product.surcharge || 0);
    setShowSuggestions(false);
    await fetchItemTaxes(product.id);
  };

  const handleReset = () => {
    setUpc('');
    setSku('');
    setItemName('');
    setSize('');
    setPack('');
    setUnitCost('');
    setRetailPrice('');
    setSalePrice('');
    setQoh('');
    setSurcharge('');
    setQuantity(1);
    setAppliedPromotion(false);
    setSelectedProduct(null);
    setShowSuggestions(false);
    setItemTaxes([]);
  };

  const handleLookup = async () => {
    try {
      const params = {};

      if (upc) {
        params.upc = upc;
        params.upc_code = upc;
      }

      if (sku) {
        params.sku = sku;
        params.sku_code = sku;
      }

      if (itemName) {
        params.name = itemName;
      }

      // Nothing to look up
      if (Object.keys(params).length === 0) {
        return;
      }

      const response = await getItem(params);
      if (response?.error) {
        return;
      }

      const items = normalizeItemsResponse(response?.data);
      if (items.length > 0) {
        await applyLookupResult(items[0]);
      }
    } catch (error) {
      console.error("Error looking up product:", error);
    }
  };

  const handleBarcodeSearch = async (code) => {
    try {
      const response = await getItems({ upc: code, upc_code: code });
      if (response?.error) {
        return;
      }
      const items = normalizeItemsResponse(response?.data);
      if (items.length > 0) {
        await applyLookupResult(items[0]);
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
    }
  };

  const handleScanComplete = (code) => {
    setUpc(code);
    handleBarcodeSearch(code);
  };

  const handleAddToCartClick = () => {
    if (!selectedProduct) return;

    const basePrice =
      parseFloat(
        selectedProduct.sale_price ??
          selectedProduct.retail_price ??
          retailPrice ??
          0
      ) || 0;

    const productForCart = {
      ...selectedProduct,
      sku: selectedProduct.sku || sku,
      name: selectedProduct.name || selectedProduct.item_name || itemName,
      sale_price: basePrice,
    };

    const qty = Math.max(1, Number(quantity) || 1);
    for (let i = 0; i < qty; i += 1) {
      dispatch(addItem(productForCart));
    }
    onClose();
  };

  // Build computed tax rows (TAX / PER (%) / AMOUNT) from backend itemTaxes
  const computedTaxes = useMemo(() => {
    if (!selectedProduct || !itemTaxes.length) return [];

    // Use sale price if available, otherwise use retail price
    const price = parseFloat(salePrice) || parseFloat(retailPrice) || 0;
    const subtotal = price * quantity;

    return itemTaxes.map((row) => {
      const rate = row?.tax?.rate ?? 0;
      const label = row?.tax?.name || 'TAX';
      const amount = (subtotal * rate) / 100;

      return {
        label,
        rate,
        amount,
      };
    });
  }, [selectedProduct, itemTaxes, retailPrice, salePrice, quantity]);

  // Total tax from all computed rows
  const totalTax = computedTaxes.reduce((sum, tax) => sum + tax.amount, 0);

  const calculatePriceWithTax = () => {
    // Use sale price if available, otherwise use retail price
    const price = parseFloat(salePrice) || parseFloat(retailPrice) || 0;
    return (price * quantity).toFixed(2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: '8px',
          backgroundColor: '#f3f4f6',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#f3f4f6',
          color: '#9b2c2c',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: 'none',
        }}
      >
        <span className="text-2xl font-semibold text-[#9b2c2c]">Price-Check</span>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: '16px',
            color: 'white',
            backgroundColor: '#9b2c2c',
            width: '40px',
            height: '40px',
            '&:hover': {
              backgroundColor: '#7f1d1d',
            },
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px', backgroundColor: '#f3f4f6' }}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                UPC
              </label>
              <span className="text-gray-600">:</span>
              <div className="relative flex-1">
                <KeyboardTextField
                  fullWidth
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  placeholder="UPC"
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        sx={{ color: '#9b2c2c' }}
                        onClick={() => setScannerOpen(true)}
                      >
                        <Scan size={20} />
                      </IconButton>
                    ),
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                SKU
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                fullWidth
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                ITEM NAME
              </label>
              <span className="text-gray-600">:</span>
              <div className="relative flex-1">
                <KeyboardTextField
                  fullWidth
                  value={itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  placeholder="Item Name / Distributor Code"
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                    },
                  }}
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-50 max-h-48 overflow-y-auto">
                    {isSearching && (
                      <div className="px-3 py-2 text-sm text-gray-600 text-center">
                        Searching...
                      </div>
                    )}
                    {!isSearching && filteredProducts.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-600 text-center">
                        No items found
                      </div>
                    )}
                    {!isSearching && filteredProducts.map((product) => (
                      <div
                        key={product.id || product.item_id}
                        onClick={() => handleProductSelect(product)}
                        className="px-3 py-2 cursor-pointer bg-[#9b2c2c] text-white text-sm font-medium hover:bg-[#7f1d1d] border-b border-white/20 last:border-b-0"
                      >
                        {product.item_name || product.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Button
                onClick={handleReset}
                variant="contained"
                sx={{
                  backgroundColor: '#9b2c2c',
                  color: 'white',
                  padding: '8px 32px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#7f1d1d',
                  },
                }}
              >
                RESET
              </Button>
              <Button
                onClick={handleLookup}
                variant="contained"
                sx={{
                  backgroundColor: '#9b2c2c',
                  color: 'white',
                  padding: '8px 32px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#7f1d1d',
                  },
                }}
              >
                LOOK-UP
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                SIZE
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                fullWidth
                value={size}
                onChange={(e) => setSize(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                UNIT COST
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                fullWidth
                value={typeof unitCost === 'number' ? unitCost.toFixed(2) : unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                QOH
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                fullWidth
                value={qoh.toString()}
                onChange={(e) => setQoh(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                RETAIL PRICE
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                fullWidth
                value={typeof retailPrice === 'number' ? retailPrice.toFixed(2) : retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-3 col-span-2">
              <label className="min-w-[100px] font-semibold text-gray-800 text-sm">
                PACK
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                value={pack}
                onChange={(e) => setPack(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  width: '200px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
              <label className="ml-8 min-w-[100px] font-semibold text-gray-800 text-sm">
                SURCHARGE
              </label>
              <span className="text-gray-600">:</span>
              <KeyboardTextField
                value={typeof surcharge === 'number' ? surcharge.toFixed(2) : surcharge}
                onChange={(e) => setSurcharge(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  width: '200px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mt-2">
            <div className="bg-white border border-gray-300 rounded-lg p-5">
              <div className="grid grid-cols-3 gap-3 mb-4 pb-3 border-b border-gray-200">
                <span className="font-semibold text-[#9b2c2c] text-xs uppercase">TAX</span>
                <span className="font-semibold text-[#9b2c2c] text-xs uppercase">PER (%)</span>
                <span className="font-semibold text-[#9b2c2c] text-xs uppercase">AMOUNT</span>
              </div>
              <div className="min-h-24 max-h-32 overflow-y-auto">
                {selectedProduct ? (
                  computedTaxes.length > 0 ? (
                    computedTaxes.map((tax, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-sm text-gray-700">
                          {tax.label}
                        </span>
                        <span className="text-sm text-gray-700">
                          {tax.rate.toFixed(2)}%
                        </span>
                        <span className="text-sm text-gray-700">
                          $
                          {tax.amount.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-500">
                      No tax information available
                    </div>
                  )
                ) : (
                  <div className="py-4 text-center text-sm text-gray-400">
                    Select an item to view tax details
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-sm">TOTAL TAX</span>
                <span className="font-bold text-gray-900 text-sm">$ {totalTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-3 mb-4 pb-3 border-b border-gray-200">
                <span className="font-semibold text-[#9b2c2c] text-xs uppercase">QTY</span>
                <span className="font-semibold text-[#9b2c2c] text-xs uppercase">PRICE</span>
              </div>
              <div className="min-h-24 max-h-32 overflow-y-auto">
                {selectedProduct ? (
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <span className="text-sm text-gray-700">{quantity.toString().padStart(2, '0')}</span>
                    <span className="text-sm text-gray-700">${(parseFloat(salePrice) || parseFloat(retailPrice) || 0).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-400">
                    Select an item to view quantity and price
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                  QUANTITY
                </span>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{
                    backgroundColor: '#9b2c2c',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    '&:hover': {
                      backgroundColor: '#7f1d1d',
                    },
                  }}
                >
                  <Minus size={18} />
                </IconButton>
                <span className="min-w-[40px] text-center font-semibold text-base">
                  {quantity.toString().padStart(2, '0')}
                </span>
                <IconButton
                  onClick={() => setQuantity(quantity + 1)}
                  sx={{
                    backgroundColor: '#9b2c2c',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    '&:hover': {
                      backgroundColor: '#7f1d1d',
                    },
                  }}
                >
                  <Plus size={18} />
                </IconButton>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={appliedPromotion}
                  onChange={(e) => setAppliedPromotion(e.target.checked)}
                  sx={{
                    padding: '4px',
                    color: '#9b2c2c',
                    '&.Mui-checked': {
                      color: '#9b2c2c',
                    },
                  }}
                />
                <span className="font-semibold text-gray-800 text-xs uppercase whitespace-nowrap">
                  APPLIED PROMOTION
                </span>
              </div>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#9b2c2c',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  marginTop: '8px',
                  '&:hover': {
                    backgroundColor: '#7f1d1d',
                  },
                }}
              >
                PRICE LEVEL
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <div className="bg-[#9b2c2c] text-white rounded px-8 py-4 text-center">
              <div className="text-xs mb-1 opacity-90 uppercase">SALES PRICE W/TAX</div>
              <div className="text-2xl font-bold">${calculatePriceWithTax()}</div>
            </div>

            <Button
              variant="contained"
              onClick={handleAddToCartClick}
              sx={{
                backgroundColor: '#000000',
                color: 'white',
                padding: '16px 56px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#1f2937',
                },
              }}
            >
              ADD TO CART
            </Button>
          </div>
        </div>
      </DialogContent>

      <BarcodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanComplete}
      />
    </Dialog>
  );
}
