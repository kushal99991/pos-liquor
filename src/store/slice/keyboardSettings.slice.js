import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  useUniversalKeyboard: true, // Enable custom keyboard by default
};

const keyboardSettingsSlice = createSlice({
  name: "keyboardSettings",
  initialState,
  reducers: {
    toggleUniversalKeyboard(state) {
      state.useUniversalKeyboard = !state.useUniversalKeyboard;
    },
    setUniversalKeyboard(state, action) {
      state.useUniversalKeyboard = action.payload;
    },
  },
});

export const { toggleUniversalKeyboard, setUniversalKeyboard } = keyboardSettingsSlice.actions;
export default keyboardSettingsSlice.reducer;

