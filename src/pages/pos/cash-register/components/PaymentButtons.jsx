import { Box, Button } from "@mui/material";
import { CreditCard } from "@mui/icons-material";

const PaymentButtons = ({ addCash, payExactAmount }) => {
  return (
    <Box className="bg-gray-800 border-t-2 border-gray-600 py-3 px-5 shadow-lg">
      <Box className="flex gap-3 justify-end items-center">
        <Button
          onClick={() => console.log("CARD payment")}
          variant="contained"
          sx={{ fontSize: "1.2rem", backgroundColor: "#000", color: "white", minWidth: "100px", height: "80px", width: "100%" }}
        >
          <CreditCard sx={{ fontSize: "32px" }} />
          <span className="ml-2">CARD</span>
        </Button>
        {[5, 10, 20, 50, 100].map((amount) => (
          <Button
            key={amount}
            onClick={() => addCash(amount)}
            variant="contained"
            sx={{ fontSize: "1.5rem", backgroundColor: "#8B2332", color: "white", minWidth: "95px", height: "80px", width: "100%" }}
          >
            ${amount}
          </Button>
        ))}
        <Button
          onClick={payExactAmount}
          variant="contained"
          sx={{ fontSize: "1.2rem", backgroundColor: "#8B2332", color: "white", minWidth: "120px", height: "80px", width: "100%" }}
        >
          EXACT AMT
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentButtons;
