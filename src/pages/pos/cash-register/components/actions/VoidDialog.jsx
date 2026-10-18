import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
} from "@mui/material";

export default function VoidDialog({ open, onClose, onConfirm }) {
  const handleYes = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "rounded-2xl shadow-xl p-8 w-full max-w-sm",
      }}
      BackdropProps={{
        className: "bg-black bg-opacity-50",
      }}
    >
      <DialogContent className="flex flex-col items-center text-center gap-6 !p-0">
        {/* Icon Circle */}
        <Box
          className="w-20 h-20 rounded-full flex items-center justify-center border-4"
          sx={{ borderColor: "#9b1c3e" }}
        >
          <AlertCircle className="w-12 h-12" style={{ color: "#9b1c3e" }} />
        </Box>

        {/* Text */}
        <Typography
          variant="body1"
          className="text-lg font-medium text-gray-800 max-w-[280px]"
        >
          Are you sure you want to void this transaction?
        </Typography>

        {/* Buttons */}
        <Box className="flex gap-4 justify-center w-full">
          <Button
            onClick={onClose}
            variant="text"
            className="min-w-[100px] px-6 py-2 text-gray-800 font-semibold text-base hover:bg-gray-100 rounded transition-colors"
          >
            NO
          </Button>
          <Button
            onClick={handleYes}
            variant="text"
            className="min-w-[100px] px-6 py-2 font-semibold text-base rounded transition-colors hover:bg-red-50"
            sx={{ color: "#9b1c3e" }}
          >
            YES
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
