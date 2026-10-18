import { lazy } from "react";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  PeopleAlt as PeopleAltIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";
import HomePage from "pages/home/page";
import ComingSoon from "components/elements/ComingSoon/ComingSoon";

const LoginPage = lazy(() => import("pages/login/page"));
const ForgotPasswordPage = lazy(() => import("pages/forgot-password/page"));
const ResetPasswordPage = lazy(() => import("pages/reset-password/page"));
const RegisterPage = lazy(() => import("pages/register/page"));

// Lazy load pages
const Dashboard = lazy(() => import("pages/pos/dashboard/page"));
const BackOffice = lazy(() => import("pages/backoffice/login/page"));
const BackOfficeDashboard = lazy(() => import("pages/backoffice/dashboard/page"));
const EmployeeRole = lazy(() => import("pages/backoffice/manage-employee/role"));
const Employee = lazy(() => import("pages/backoffice/manage-employee/Employee"));
const Customer = lazy(() => import("pages/backoffice/manage-employee/Customer"));
// const Products = lazy(() => import("pages/backoffice/products/Items"));
const Pos = lazy(() => import("pages/pos/index"));
const CashRegisterPage = lazy(() => import("pages/pos/cash-register/page"));
const CashRegisterRePrintPage = lazy(() => import("pages/pos/re-print/page"));
const Items = lazy(() => import("pages/pos/items/page"));
const AddEditItemModal = lazy(() => import("pages/pos/items/AddEditItemModal"));
const CustomersPage = lazy(() => import("pages/pos/customers/page"));
const RoleAddEditPage = lazy(() => import("pages/backoffice/manage-employee/RoleAddEditPage"));
const EmployeAddEditPage = lazy(() => import("pages/backoffice/manage-employee/EmployeeAddEditPage"));
const CustomerAddEditPage = lazy(() => import("pages/backoffice/manage-employee/CustomerAddEditPage"));
const Department = lazy(() => import("pages/backoffice/products/Department"));
const DepartmentAddEditPage = lazy(() => import("pages/backoffice/products/DepartmentAddEditPage"));
const Category = lazy(() => import("pages/backoffice/products/Category"));
const CategoryAddEditPage = lazy(() => import("pages/backoffice/products/CategoryAddEditPage"));
const SubCategory = lazy(() => import("pages/backoffice/products/SubCategory"));
const SubCategoryAddEditPage = lazy(() => import("pages/backoffice/products/SubCategoryAddEditPage"));
const ProductsItems = lazy(() => import("pages/backoffice/products/Items"));
const ProductsItemsAddEditPage = lazy(() => import("pages/backoffice/products/ItemsAddEditPage"));
const ProductsItemsGroup = lazy(() => import("pages/backoffice/products/ItemsGroup"));
const ProductsItemsGroupAddEditPage = lazy(() => import("pages/backoffice/products/ItemsGroupAddEditPage"));
const ItemsHistory = lazy(() => import("pages/backoffice/products/ItemHistory"));
const ItemBrand = lazy(() => import("pages/backoffice/products/ItemBrand"));
const ItemBrandAddEditPage = lazy(() => import("pages/backoffice/products/ItemBrandAddEditPage"));
const Inventory = lazy(() => import("pages/backoffice/products/Inventory"));
const InventoryAddEditPage = lazy(() => import("pages/backoffice/products/InventoryAddEditPage"));
const Discount = lazy(() => import("pages/backoffice/sales-promotion/Discount"));
const DiscountAddEditPage = lazy(() => import("pages/backoffice/sales-promotion/DiscountAddEditPage"));
const Surcharge = lazy(() => import("pages/backoffice/sales-promotion/Surcharge"));
const SurchargeAddEditPage = lazy(() => import("pages/backoffice/sales-promotion/SurchargeAddEditPage"));
const ReportsPage = lazy(() => import("pages/pos/reports/page"));
const InventoryReport = lazy(() => import("pages/pos/reports/InventoryReport"));
const RevenueReport = lazy(() => import("pages/pos/reports/RevenueReport"));
const EndShiftReport = lazy(() => import("pages/pos/reports/EndShiftReport"));
const Transactions = lazy(() => import("pages/backoffice/transactions/page"));

export const bookingEngineMenuList = [
  {
    path: "/dashboard",
    menuTitle: "Dashboard",
    icon: DashboardIcon,
    Component: Dashboard,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
  },
  {
    path: "/clockin",
    menuTitle: "Time Card",
    icon: DashboardIcon,
    Component: ComingSoon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: false,
  },
  {
    path: "/break",
    menuTitle: "Item Management",
    icon: DashboardIcon,
    Component: ComingSoon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: false,
  },
  {
    path: "/resume",
    menuTitle: "Inventory Management",
    icon: DashboardIcon,
    Component: ComingSoon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: false,
  },
  {
    path: "/clockout",
    menuTitle: "Customer/Loyalty PRG",
    icon: DashboardIcon,
    Component: ComingSoon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: false,
  },
  {
    path: "/reports",
    menuTitle: "REPORTS",
    icon: DashboardIcon,
    Component: ReportsPage,
    roles: ["Admin", "Cashier"],
    showMenuBar: true,
    isShowSidebar: false,
    subMenu: [
      {
        path: "/reports/inventory",
        menuTitle: "Inventory Report",
        Component: InventoryReport,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        path: "/reports/revenue",
        menuTitle: "Revenue Report",
        Component: RevenueReport,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        path: "/reports/end-shift",
        menuTitle: "End Shift Report",
        Component: EndShiftReport,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: false,
      },
    ],
  },
  {
    path: "/itemhistory",
    menuTitle: "ITEM HISTORY",
    icon: DashboardIcon,
    Component: ComingSoon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: false,
  },
  {
    path: "/pos",
    menuTitle: "POS",
    icon: ShoppingCartIcon,
    Component: Pos,
    roles: ["Admin", "Cashier"],
    showMenuBar: true,
    isShowSidebar: true,
    subMenu: [
      {
        path: "/pos/cash-register",
        menuTitle: "Cash Register",
        Component: CashRegisterPage,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        path: "/pos/cash-register/reprint",
        menuTitle: "REPRINT",
        Component: CashRegisterRePrintPage,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        path: "/pos/cash-register/items",
        menuTitle: "ITEMS",
        Component: Items,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        path: "/pos/cash-register/items/add",
        menuTitle: "ADD NEW ITEMS",
        Component: AddEditItemModal,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        path: "/pos/customers",
        menuTitle: "CUSTOMERS",
        Component: CustomersPage,
        roles: ["Admin", "Cashier"],
        showMenuBar: true,
        isShowSidebar: true,
      }
    ],
  },
];

