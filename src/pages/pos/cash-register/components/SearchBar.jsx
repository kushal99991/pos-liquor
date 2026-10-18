import { Box, Button } from "@mui/material";
import { Apps, Person } from "@mui/icons-material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";

const SearchBar = ({
  searchUPC,
  searchItem,
  setSearchUPC,
  setSearchItem
}) => {
  return (
    <Box className="p-4 bg-white border-b-2 border-gray-300 shadow-sm">
      <Box className="flex gap-3">
        <KeyboardTextField
          placeholder="UPC"
          value={searchUPC}
          onChange={(e) => setSearchUPC(e.target.value)}
          variant="outlined"
          size="medium"
          className="w-36"
        />
        <KeyboardTextField
          placeholder="Item Name/SKU/Distributor"
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          variant="outlined"
          size="medium"
          className="flex-1"
        />
        
        <Button
          variant="contained"
          sx={{
            minWidth: "56px",
            backgroundColor: "#8B2332",
            "&:hover": { backgroundColor: "#6B1A2A" },
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <Apps sx={{ fontSize: "28px" }} />
        </Button>
      </Box>
    </Box>
  );
};

export default SearchBar;
