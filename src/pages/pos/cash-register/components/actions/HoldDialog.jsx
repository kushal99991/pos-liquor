import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import CloseIcon from "@mui/icons-material/Close";
import { useCart } from "hooks";

export default function HoldDialog({ open, onClose }) {
  const [remark, setRemark] = useState("");
  const { holdCart, fetchHeldCarts } = useCart();

  const resetAndClose = () => {
    setRemark("");
    onClose();
  };

  const handleOk = async () => {
    const success = await holdCart(remark);
    if (success) {
      await fetchHeldCarts();
      resetAndClose();
    }
  };

  const handleCancel = () => {
    resetAndClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600} color="#9b1c3e">
            Hold
          </Typography>
          <IconButton
            onClick={handleCancel}
            sx={{
              backgroundColor: "#9b1c3e",
              color: "white",
              "&:hover": { backgroundColor: "#7d1632" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ backgroundColor: "#f5f5f5", p: 3, borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ minWidth: "150px" }}
            >
              ENTER REMARK
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              :
            </Typography>
          </Box>
          <KeyboardTextField
            fullWidth
            variant="outlined"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter remark for this hold transaction"
            sx={{
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ddd",
                },
                "&:hover fieldset": {
                  borderColor: "#9b1c3e",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#9b1c3e",
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 2, justifyContent: "center" }}>
        <Button
          onClick={handleOk}
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#9b1c3e",
            color: "white",
            minWidth: "150px",
            "&:hover": { backgroundColor: "#7d1632" },
          }}
        >
          OK
        </Button>
        <Button
          onClick={handleCancel}
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#9b1c3e",
            color: "white",
            minWidth: "150px",
            "&:hover": { backgroundColor: "#7d1632" },
          }}
        >
          CANCEL
        </Button>
      </DialogActions>
    </Dialog>
  );
}
