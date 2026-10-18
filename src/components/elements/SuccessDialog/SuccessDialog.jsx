import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SuccessDialog = ({ open, message, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogContent sx={{ pt: 4, pb: 2 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={2}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "#b01d39",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40, color: "#ffffff" }} />
        </Box>
        <Typography
          sx={{
            color: "#333",
            fontSize: "16px",
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          }}
        >
          {message}
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          color: "#ffffff",
          background: "#b01d39",
          fontWeight: 600,
          px: 4,
          py: 1,
          "&:hover": {
            background: "#702626",
          },
        }}
        endIcon={
          <Box
            component="span"
            sx={{
              ml: 1,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            →
          </Box>
        }
      >
        OK
      </Button>
    </DialogActions>
  </Dialog>
);

export default SuccessDialog;

