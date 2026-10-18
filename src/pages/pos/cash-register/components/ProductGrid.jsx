import { Box, Button, Typography, Stack, Chip, Tooltip } from "@mui/material";
import { Package, Layers, ShieldAlert, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo } from "react";

const ProductGrid = ({ products, addToCart }) => {
  // Get cart items from Redux to calculate remaining availability
  const cartItems = useSelector((state) => state.cart.items);
  
  // Helper to get stock status color
  const getStockColor = (stock, maxStock) => {
    if (stock <= 0) return { bg: "#ffebee", text: "#c62828", border: "#ef9a9a" };
    if (stock < 5 || stock < maxStock * 0.2) return { bg: "#fff3e0", text: "#e65100", border: "#ffb74d" };
    return { bg: "#e8f5e9", text: "#2e7d32", border: "#81c784" };
  };

  // Calculate remaining stock for a product considering cart items
  const calculateRemainingStock = (product) => {
    const productId = product.id;
    
    // Base stock values
    const baseCartonStock = product.carton_stock || 0;
    const basePackStock = product.pack_stock || 0;
    const baseSingleStock = product.single_stock || 0;
    
    // Units info
    const unitsPerPack = product.units_per_pack || 1;
    const packsPerCarton = product.packs_per_carton || 1;
    
    // Get carted quantities for this product
    const cartedCartons = cartItems
      .filter(item => item.id === productId && item.unit_type === 'carton')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    const cartedPacks = cartItems
      .filter(item => item.id === productId && item.unit_type === 'pack')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    const cartedSingles = cartItems
      .filter(item => item.id === productId && item.unit_type === 'single')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Calculate remaining stock with cascading logic
    // Step 1: Cartons remaining (direct carton stock minus carted)
    let remainingCartonStock = Math.max(0, baseCartonStock - cartedCartons);
    
    // Step 2: Packs remaining
    // Start with base pack stock minus carted packs
    let remainingPackStock = basePackStock - cartedPacks;
    // If singles in cart exceed single_stock, packs get "opened"
    let singlesFromPacks = 0;
    if (cartedSingles > baseSingleStock) {
      const extraSinglesNeeded = cartedSingles - baseSingleStock;
      const packsOpened = Math.ceil(extraSinglesNeeded / unitsPerPack);
      remainingPackStock -= packsOpened;
      singlesFromPacks = packsOpened * unitsPerPack;
    }
    // If pack stock goes negative, cartons get "opened" for packs
    let packsFromCartons = 0;
    if (remainingPackStock < 0) {
      const cartonsOpenedForPacks = Math.ceil(Math.abs(remainingPackStock) / packsPerCarton);
      remainingCartonStock -= cartonsOpenedForPacks;
      packsFromCartons = cartonsOpenedForPacks * packsPerCarton;
      remainingPackStock += packsFromCartons;
    }
    remainingPackStock = Math.max(0, remainingPackStock);
    remainingCartonStock = Math.max(0, remainingCartonStock);
    
    // Step 3: Singles remaining  
    // Start with base single stock minus carted singles, plus singles from opened packs
    let remainingSingleStock = baseSingleStock - cartedSingles + singlesFromPacks;
    remainingSingleStock = Math.max(0, remainingSingleStock);
    
    // Calculate max available for each unit type (for adding more to cart)
    // This considers what could be "opened" from above hierarchy
    
    // Max singles: remaining singles + (remaining packs × units_per_pack) + (remaining cartons × packs × units)
    const maxSinglesAvailable = remainingSingleStock + 
      (remainingPackStock * unitsPerPack) + 
      (remainingCartonStock * packsPerCarton * unitsPerPack);
    
    // Max packs: remaining packs + (remaining cartons × packs_per_carton)
    const maxPacksAvailable = remainingPackStock + (remainingCartonStock * packsPerCarton);
    
    // Max cartons: just remaining cartons
    const maxCartonsAvailable = remainingCartonStock;
    
    return {
      remainingCartonStock,
      remainingPackStock,
      remainingSingleStock,
      maxCartonsAvailable,
      maxPacksAvailable,
      maxSinglesAvailable,
      cartedCartons,
      cartedPacks,
      cartedSingles,
    };
  };

  return (
    <Box className="flex-1 overflow-auto p-5">
      <Box className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => {
          const hasAgeRestriction = product.age_check === true;
          
          // Calculate remaining stock considering cart
          const stockInfo = calculateRemainingStock(product);
          const {
            remainingCartonStock,
            remainingPackStock,
            remainingSingleStock,
            maxCartonsAvailable,
            maxPacksAvailable,
            maxSinglesAvailable,
            cartedCartons,
            cartedPacks,
            cartedSingles,
          } = stockInfo;
          
          // Base stock values for display
          const baseCartonStock = product.carton_stock || 0;
          const basePackStock = product.pack_stock || 0;
          const baseSingleStock = product.single_stock || 0;
          
          // Check if pack/carton are supported
          const supportsPack = product.supports_pack === true;
          const supportsCarton = product.is_carton_supported === true;
          
          // Prices for each unit type - use sale_price for single/piece items
          const singlePrice = Number(product.sale_price) || 0;
          const packPrice = Number(product.pack_price) || 0;
          const cartonPrice = Number(product.carton_price) || 0;
          
          // Units info
          const unitsPerPack = product.units_per_pack || 1;
          const packsPerCarton = product.packs_per_carton || 1;
          
          // Calculate total available quantity (for backward compatibility and overall stock check)
          const totalQuantity = product.total_quantity || product.available_quantity || 
            (baseCartonStock * packsPerCarton * unitsPerPack) + (basePackStock * unitsPerPack) + baseSingleStock;
          
          const isOutOfStock = totalQuantity <= 0 || 
            (maxSinglesAvailable <= 0 && maxPacksAvailable <= 0 && maxCartonsAvailable <= 0);
          
          // Check availability for each button (can we add more of this type?)
          const canAddSingle = maxSinglesAvailable > 0;
          const canAddPack = supportsPack && maxPacksAvailable > 0;
          const canAddCarton = supportsCarton && maxCartonsAvailable > 0;
          
          // Handler to add item with specific unit type
          const handleAddToCart = (unitType, e) => {
            e.stopPropagation();
            
            let price, maxQty;
            switch (unitType) {
              case 'carton':
                if (!canAddCarton) return;
                price = cartonPrice;
                maxQty = maxCartonsAvailable;
                break;
              case 'pack':
                if (!canAddPack) return;
                price = packPrice;
                maxQty = maxPacksAvailable;
                break;
              case 'single':
              default:
                if (!canAddSingle) return;
                price = singlePrice;
                maxQty = maxSinglesAvailable;
                break;
            }
            
            addToCart({
              ...product,
              unit_type: unitType,
              sale_price: price,
              maxQuantity: maxQty,
              available_quantity: maxQty,
              units_per_pack: unitsPerPack,
              packs_per_carton: packsPerCarton,
            });
          };
          
          return (
            <Box
              key={product.id}
              sx={{
                position: "relative",
                cursor: isOutOfStock ? "not-allowed" : "default",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: isOutOfStock ? "#f5f5f5" : "white",
                p: 2,
                transition: "all 0.3s ease",
                border: isOutOfStock 
                  ? "1px solid #e0e0e0" 
                  : "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                opacity: isOutOfStock ? 0.6 : 1,
                "&:hover": isOutOfStock ? {} : {
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                  borderColor: "#ddd",
                },
              }}
            >
              <Box>
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      label="OUT OF STOCK"
                      sx={{
                        backgroundColor: "#d32f2f",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: "32px",
                        marginBottom: "6px",
                      }}
                    />
                  </Box>
                )}
                
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: isOutOfStock ? "#999" : "#111",
                    lineHeight: 1.3,
                    marginBottom: "6px",
                    minHeight: "2.6em",
                  }}
                >
                  {product.name}
                </Typography>
                
                {/* Age Restriction Badge */}
                {hasAgeRestriction && (
                  <Box className="flex gap-1.5 mb-1.5">
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 inset-ring inset-ring-red-600/10">
                      18+
                    </span>
                  </Box>
                )}
                
                {/* Stock Breakdown Display - Shows base stock and remaining */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "#666",
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Stock (Available)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {/* Carton Stock */}
                    {supportsCarton && (
                      <Tooltip 
                        title={`${remainingCartonStock}/${baseCartonStock} Cartons available (${packsPerCarton} packs each)${cartedCartons > 0 ? ` • ${cartedCartons} in cart` : ''}`} 
                        arrow
                      >
                        <Chip
                          label={`${remainingCartonStock}C`}
                          size="small"
                          sx={{
                            ...getStockColor(remainingCartonStock, baseCartonStock),
                            backgroundColor: getStockColor(remainingCartonStock, baseCartonStock).bg,
                            color: getStockColor(remainingCartonStock, baseCartonStock).text,
                            borderColor: getStockColor(remainingCartonStock, baseCartonStock).border,
                            border: "1px solid",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: "22px",
                            minWidth: "40px",
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* Pack Stock */}
                    {supportsPack && (
                      <Tooltip 
                        title={`${remainingPackStock}/${basePackStock} Packs available (${unitsPerPack} units each)${cartedPacks > 0 ? ` • ${cartedPacks} in cart` : ''}`} 
                        arrow
                      >
                        <Chip
                          label={`${remainingPackStock}P`}
                          size="small"
                          sx={{
                            ...getStockColor(remainingPackStock, basePackStock),
                            backgroundColor: getStockColor(remainingPackStock, basePackStock).bg,
                            color: getStockColor(remainingPackStock, basePackStock).text,
                            borderColor: getStockColor(remainingPackStock, basePackStock).border,
                            border: "1px solid",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: "22px",
                            minWidth: "40px",
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* Single Stock */}
                    <Tooltip 
                      title={`${remainingSingleStock}/${baseSingleStock} Singles available${cartedSingles > 0 ? ` • ${cartedSingles} in cart` : ''}`} 
                      arrow
                    >
                      <Chip
                        label={`${remainingSingleStock}S`}
                        size="small"
                        sx={{
                          ...getStockColor(remainingSingleStock, baseSingleStock),
                          backgroundColor: getStockColor(remainingSingleStock, baseSingleStock).bg,
                          color: getStockColor(remainingSingleStock, baseSingleStock).text,
                          borderColor: getStockColor(remainingSingleStock, baseSingleStock).border,
                          border: "1px solid",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: "22px",
                          minWidth: "40px",
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              
              {/* Add to Cart Buttons - Separated by Unit Type */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {/* Carton Button */}
                {supportsCarton && (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!canAddCarton}
                    onClick={(e) => handleAddToCart('carton', e)}
                    sx={{
                      backgroundColor: canAddCarton ? "#7c3aed" : "#e0e0e0",
                      color: canAddCarton ? "white" : "#999",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      py: 0.5,
                      px: 1,
                      minHeight: "28px",
                      textTransform: "none",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      "&:hover": {
                        backgroundColor: canAddCarton ? "#6d28d9" : "#e0e0e0",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                        color: "#bdbdbd",
                      },
                    }}
                  >
                    <span>Carton ({packsPerCarton}P)</span>
                    <span>${cartonPrice.toFixed(2)}</span>
                  </Button>
                )}
                
                {/* Pack Button */}
                {supportsPack && (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!canAddPack}
                    onClick={(e) => handleAddToCart('pack', e)}
                    sx={{
                      backgroundColor: canAddPack ? "#2563eb" : "#e0e0e0",
                      color: canAddPack ? "white" : "#999",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      py: 0.5,
                      px: 1,
                      minHeight: "28px",
                      textTransform: "none",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      "&:hover": {
                        backgroundColor: canAddPack ? "#1d4ed8" : "#e0e0e0",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                        color: "#bdbdbd",
                      },
                    }}
                  >
                    <span>Pack ({unitsPerPack})</span>
                    <span>${packPrice.toFixed(2)}</span>
                  </Button>
                )}
                
                {/* Single Button */}
                <Button
                  variant="contained"
                  size="small"
                  disabled={!canAddSingle}
                  onClick={(e) => handleAddToCart('single', e)}
                  sx={{
                    backgroundColor: canAddSingle ? "#16a34a" : "#e0e0e0",
                    color: canAddSingle ? "white" : "#999",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    py: 0.5,
                    px: 1,
                    minHeight: "28px",
                    textTransform: "none",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    "&:hover": {
                      backgroundColor: canAddSingle ? "#15803d" : "#e0e0e0",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#f5f5f5",
                      color: "#bdbdbd",
                    },
                  }}
                >
                  <span>Single</span>
                  <span>${singlePrice.toFixed(2)}</span>
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductGrid;
