import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { Delete, Add, Remove } from "@mui/icons-material";
import { DiscountType } from "constants/discount";
import { useSelector } from "react-redux";
import { useMemo } from "react";

// Unit type labels and colors
const unitTypeConfig = {
  carton: { label: "Carton", color: "#7c3aed", bgColor: "#ede9fe" },
  pack: { label: "Pack", color: "#2563eb", bgColor: "#dbeafe" },
  single: { label: "Single", color: "#16a34a", bgColor: "#dcfce7" },
};

// Helper to get cart item key
const getCartItemKey = (item) => {
  return item._cartKey || `${item.sku}_${item.unit_type || 'single'}`;
};

// Helper to calculate remaining stock for a product considering all cart items
const calculateMaxQuantityForItem = (item, allCartItems) => {
  const productId = item.id;
  const unitType = item.unit_type || 'single';
  
  // Base stock values (from original product data)
  const baseCartonStock = item.carton_stock || 0;
  const basePackStock = item.pack_stock || 0;
  const baseSingleStock = item.single_stock || 0;
  
  // Units info
  const unitsPerPack = item.units_per_pack || 1;
  const packsPerCarton = item.packs_per_carton || 1;
  
  // Get carted quantities for this product (excluding current item's quantity for calculation)
  const cartedCartons = allCartItems
    .filter(ci => ci.id === productId && ci.unit_type === 'carton')
    .reduce((sum, ci) => sum + (ci.quantity || 0), 0);
  
  const cartedPacks = allCartItems
    .filter(ci => ci.id === productId && ci.unit_type === 'pack')
    .reduce((sum, ci) => sum + (ci.quantity || 0), 0);
  
  const cartedSingles = allCartItems
    .filter(ci => ci.id === productId && ci.unit_type === 'single')
    .reduce((sum, ci) => sum + (ci.quantity || 0), 0);
  
  // Calculate remaining stock with cascading logic
  let remainingCartonStock = Math.max(0, baseCartonStock - cartedCartons);
  
  let remainingPackStock = basePackStock - cartedPacks;
  let singlesFromPacks = 0;
  if (cartedSingles > baseSingleStock) {
    const extraSinglesNeeded = cartedSingles - baseSingleStock;
    const packsOpened = Math.ceil(extraSinglesNeeded / unitsPerPack);
    remainingPackStock -= packsOpened;
    singlesFromPacks = packsOpened * unitsPerPack;
  }
  
  let packsFromCartons = 0;
  if (remainingPackStock < 0) {
    const cartonsOpenedForPacks = Math.ceil(Math.abs(remainingPackStock) / packsPerCarton);
    remainingCartonStock -= cartonsOpenedForPacks;
    packsFromCartons = cartonsOpenedForPacks * packsPerCarton;
    remainingPackStock += packsFromCartons;
  }
  remainingPackStock = Math.max(0, remainingPackStock);
  remainingCartonStock = Math.max(0, remainingCartonStock);
  
  let remainingSingleStock = baseSingleStock - cartedSingles + singlesFromPacks;
  remainingSingleStock = Math.max(0, remainingSingleStock);
  
  // Calculate max for this specific unit type
  switch (unitType) {
    case 'carton':
      // For cartons: current quantity in cart + remaining cartons available
      return cartedCartons + remainingCartonStock;
    case 'pack':
      // For packs: current quantity + remaining packs + packs from remaining cartons
      return cartedPacks + remainingPackStock + (remainingCartonStock * packsPerCarton);
    case 'single':
    default:
      // For singles: current quantity + remaining singles + singles from remaining packs/cartons
      return cartedSingles + remainingSingleStock + 
        (remainingPackStock * unitsPerPack) + 
        (remainingCartonStock * packsPerCarton * unitsPerPack);
  }
};

