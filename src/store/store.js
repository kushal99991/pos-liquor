import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { configureStore } from "@reduxjs/toolkit";

import themeSlice from "./slice/theme.slice";
import authReducer from "./slice/auth.slice";
import cartReducer from "./slice/cart.slice";
import keyboardSettingsReducer from "./slice/keyboardSettings.slice";
import authSlice from "services/authSlice";
import posReducer from './slice/pos.slice'
import storeSlice from "services/storeSlice";
import cashierDrawerSlice from "services/cashierDrawerSlice";
import permissionsSlice from "services/permissionsSlice";
import itemSlice from "services/itemSlice";
import categorySlice from "services/categorySlice";
import cartSlice from "services/cartSlice";
import discountSlice from "services/discountSlice";
import surchargeSlice from "services/surchargeSlice";
import ageCheckSlice from "services/ageCheckSlice";
import orderSlice from "services/orderSlice";
import brandSlice from "services/brandSlice";
import departmentSlice from "services/departmentSlice";
import taxSlice from "services/taxSlice";
import itemGroupSlice from "services/itemGroupSlice";
import rolesSlice from "services/rolesSlice";
import usersSlice from "services/usersSlice";
import itemHistorySlice from "services/itemHistorySlice";
import subCategorySlice from "services/subCategorySlice";
import inventorySlice from "services/inventorySlice";
import shiftSlice from "services/shiftSlice";
import customerSlice from "services/customerSlice";

const isProduction = import.meta.env.VITE_APP_ENV === "production";


const appReducer = combineReducers({
  theme: themeSlice,
  auth: authReducer,
  pos: posReducer,
  cart: cartReducer,
  keyboardSettings: keyboardSettingsReducer,
  [authSlice.reducerPath]: authSlice.reducer,
  [storeSlice.reducerPath]: storeSlice.reducer,
  [cashierDrawerSlice.reducerPath]: cashierDrawerSlice.reducer,
  [permissionsSlice.reducerPath]: permissionsSlice.reducer,
  [itemSlice.reducerPath]: itemSlice.reducer,
  [categorySlice.reducerPath]: categorySlice.reducer,
  [cartSlice.reducerPath]: cartSlice.reducer,
  [discountSlice.reducerPath]: discountSlice.reducer,
  [ageCheckSlice.reducerPath]: ageCheckSlice.reducer,
  [orderSlice.reducerPath]: orderSlice.reducer,
  [brandSlice.reducerPath]: brandSlice.reducer,
  [departmentSlice.reducerPath]: departmentSlice.reducer,
  [taxSlice.reducerPath]: taxSlice.reducer,
  [itemGroupSlice.reducerPath]: itemGroupSlice.reducer,
  [rolesSlice.reducerPath]: rolesSlice.reducer,
  [usersSlice.reducerPath]: usersSlice.reducer,
  [itemHistorySlice.reducerPath]: itemHistorySlice.reducer,
  [subCategorySlice.reducerPath]: subCategorySlice.reducer,
  [inventorySlice.reducerPath]: inventorySlice.reducer,
  [shiftSlice.reducerPath]: shiftSlice.reducer,
  [surchargeSlice.reducerPath]: surchargeSlice.reducer,
  [customerSlice.reducerPath]: customerSlice.reducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "auth",
    "pos",
    "cart",
    "keyboardSettings"
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: isProduction === "production" && {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      immutableCheck: isProduction === "production",
    }).concat(authSlice.middleware,
      storeSlice.middleware,
      cashierDrawerSlice.middleware,
      permissionsSlice.middleware,
      itemSlice.middleware,
      categorySlice.middleware,
      cartSlice.middleware,
      discountSlice.middleware,
      ageCheckSlice.middleware,
      orderSlice.middleware,
      brandSlice.middleware,
      departmentSlice.middleware,
      taxSlice.middleware,
      itemGroupSlice.middleware,
      rolesSlice.middleware,
      usersSlice.middleware,
      itemHistorySlice.middleware,
      subCategorySlice.middleware,
      inventorySlice.middleware,
      shiftSlice.middleware,
      surchargeSlice.middleware,
      customerSlice.middleware
    ),
});

const persistor = persistStore(store);

setupListeners(store.dispatch);
export { store, persistor };
