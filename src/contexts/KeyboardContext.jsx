import React, { createContext, useContext, useState, useCallback } from 'react';

const KeyboardContext = createContext();

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};

export const KeyboardProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardConfig, setKeyboardConfig] = useState({
    value: '',
    onValueChange: null,
    type: 'text', // 'text', 'number', 'currency', 'email', 'pin'
    maxLength: null,
    inputProps: {},
  });

  const openKeyboard = useCallback((config) => {
    setKeyboardConfig({
      value: config.value || '',
      onValueChange: config.onValueChange,
      type: config.type || 'text',
      maxLength: config.maxLength || null,
      inputProps: config.inputProps || {},
    });
    setIsOpen(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setIsOpen(false);
    // Reset config after animation
    setTimeout(() => {
      setKeyboardConfig({
        value: '',
        onValueChange: null,
        type: 'text',
        maxLength: null,
        inputProps: {},
      });
    }, 300);
  }, []);

  const value = {
    isOpen,
    keyboardConfig,
    openKeyboard,
    closeKeyboard,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