export const PublicRoutesList = [
  {
    path: "/home",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
];


export const AdminPublicRoutesList = [
  {
    path: "/backoffice",
    Component: BackOffice,
  },
];

export const BackOfficeRoutesList = [
  {
    id: "dashboard",
    menuTitle: "Dashboard",
    icon: DashboardIcon,
    path: "/backoffice/dashboard",
    Component: BackOfficeDashboard,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
  },
  {
    id: "employee",
    menuTitle: "Manage Employee",
    icon: DashboardIcon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
    subMenu: [
      {
        menuTitle: "Role",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/role",
        Component: EmployeeRole,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,

      },
      {
        menuTitle: "Add Role",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/role/addedit",
        Component: RoleAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Employee",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/employee",
        Component: Employee,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Employee",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/employee/addedit",
        Component: EmployeAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Customer",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/customer",
        Component: Customer,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Customer",
        icon: PeopleAltIcon,
        path: "/backoffice/manage-employee/customer/addedit",
        Component: CustomerAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
    ],
  },
  {
    id: "products",
    menuTitle: "Products",
    icon: DashboardIcon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
    subMenu: [
      {
        menuTitle: "Department",
        icon: PeopleAltIcon,
        path: "/backoffice/products/department",
        Component: Department,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Department",
        icon: PeopleAltIcon,
        path: "/backoffice/products/department/addedit",
        Component: DepartmentAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Category",
        icon: PeopleAltIcon,
        path: "/backoffice/products/category",
        Component: Category,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Category",
        icon: PeopleAltIcon,
        path: "/backoffice/products/category/addedit",
        Component: CategoryAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Sub-Category",
        icon: PeopleAltIcon,
        path: "/backoffice/products/subcategory",
        Component: SubCategory,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Sub Category",
        icon: PeopleAltIcon,
        path: "/backoffice/products/subcategory/addedit",
        Component: SubCategoryAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Items",
        icon: PeopleAltIcon,
        path: "/backoffice/products/items",
        Component: ProductsItems,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Item",
        icon: PeopleAltIcon,
        path: "/backoffice/products/items/addedit",
        Component: ProductsItemsAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Items Group",
        icon: PeopleAltIcon,
        path: "/backoffice/products/itemsgroup",
        Component: ProductsItemsGroup,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "ADD ITEMS GROUP",
        icon: PeopleAltIcon,
        path: "/backoffice/products/itemsgroup/addedit",
        Component: ProductsItemsGroupAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Item History",
        icon: PeopleAltIcon,
        path: "/backoffice/products/itemhistory",
        Component: ItemsHistory,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Item Brand",
        icon: PeopleAltIcon,
        path: "/backoffice/products/itembrand",
        Component: ItemBrand,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Brand",
        icon: PeopleAltIcon,
        path: "/backoffice/products/itembrand/addedit",
        Component: ItemBrandAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Quick Add Item",
        icon: PeopleAltIcon,
        path: "/backoffice/products/items/addedit",
        Component: ProductsItemsAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Inventory",
        icon: PeopleAltIcon,
        path: "/backoffice/products/inventory",
        Component: Inventory,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Inventory",
        icon: PeopleAltIcon,
        path: "/backoffice/products/inventory/addedit",
        Component: InventoryAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
    ],
  },
  {
    id: "sales-promotion",
    menuTitle: "Sales & Promotion",
    icon: DashboardIcon,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
    subMenu: [
      {
        menuTitle: "Discount",
        icon: PeopleAltIcon,
        path: "/backoffice/sales-promotion/discount",
        Component: Discount,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Discount",
        icon: PeopleAltIcon,
        path: "/backoffice/sales-promotion/discount/addedit",
        Component: DiscountAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
      {
        menuTitle: "Surcharge",
        icon: LocalOfferIcon,
        path: "/backoffice/sales-promotion/surcharge",
        Component: Surcharge,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: true,
      },
      {
        menuTitle: "Add Surcharge",
        icon: LocalOfferIcon,
        path: "/backoffice/sales-promotion/surcharge/addedit",
        Component: SurchargeAddEditPage,
        roles: ["Admin"],
        showMenuBar: true,
        isShowSidebar: false,
      },
    ],
  },
  {
    id: "transactions",
    menuTitle: "Transactions",
    icon: DashboardIcon,
    path: "/backoffice/transactions",
    Component: Transactions,
    roles: ["Admin"],
    showMenuBar: true,
    isShowSidebar: true,
  },
];
