import React from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  Divider,
} from "@mui/material";

export default function ConfirmationDialog({
  open,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  onConfirm,
  onCancel,
  confirmLoading = false,
  confirmDisabled = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#b01d39",
          color: "white",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Button
          onClick={onCancel}
          sx={{
            minWidth: 0,
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            lineHeight: 1,
            "&:hover": { backgroundColor: "transparent", opacity: 0.8 },
          }}
        >
          ×
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ px: 4, py: 3 }}>
        <Typography
          sx={{
            color: "#374151",
            fontSize: "15px",
            textAlign: "center",
            mb: 2,
          }}
        >
          {description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Footer Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            pt: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderColor: "#9ca3af",
              color: "#374151",
              textTransform: "uppercase",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "#9ca3af",
                color: "white",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onConfirm}
            sx={{
              backgroundColor: "#b01d39",
              color: "white",
              textTransform: "uppercase",
              fontWeight: 600,
              px: 3,
              "&:hover": { backgroundColor: "#702626" },
            }}
            disabled={confirmDisabled || confirmLoading}
          >
            {confirmLoading ? "Processing..." : "Confirm"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
