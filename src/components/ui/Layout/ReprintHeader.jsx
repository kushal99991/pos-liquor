import { Box, IconButton } from "@mui/material";
import { ChevronLeft, HelpOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ReprintHeader = () => {
  const navigate = useNavigate();

  return (
    <Box className="bg-white border-t-4 border-[#dc2626] px-6 py-4 flex items-center justify-between shadow-sm">
      <Box className="flex items-center gap-4">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            width: 56,
            height: 56,
            backgroundColor: "#b91c1c",
            "&:hover": { backgroundColor: "#991b1b" },
            borderRadius: "8px",
          }}
        >
          <ChevronLeft sx={{ fontSize: 32, color: "white" }} />
        </IconButton>
        <span className="text-[32px] font-bold text-gray-800 tracking-wide">
          REPRINT
        </span>
      </Box>

      <Box className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-[36px] font-extrabold tracking-wider">
          <span className="text-gray-800">GLORY</span>
          <span className="text-[#dc2626]">POS</span>
        </span>
      </Box>

      <IconButton
        sx={{
          width: 56,
          height: 56,
          backgroundColor: "#1f2937",
          "&:hover": { backgroundColor: "#111827" },
          borderRadius: "50%",
        }}
      >
        <HelpOutline sx={{ fontSize: 32, color: "white" }} />
      </IconButton>
    </Box>
  );
};

export default ReprintHeader;
