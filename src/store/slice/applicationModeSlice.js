import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  mode: "PMS",
  features: ["PMS", "POS"], // Initialize with both features for demonstration
};

const applicationModeSlice = createSlice({
  name: "applicationMode",
  initialState,
  reducers: {
    setMode: (
      state,
      action
    ) => {
      state.mode = action.payload;
    },
    setFeatures: (
      state,
      action
    ) => {
      state.features = action.payload;
    },
  },
});

export const { setMode, setFeatures } = applicationModeSlice.actions;
export default applicationModeSlice.reducer;
