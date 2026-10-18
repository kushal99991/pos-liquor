import {
  mockCategories,
  mockSubCategories,
  mockLiquorProducts,
  mockDiscounts,
  mockSurcharges,
  mockTaxes,
} from "./liquorInventory";

const STORAGE_KEYS = {
  PRODUCTS: "liquor_mock_products",
  DISCOUNTS: "liquor_mock_discounts",
  SURCHARGES: "liquor_mock_surcharges",
  ORDERS: "liquor_mock_orders",
  DRAWER: "liquor_mock_drawer",
  CUSTOMERS: "liquor_mock_customers",
};

// Initialize localStorage with mock data if not already present
export const initMockStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockLiquorProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(mockDiscounts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SURCHARGES)) {
    localStorage.setItem(STORAGE_KEYS.SURCHARGES, JSON.stringify(mockSurcharges));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(
      STORAGE_KEYS.CUSTOMERS,
      JSON.stringify([
        {
          id: 1,
          name: "Walk-in Customer",
          phone: "0000000000",
          email: "walkin@posliquor.com",
          dob: "1990-01-01",
          is_age_verified: true,
        },
        {
          id: 2,
          name: "John Miller (VIP)",
          phone: "5551234567",
          email: "john.miller@example.com",
          dob: "1985-05-15",
          is_age_verified: true,
        },
        {
          id: 3,
          name: "Sarah Connor",
          phone: "5559876543",
          email: "sarah@example.com",
          dob: "1994-08-20",
          is_age_verified: true,
        },
      ])
    );
  }
};

// Run init
initMockStorage();

export const getStoredProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : mockLiquorProducts;
  } catch {
    return mockLiquorProducts;
  }
};

export const getStoredDiscounts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    return data ? JSON.parse(data) : mockDiscounts;
  } catch {
    return mockDiscounts;
  }
};

export const getStoredSurcharges = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SURCHARGES);
    return data ? JSON.parse(data) : mockSurcharges;
  } catch {
    return mockSurcharges;
  }
};

export const getStoredCustomers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const DEMO_USERS = {
  cashier: {
    pin: "1234",
    user: {
      id: 101,
      name: "Cashier Demo",
      email: "cashier@posliquor.com",
      store_id: 1,
      roles: ["cashier"],
      store: {
        id: 1,
        name: "Vintage Spirits & Fine Wines",
        address: "742 Evergreen Terrace, Springfield",
        phone: "+1 (555) 234-5678",
        email: "store@posliquor.com",
        tax_rate: 8.25,
        currency: "USD",
        timezone: "America/New_York",
        payment_config: {
          cash: true,
          card: true,
          split: true,
        },
      },
    },
    token: "mock-cashier-jwt-token-offline-1234",
  },
  admin: {
    email: "admin@posliquor.com",
    password: "Admin@123",
    user: {
      id: 1,
      name: "Store Administrator",
      email: "admin@posliquor.com",
      store_id: 1,
      roles: ["admin", "superadmin"],
      store: {
        id: 1,
        name: "Vintage Spirits & Fine Wines",
        address: "742 Evergreen Terrace, Springfield",
        phone: "+1 (555) 234-5678",
        email: "store@posliquor.com",
        tax_rate: 8.25,
        currency: "USD",
        timezone: "America/New_York",
        payment_config: {
          cash: true,
          card: true,
          split: true,
        },
      },
    },
    token: "mock-admin-jwt-token-offline-admin123",
  },
};

/**
 * Handle and intercept API requests offline
 * Returns { handled: boolean, data?: any, error?: any }
 */
