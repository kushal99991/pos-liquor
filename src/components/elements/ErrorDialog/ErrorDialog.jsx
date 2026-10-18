import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorDialog = ({ open, message, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: "#b01d39", fontWeight: 600 }}>Error</DialogTitle>
    <DialogContent>
      <Box display="flex" alignItems="flex-start" gap={2} py={2}>
        <ErrorOutlineIcon color="error" sx={{ mt: 0.5 }} />
        <Typography 
          color="error" 
          sx={{ 
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          }}
        >
          {message}
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={onClose} 
        sx={{
          color: "#ffffff",
          background: "#b01d39",
          "&:hover": {
            background: "#702626",
          },
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default ErrorDialog;
