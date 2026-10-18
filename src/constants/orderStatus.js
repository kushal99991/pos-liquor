// Order status constants matching backend OrderStatus enum
export const OrderStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  PARTIAL_REFUNDED: "partial_refunded",
  CONFIRMED: "confirmed",
};

// Order status descriptions
export const OrderStatusDescriptions = {
  [OrderStatus.PENDING]: "The order has been placed but payment is not yet completed.",
  [OrderStatus.COMPLETED]: "The payment was successful and the order is finalized.",
  [OrderStatus.CANCELLED]: "The order was cancelled by the user or system.",
  [OrderStatus.REFUNDED]: "The payment was returned to the customer after cancellation or issue.",
  [OrderStatus.PARTIAL_REFUNDED]: "Some items from the order have been returned and refunded.",
  [OrderStatus.CONFIRMED]: "The order has been confirmed and is being processed.",
};

// Format status for display (converts snake_case to Title Case)
export const formatOrderStatus = (status) => {
  if (!status) return "N/A";
  
  const normalizedStatus = status.toLowerCase();
  
  // Convert snake_case to Title Case
  return normalizedStatus
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get status color for UI display
export const getOrderStatusColor = (status) => {
  if (!status) return "#6b7280"; // gray
  
  const normalizedStatus = status.toLowerCase();
  
  const colorMap = {
    [OrderStatus.PENDING]: "#f59e0b", // amber
    [OrderStatus.COMPLETED]: "#10b981", // green
    [OrderStatus.CANCELLED]: "#ef4444", // red
    [OrderStatus.REFUNDED]: "#8b5cf6", // purple
    [OrderStatus.PARTIAL_REFUNDED]: "#f97316", // orange
    [OrderStatus.CONFIRMED]: "#3b82f6", // blue
  };
  
  return colorMap[normalizedStatus] || "#6b7280"; // default gray
};

// Get status background color for badges
export const getOrderStatusBgColor = (status) => {
  if (!status) return "#f3f4f6"; // light gray
  
  const normalizedStatus = status.toLowerCase();
  
  const bgColorMap = {
    [OrderStatus.PENDING]: "#fef3c7", // light amber
    [OrderStatus.COMPLETED]: "#d1fae5", // light green
    [OrderStatus.CANCELLED]: "#fee2e2", // light red
    [OrderStatus.REFUNDED]: "#ede9fe", // light purple
    [OrderStatus.PARTIAL_REFUNDED]: "#fed7aa", // light orange
    [OrderStatus.CONFIRMED]: "#dbeafe", // light blue
  };
  
  return bgColorMap[normalizedStatus] || "#f3f4f6"; // default light gray
};

