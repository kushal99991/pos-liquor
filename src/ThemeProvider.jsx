import React from "react";
import { ThemeProvider } from "@mui/material/styles";

import { useAppTheme } from "theme/useAppTheme";

const ThemeProviderComponent = ({
  children,
}) => {
  const theme = useAppTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeProviderComponent;
