import React, { forwardRef } from "react";
import { TextField as MuiTextField } from "@mui/material";
import { useKeyboard } from "contexts/KeyboardContext";
import { useSelector } from "react-redux";

const KeyboardTextField = forwardRef((props, ref) => {
  const {
    value,
    onChange,
    type = "text",
    maxLength,
    disableKeyboard = false,
    keyboardType, // Override auto-detected type
    inputProps,
    select, // Check if this is a select field
    ...otherProps
  } = props;

  const { openKeyboard } = useKeyboard();
  const useUniversalKeyboard = useSelector((state) => state.keyboardSettings.useUniversalKeyboard);

  const handleFocus = (e) => {
    // Don't open keyboard for select/dropdown fields or if universal keyboard is disabled
    if (disableKeyboard || select || !useUniversalKeyboard) {
      return;
    }

    // Prevent native keyboard on mobile/tablet
    e.target.blur();

    // Determine keyboard type
    let detectedType = keyboardType || type;
    if (type === "number") {
      detectedType = "number";
    } else if (type === "email") {
      detectedType = "email";
    } else if (props.name?.includes("price") || props.name?.includes("cost")) {
      detectedType = "currency";
    }

    // Open custom keyboard
    openKeyboard({
      value: value || "",
      onValueChange: (newValue) => {
        // Create synthetic event for compatibility
        const syntheticEvent = {
          target: {
            name: props.name,
            value: newValue,
          },
        };
        if (onChange) {
          onChange(syntheticEvent);
        }
      },
      type: detectedType,
      maxLength: maxLength || inputProps?.maxLength,
      inputProps,
    });

    // Call original onFocus if provided
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <MuiTextField
      {...otherProps}
      ref={ref}
      value={value}
      onChange={onChange}
      type={type}
      select={select}
      onFocus={handleFocus}
      inputProps={{
        ...inputProps,
        readOnly: !disableKeyboard && !select && useUniversalKeyboard, // Make read-only only if universal keyboard is enabled
        maxLength,
      }}
    />
  );
});

KeyboardTextField.displayName = "KeyboardTextField";

export default KeyboardTextField;

