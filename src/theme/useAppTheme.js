import { useSelector } from "react-redux";

import { lightTheme, darkTheme } from "./theme";

export const useAppTheme = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  return darkMode ? darkTheme : lightTheme;
};
