import ReactDOM, { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "store/store";
import App from "./App";
import ThemeProvider from "./ThemeProvider";
import "./index.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { SnackbarProvider } from "contexts/SnackbarContext";
import { KeyboardProvider } from "contexts/KeyboardContext";
import UniversalKeyboard from "components/elements/UniversalKeyboard/UniversalKeyboard";

const root = createRoot(
  document.getElementById("root")
);
root.render(
  <Provider store={store}>
    <BrowserRouter>
        <ThemeProvider>
          <SnackbarProvider>
            <KeyboardProvider>
              <App />
              <UniversalKeyboard />
            </KeyboardProvider>
          </SnackbarProvider>
        </ThemeProvider>
    </BrowserRouter>
  </Provider>
);