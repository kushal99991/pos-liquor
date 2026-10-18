import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  menuList: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveSession(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { saveSession, logout } = authSlice.actions;
export default authSlice.reducer;
