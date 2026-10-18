import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { ArrowLeft, Check } from "lucide-react";

export default function ModalHeader({ mode, onClose, onSave, isSaving = false }) {
  return (
    <Box className="p-4 flex justify-between items-center gap-4">
      <Box className="flex justify-start items-center">
        <Button
          sx={{
            bgcolor: "#b01d39",
            color: "white",
            minHeight: 36,
            minWidth: 36,
            borderRadius: 50,
            "&:hover": { bgcolor: "#702626" },
          }}
          onClick={onClose}
          disabled={isSaving}
        >
          <ArrowLeft size={18} />
        </Button>
        <Box
          onClick={onClose}
          className="text-[20px] font-bold leading-[1.5] text-[#b01d39] uppercase cursor-pointer pl-2.5"
          sx={{
            opacity: isSaving ? 0.6 : 1,
            pointerEvents: isSaving ? "none" : "auto",
          }}
        >
          {mode === "add" ? "ADD ITEM" : "EDIT ITEM"}
        </Box>
      </Box>
      <Box className="flex justify-start items-center">
        <Button
          sx={{
            bgcolor: "#b01d39",
            color: "white",
            minHeight: 36,
            minWidth: 36,
            borderRadius: 50,
            "&:hover": { bgcolor: "#702626" },
            "&:disabled": {
              bgcolor: "#b01d39",
              opacity: 0.7,
            },
          }}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
            <Check size={18} />
          )}
        </Button>
        <Box
          onClick={!isSaving ? onSave : undefined}
          className="text-[20px] font-bold leading-[1.5] text-[#b01d39] uppercase cursor-pointer pl-2.5"
          sx={{
            opacity: isSaving ? 0.6 : 1,
            pointerEvents: isSaving ? "none" : "auto",
          }}
        >
          {isSaving ? "Saving..." : "SAVE"}
        </Box>
      </Box>
    </Box>
  );
}
