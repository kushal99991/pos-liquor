import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  installation: {
    storeConfig: {
      name: '',
      address: '',
      phone: '',
      email: '',
      taxRate: 0,
      currency: 'USD',
      timezone: 'America/New_York'
    },
    paymentConfig: {
      stripeEnabled: false,
      cashEnabled: true,
      creditCardEnabled: false,
      digitalWalletEnabled: false,
      splitPaymentEnabled: false
    },
    devices: [],
    currentStep: 0,
    isComplete: false,
  },
  isInstalling: false,
  error: null,
  availableDevices: [],
  installationSteps: [
    { id: 'store-info', title: 'Store Information', description: 'Basic store details', completed: false, current: true },
    { id: 'payment-setup', title: 'Payment Setup', description: 'Configure payment methods', completed: false, current: false },
    { id: 'device-config', title: 'Device Configuration', description: 'Setup hardware devices', completed: false, current: false },
    { id: 'testing', title: 'Testing & Verification', description: 'Test all connections', completed: false, current: false },
    { id: 'complete', title: 'Installation Complete', description: 'Ready to use', completed: false, current: false }
  ]
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setStoreConfiguration: (state, action) => {
      state.installation.storeConfig = action.payload;
    },
    
    setPaymentConfiguration: (state, action) => {
      state.installation.paymentConfig = action.payload;
    },
    
    addDevice: (state, action) => {
      state.installation.devices.push(action.payload);
    },
    
    removeDevice: (state, action) => {
      state.installation.devices = state.installation.devices.filter(
        device => device.id !== action.payload
      );
    },
    
    updateDevice: (state, action) => {
      const index = state.installation.devices.findIndex(
        device => device.id === action.payload.id
      );
      if (index !== -1) {
        state.installation.devices[index] = action.payload;
      }
    },
    
    setCurrentStep: (state, action) => {
      state.installation.currentStep = action.payload;
      state.installationSteps.forEach((step, index) => {
        step.current = index === action.payload;
        step.completed = index < action.payload;
      });
    },
    
    nextStep: (state) => {
      if (state.installation.currentStep < state.installationSteps.length - 1) {
        const currentIndex = state.installation.currentStep;
        state.installationSteps[currentIndex].completed = true;
        state.installationSteps[currentIndex].current = false;
        
        state.installation.currentStep = currentIndex + 1;
        state.installationSteps[currentIndex + 1].current = true;
      }
    },
    
    previousStep: (state) => {
      if (state.installation.currentStep > 0) {
        const currentIndex = state.installation.currentStep;
        state.installationSteps[currentIndex].current = false;
        
        state.installation.currentStep = currentIndex - 1;
        state.installationSteps[currentIndex - 1].current = true;
        state.installationSteps[currentIndex - 1].completed = false;
      }
    },
    
    completeInstallation: (state) => {
      state.installation.isComplete = true;
      state.installationSteps.forEach((step, index) => {
        step.completed = true;
        step.current = index === state.installationSteps.length - 1;
      });
    },
    
    setAvailableDevices: (state, action) => {
      state.availableDevices = action.payload;
    },
    
    setInstalling: (state, action) => {
      state.isInstalling = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStoreId: (state, action) => {
      state.installation.storeId = action.payload;
    }
  }
});

export const {
  setStoreConfiguration,
  setPaymentConfiguration,
  addDevice,
  removeDevice,
  updateDevice,
  setCurrentStep,
  nextStep,
  previousStep,
  completeInstallation,
  setAvailableDevices,
  setInstalling,
  setError,
  setStoreId
} = posSlice.actions;

export default posSlice.reducer;