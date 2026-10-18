import { Box, Button } from "@mui/material";
import { shouldRequireAgeVerification } from "utils/helperFunctions/common";

const CartTotals = ({
  cartItems,
  subtotal,
  discount,
  discount_text = "",
  tax,
  surcharge,
  grandTotal,
  customer,
  onCheckout,
  user = null, // Add user prop
}) => {
  const ageVerificationRequired = shouldRequireAgeVerification(
    cartItems,
    customer,
    user
  );

  return (
    <Box className="bg-gray-200 shadow-lg">
      {ageVerificationRequired && (
        <Box
          sx={{
            color: "#fef2f2",
            backgroundColor: "#df1f1f",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            px: 1.5,
            py: 0.5,
          }}
        >
          Age verification required for some items.
        </Box>
      )}
      <Box className="flex items-stretch h-36 md:h-40">
        {/* Items Count */}
        <Box className="flex flex-col items-center justify-center bg-gray-300 text-black w-32 md:w-36 border-gray-400">
          <Box className="text-5xl font-bold">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </Box>
          <Box className="text-base font-semibold mt-2">Items</Box>
        </Box>

        {/* Breakdown */}
        <Box className="flex flex-col justify-center bg-gray-200 text-black px-6 space-y-2 min-w-[260px]">
          <Box className="flex justify-between items-center gap-4 text-base">
            <span className="font-bold w-[45%]">SubTotal</span>
            <span className="font-bold text-center w-[10%]">:</span>
            <span className="font-bold text-red-900 w-[45%]">
              ${Number(subtotal).toFixed(2)}
            </span>
          </Box>
          <Box className="flex justify-between items-center gap-4 text-base">
            <span className="font-bold w-[45%]">Discount {discount_text}</span>
            <span className="font-bold text-center w-[10%]">:</span>
            <span className="font-bold text-red-900 w-[45%]">
              ${discount.toFixed(2)}
            </span>
          </Box>
          <Box className="flex justify-between items-center gap-4 text-base">
            <span className="font-bold w-[45%]">Tax</span>
            <span className="font-bold text-center w-[10%]">:</span>
            <span className="font-bold text-red-900 w-[45%]">
              ${tax.toFixed(2)}
            </span>
          </Box>
          <Box className="flex justify-between items-center gap-4 text-base">
            <span className="font-bold w-[45%]">Surcharge</span>
            <span className="font-bold text-center w-[10%]">:</span>
            <span className="font-bold text-red-900 w-[45%]">
              ${surcharge.toFixed(2)}
            </span>
          </Box>
        </Box>

        {/* Grand Total + Checkout */}
        <Box className="bg-red-900 text-white px-6 flex flex-col items-center justify-center flex-1">
          <Box className="text-base font-semibold mb-2">Grand Total</Box>
          <Box className="text-4xl font-bold mb-3">
            ${grandTotal.toFixed(2)}
          </Box>
          <Button
            variant="contained"
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            sx={{
              backgroundColor: "#000000",
              border: "1px solid #000000",
              color: "white",
              fontWeight: 700,
              "&.Mui-disabled": {
                backgroundColor: "#000000",
                color: "white",
              },
              "&:hover": {
                borderColor: "#ffffff",
                backgroundColor: "transparent",
              },
            }}
          >
            Checkout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CartTotals;
