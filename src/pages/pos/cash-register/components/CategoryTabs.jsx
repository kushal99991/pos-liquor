import React, { useRef } from "react";
import { Box, Button } from "@mui/material";

export default function CategoryScroll({
  categories,
  selectedCategory,
  setSelectedCategory,
  hasTopSellData = false,
}) {
  const scrollRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    scrollRef.current.classList.add("active");
    startX = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
    scrollRef.current.classList.remove("active");
  };

  const handleMouseUp = () => {
    isDown = false;
    scrollRef.current.classList.remove("active");
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const TOP_SELL_VALUE = "top_sell";

  return (
    <Box
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      sx={{
        backgroundColor: "white",
        px: 2.5,
        py: 1.5,
        borderBottom: "2px solid #ccc",
        display: "flex",
        gap: 1,
        overflowX: "auto",
        whiteSpace: "nowrap",
        cursor: "grab",
        "&::-webkit-scrollbar": { display: "none" },
        userSelect: "none",
      }}
    >
      {/* Recent Order Button - First - Only show if top_sell data exists */}
      {hasTopSellData && (
        <Button
          onClick={() => setSelectedCategory(TOP_SELL_VALUE)}
          disableElevation
          sx={{
            backgroundColor: selectedCategory === TOP_SELL_VALUE ? "#8B2332" : "#5A5A5A",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.95rem",
            textTransform: "none",
            borderRadius: 2,
            minWidth: "110px",
            height: "48px",
            "&:hover": {
              backgroundColor: selectedCategory === TOP_SELL_VALUE ? "#6B1A2A" : "#4A4A4A",
            },
          }}
        >
          Recent Order
        </Button>
      )}
      
      {/* Category Buttons */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            disableElevation
            sx={{
              backgroundColor: isSelected ? "#8B2332" : "#5A5A5A",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.95rem",
              textTransform: "none",
              borderRadius: 2,
              minWidth: "110px",
              height: "48px",
              "&:hover": {
                backgroundColor: isSelected ? "#6B1A2A" : "#4A4A4A",
              },
            }}
          >
            {category.name}
          </Button>
        );
      })}
    </Box>
  );
}
