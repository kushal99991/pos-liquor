import { Box, Button, Dialog } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const SingleReturnConfirmDialog = ({ open, onClose }) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <Box className="p-8 flex flex-col justify-center items-center gap-4">
          <ErrorOutlineIcon sx={{ fontSize: 40, color: "#b01d39" }} />
          <Box className="text-[18px] font-medium text-black text-center">
            Do you want to apply SINGLE ITEM <br /> RETURN for?
          </Box>
          <Box className="flex justify-center items-center gap-10 mt-2">
            <Button onClick={onClose} variant="text" sx={{ color: "#000" }}>
              SINGLE
            </Button>
            <Button variant="text" sx={{ color: "#b01d39" }}>
              ALL
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default SingleReturnConfirmDialog;