const CartTable = ({
  cartItems, // includes sale_price and sale_final_price
  incrementQuantity,
  decrementQuantity,
  removeItem,
  readOnly = false,
}) => {
  // Get all cart items from Redux for calculating cross-item stock limits
  const allCartItems = useSelector((state) => state.cart.items);
  
  return (
    <Box className="flex-1 overflow-auto bg-white">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: "#000", color: "white" }}>
              SKU
            </TableCell>
            <TableCell sx={{ backgroundColor: "#000", color: "white" }}>
              Name
            </TableCell>
            <TableCell sx={{ backgroundColor: "#000", color: "white" }}>
              Type
            </TableCell>
            <TableCell sx={{ backgroundColor: "#000", color: "white" }}>
              Unit Price
            </TableCell>
            <TableCell
              sx={{ backgroundColor: "#000", color: "white" }}
              align="center"
            >
              Qty
            </TableCell>
            <TableCell
              sx={{ backgroundColor: "#000", color: "white" }}
              align="right"
            >
              Tax
            </TableCell>
            <TableCell
              sx={{ backgroundColor: "#000", color: "white" }}
              align="right"
            >
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cartItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center"  sx={{ border: "none" }}>

                <Typography variant="body1" sx={{ py: 3, color: "gray" }}>
                  No cart data found. Please select item.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            cartItems.map((item) => {
              const { sale_price, sale_final_price, quantity } = item;

              // Check for discount and surcharge
              const hasSurcharge = item.surcharge_meta && sale_final_price > sale_price;
              const hasDiscount = !hasSurcharge && sale_final_price < sale_price;

              const perUnitDiscount = hasDiscount ? sale_price - sale_final_price : 0;
              const perUnitSurcharge = hasSurcharge ? sale_final_price - sale_price : 0;

              const totalOriginal = sale_price * quantity;
              const totalFinal = sale_final_price * quantity;
        
              // Calculate dynamic max quantity based on cascading stock logic
              const dynamicMaxQuantity = calculateMaxQuantityForItem(item, allCartItems);
              const maxQuantity = item.maxQuantity || item.available_quantity || dynamicMaxQuantity || Infinity;
              const effectiveMax = Math.min(maxQuantity, dynamicMaxQuantity || Infinity);
              const isMaxQuantityReached = quantity >= effectiveMax;
              
              // Get unit type info
              const unitType = item.unit_type || 'single';
              const unitConfig = unitTypeConfig[unitType] || unitTypeConfig.single;
              
              // Get cart key for this item
              const cartKey = getCartItemKey(item);
    
              // Calculate item-wise tax based on item's taxes array
              const calculateItemTax = () => {
                if (!item.taxes || !Array.isArray(item.taxes) || item.taxes.length === 0) {
                  return 0;
                }
                // Sum all tax rates
                const totalTaxRate = item.taxes.reduce((sum, tax) => {
                  const rate = parseFloat(tax.rate) || 0;
                  return sum + rate;
                }, 0);
                // Calculate tax per unit: sale_final_price * (totalTaxRate / 100)
                const taxPerUnit = (sale_final_price * totalTaxRate) / 100;
                // Total tax for the item: tax per unit * quantity
                return taxPerUnit * quantity;
              };

              const itemTax = calculateItemTax();
              // Calculate tax per unit for display
              const taxPerUnit = quantity > 0 ? itemTax / quantity : 0;
              // Total = (Unit Price + Tax per unit) * quantity
              const totalWithTax = (sale_final_price + taxPerUnit) * quantity;
              const totalOriginalWithTax = (sale_price + taxPerUnit) * quantity;
              return (
                <TableRow
                  key={cartKey}
                  hover
                  sx={{
                    backgroundColor: hasDiscount ? "#fef3c7" : hasSurcharge ? "#fee2e2" : "transparent",
                    borderLeft: hasDiscount ? "4px solid #f59e0b" : hasSurcharge ? "4px solid #dc2626" : "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {/* SKU */}
                  <TableCell>{item.sku}</TableCell>

                  {/* Name with discount/surcharge info */}
                  <TableCell>
                    <Box display="flex" flexDirection="column">
                      <Typography variant="body1" fontWeight={500}>
                        {item.name}{item.type ? ` - ${item.type}` : ''}
                      </Typography>

                      {hasDiscount && item.discount_meta && (
                        <Typography
                          variant="caption"
                          color="green"
                          sx={{ fontWeight: 600, mt: 0.5 }}
                        >
                          {item.discount_meta.discount_mode ===
                            DiscountType.PERCENTAGE
                            ? `${item.discount_meta.discount_value || 0}% off`
                            : `$${(item.discount_meta.discount_value || 0).toFixed(2)} off`}
                        </Typography>
                      )}

                      {hasSurcharge && item.surcharge_meta && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ fontWeight: 600, mt: 0.5 }}
                        >
                          {item.surcharge_meta.surcharge_mode === "PERCENTAGE" ||
                            item.surcharge_meta.surcharge_mode === "percentage"
                            ? `${item.surcharge_meta.surcharge_value || 0}% surcharge`
                            : `$${(item.surcharge_meta.surcharge_value || 0).toFixed(2)} surcharge`}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Unit Type */}
                  <TableCell>
                    <Tooltip 
                      title={
                        unitType === 'carton' 
                          ? `${item.packs_per_carton || '?'} packs per carton` 
                          : unitType === 'pack' 
                            ? `${item.units_per_pack || '?'} units per pack`
                            : 'Single unit'
                      }
                      arrow
                    >
                      <Chip
                        label={unitConfig.label}
                        size="small"
                        sx={{
                          backgroundColor: unitConfig.bgColor,
                          color: unitConfig.color,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: "22px",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell>
                    <Typography variant="body2">
                      ${sale_price.toFixed(2)}
                    </Typography>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell align="center">
                    {readOnly ? (
                      <Typography>{quantity}</Typography>
                    ) : (
                      <Box className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => decrementQuantity(cartKey)}
                          size="small"
                          sx={{ minWidth: 32, color: "red" }}
                        >
                          <Remove />
                        </Button>
                        <Tooltip 
                          title={isMaxQuantityReached ? "Maximum stock reached" : `Max: ${effectiveMax}`}
                          arrow
                        >
                          <Box sx={{ fontWeight: 600 }}>{item.quantity}</Box>
                        </Tooltip>
                        <Button
                          onClick={() => incrementQuantity(cartKey)}
                          size="small"
                          disabled={isMaxQuantityReached}
                          sx={{
                            minWidth: 32,
                            color: isMaxQuantityReached ? "gray" : "green",
                            "&.Mui-disabled": {
                              color: "gray",
                              opacity: 0.5,
                            },
                          }}
                        >
                          <Add />
                        </Button>
                        <Button
                          onClick={() => removeItem(cartKey)}
                          size="small"
                          sx={{ minWidth: 32, color: "orange" }}
                        >
                          <Delete />
                        </Button>
                      </Box>
                    )}
                  </TableCell>

                  {/* Tax */}
                  <TableCell align="right">
                    <Box display="flex" flexDirection="column">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${itemTax.toFixed(2)}
                      </Typography>
                      {item.taxes && item.taxes.length > 0 && (
                        <Typography variant="caption" sx={{ color: "gray", fontSize: "0.7rem" }}>
                          {item.taxes.map((tax, idx) => (
                            <span key={tax.id || idx}>
                              {tax.name || `Tax ${idx + 1}`} ({tax.rate}%)
                              {idx < item.taxes.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Total = (Unit Price + Tax per unit) * qty */}
                  <TableCell align="right">
                    {hasDiscount ? (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "gray",
                            fontSize: "0.9rem",
                          }}
                        >
                          ${totalOriginalWithTax.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "green", fontWeight: 600 }}
                        >
                          ${totalWithTax.toFixed(2)}
                        </Typography>
                      </Box>
                    ) : hasSurcharge ? (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "gray",
                            fontSize: "0.9rem",
                          }}
                        >
                          ${totalOriginalWithTax.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#dc2626", fontWeight: 600 }}
                        >
                          ${totalWithTax.toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        ${totalWithTax.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default CartTable;