export const handleOfflineApi = async (config) => {
  const url = config.url || "";
  const method = (config.method || "GET").toUpperCase();
  const data = config.data;
  const params = config.params || {};

  console.log(`[Offline Mock API] ${method} ${url}`, { params, data });

  // 1. CASHIER LOGIN (pin = 1234)
  if (url.includes("/auth/auth/cashier-login") || url.includes("/auth/cashier-login")) {
    let pin = "";
    if (data instanceof FormData) {
      pin = data.get("pin");
    } else if (typeof data === "object" && data?.pin) {
      pin = data.pin;
    }

    if (pin === "1234" || pin === 1234 || !pin) {
      return {
        handled: true,
        data: {
          access_token: DEMO_USERS.cashier.token,
          token_type: "bearer",
          user: DEMO_USERS.cashier.user,
        },
      };
    } else {
      return {
        handled: true,
        error: {
          status: 401,
          data: { detail: "Invalid PIN. Use demo pin 1234" },
          message: "Invalid PIN. Use demo pin 1234",
        },
      };
    }
  }

  // 2. ADMIN LOGIN (admin@posliquor.com / Admin@123)
  if (url.includes("/auth/auth/admin-login") || url.includes("/auth/admin-login")) {
    const email = data?.email || "";
    const password = data?.password || "";

    const isMatch =
      (email.toLowerCase() === "admin@posliquor.com" && password === "Admin@123") ||
      email === "admin" ||
      (!email && !password);

    if (isMatch) {
      return {
        handled: true,
        data: {
          access_token: DEMO_USERS.admin.token,
          token_type: "bearer",
          user: DEMO_USERS.admin.user,
        },
      };
    } else {
      return {
        handled: true,
        error: {
          status: 401,
          data: { detail: "Invalid credentials. Use admin@posliquor.com / Admin@123" },
          message: "Invalid credentials. Use admin@posliquor.com / Admin@123",
        },
      };
    }
  }

  // 3. WHOAMI
  if (url.includes("/auth/whoami")) {
    const session = localStorage.getItem("session");
    let currentUser = DEMO_USERS.cashier.user;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.email === "admin@posliquor.com" || parsed.roles?.includes("admin")) {
          currentUser = DEMO_USERS.admin.user;
        }
      } catch {}
    }
    return {
      handled: true,
      data: currentUser,
    };
  }

  // 4. GENERAL AUTH LOGIN
  if (url.includes("/auth/login")) {
    return {
      handled: true,
      data: {
        access_token: DEMO_USERS.cashier.token,
        token_type: "bearer",
        user: DEMO_USERS.cashier.user,
      },
    };
  }

  // 5. STORES
  if (url.includes("/auth/stores/active")) {
    return {
      handled: true,
      data: [DEMO_USERS.cashier.user.store],
    };
  }

  // 6. DRAWER APIS
  if (url.includes("/pos/drawer/open")) {
    const drawerId = "drawer_" + Date.now();
    const drawerData = {
      id: drawerId,
      status: "OPEN",
      opened_at: new Date().toISOString(),
      opening_amount: data?.opening_amount || 100,
    };
    localStorage.setItem(STORAGE_KEYS.DRAWER, JSON.stringify(drawerData));
    return {
      handled: true,
      data: drawerData,
    };
  }

  if (url.includes("/pos/drawer/get-open")) {
    const drawer = localStorage.getItem(STORAGE_KEYS.DRAWER);
    return {
      handled: true,
      data: drawer ? JSON.parse(drawer) : { id: "drawer_default", status: "OPEN", opening_amount: 100 },
    };
  }

  if (url.includes("/pos/drawer/transaction/balance")) {
    return {
      handled: true,
      data: {
        balance: 500.00,
        expected_cash: 500.00,
        total_sales: 400.00,
      },
    };
  }

  if (url.includes("/pos/drawer/transaction")) {
    return {
      handled: true,
      data: { success: true, id: Date.now() },
    };
  }

  if (url.includes("/pos/drawer/close")) {
    localStorage.removeItem(STORAGE_KEYS.DRAWER);
    return {
      handled: true,
      data: { success: true, closed_at: new Date().toISOString() },
    };
  }

  // 7. CATEGORIES
  if (url.includes("/categories")) {
    if (params?.category_id || url.includes("/sub")) {
      return { handled: true, data: mockSubCategories };
    }
    return {
      handled: true,
      data: mockCategories,
    };
  }

  // 8. BRANDS
  if (url.includes("/brands")) {
    return {
      handled: true,
      data: [
        { id: 1, name: "Corona" },
        { id: 2, name: "Heineken" },
        { id: 3, name: "Jack Daniel's" },
        { id: 4, name: "Patrón" },
        { id: 5, name: "Tito's" },
        { id: 6, name: "White Claw" },
      ],
    };
  }

  // 9. ITEMS / INVENTORY
  if (url.includes("/items") || url.includes("/inventory")) {
    let products = getStoredProducts();

    // Specific item by ID
    const idMatch = url.match(/\/items\/(\d+)/) || url.match(/\/inventory\/(\d+)/);
    if (idMatch && method === "GET") {
      const item = products.find((p) => p.id === Number(idMatch[1]));
      return { handled: true, data: item || products[0] };
    }

    if (url.includes("/items/item") && params?.item_id) {
      const item = products.find((p) => p.id === Number(params.item_id));
      return { handled: true, data: item || products[0] };
    }

    // Filter by search / category
    if (params?.category && params.category !== "top_sell") {
      products = products.filter((p) => p.category_id === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.upc && p.upc.includes(q))
      );
    }

    return {
      handled: true,
      data: {
        data: products,
        total: products.length,
        items: products,
      },
    };
  }

  // 10. DISCOUNTS
  if (url.includes("/discounts")) {
    const discounts = getStoredDiscounts();
    return {
      handled: true,
      data: discounts,
    };
  }

  // 11. SURCHARGES
  if (url.includes("/surcharges")) {
    const surcharges = getStoredSurcharges();
    return {
      handled: true,
      data: surcharges,
    };
  }

  // 12. TAXES
  if (url.includes("/taxes")) {
    return {
      handled: true,
      data: mockTaxes,
    };
  }

  // 13. CUSTOMERS
  if (url.includes("/customers")) {
    const customers = getStoredCustomers();
    if (method === "POST") {
      const newCust = { id: Date.now(), ...data, is_age_verified: true };
      const updated = [...customers, newCust];
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
      return { handled: true, data: newCust };
    }
    return {
      handled: true,
      data: customers,
    };
  }

  // 14. ORDERS / CHECKOUT
  if (url.includes("/orders")) {
    if (method === "POST") {
      const newOrder = {
        id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "COMPLETED",
        created_at: new Date().toISOString(),
        ...data,
      };

      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([newOrder, ...prev]));
      } catch {}

      return {
        handled: true,
        data: newOrder,
      };
    }
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    return {
      handled: true,
      data: orders,
    };
  }

  // 15. CART HOLD / RESUME / VOID
  if (url.includes("/cart")) {
    return {
      handled: true,
      data: { success: true, message: "Cart updated offline" },
    };
  }

  // 16. AGE VERIFICATION
  if (url.includes("/age-check/verify-age")) {
    return {
      handled: true,
      data: {
        verified: true,
        status: "APPROVED",
        dob: "1995-01-01",
        age: 31,
        message: "Age verified: Customer is 21+ years old.",
      },
    };
  }

  // 17. SHIFTS / REPORTS
  if (url.includes("/shifts")) {
    return {
      handled: true,
      data: {
        total_sales: 1250.75,
        total_cash: 650.00,
        total_card: 600.75,
        transactions_count: 28,
        discounts_total: 45.00,
        surcharges_total: 12.50,
      },
    };
  }

  // Catch-all mock fallback so nothing throws an unhandled network error
  return {
    handled: true,
    data: { success: true },
  };
};
