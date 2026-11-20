// User roles
const UserRole = {
  SUDO: "sudo",
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  REPORTING: "reporting",
  ACCOUNTING: "accounting",
  STAFF: "staff",
};

// Role access mapping
const RoleAccess = {
  "Dashboard": "dashboard",
  "Cash Register": "cash-register",
  "Inventory": "inventory",
  "Products": "products",
  "Access to Reports": "reports",
  "Super User Access": "Super User Access",
  "Admin Access": "Admin Access",
  "Backoffice Access": "backoffice",
  "Financial Access": "accounting",
};

// Default permissions list
const defaultPermssionList = [
  "Dashboard",
  "Cash Register",
  "Inventory",
  "Products",
  "Access to Reports",
  "Backoffice Access",
  "Financial Access",
];

export {
  UserRole,
  RoleAccess,
  defaultPermssionList,
};
