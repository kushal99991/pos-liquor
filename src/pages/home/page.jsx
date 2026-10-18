import { useState } from "react";
import Keyboard from "components/elements/Keyboard/Keyboard";
import ActionButtons from "./component/ActionButtons";
import { Box } from "@mui/material";
import OpeningBalanceDialog from "./component/OpeningBalanceDialog";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";
import { saveSession } from "store/slice/auth.slice";
import { useCashieLoginMutation, useWhoAmIMutation } from "services/authSlice";
import useSnackbar from "hooks/useSnackbar";
import { useOpenDrawerMutation } from "services/cashierDrawerSlice";
import { setPaymentConfiguration, setStoreConfiguration, setStoreId } from "store/slice/pos.slice";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [whoAmI] = useWhoAmIMutation()
  const [cashieLogin] = useCashieLoginMutation();
  const [openDrawer] = useOpenDrawerMutation();

  const [temp_access_token, setTempAccessToken] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showOpeningBalance, setShowOpeningBalance] = useState(false);
  const [pinError, setPinError] = useState(false);


  const handleSubmitPin = async (value) => {
    const response = await cashieLogin({ pin: value });
    if (response?.error) {
      setPinError(true); 
      openSnackbar(response.error, "error");
      return false;
    }
    setTempAccessToken(response.data.access_token)
    setShowKeyboard(false);
    setShowOpeningBalance(true);
  };

  const handleSignIn = () => {
    setShowKeyboard((prev) => !prev);
    setPinError(false);
  };

  const handleOpeningBalanceSubmit = async (amount) => {
    Cookies.set(appConfig.tokenName, temp_access_token, { expires: 1 });
    const response = await whoAmI();
    const userData = response.data
    const userSession = {
      id: userData?.id,
      name: userData?.name,
      role: userData?.roles || [],
      openingBalance: amount,
      token: temp_access_token, // normally from API
      login_time: new Date().toISOString(), // Store login time
    };
    dispatch(setStoreId(userData.store_id))
    dispatch(saveSession(userSession));
    dispatch(setStoreConfiguration({
      name: userData.store.name,
      address: userData.store.address,
      phone: userData.store.phone,
      email: userData.store.email,
      taxRate: userData.store.tax_rate,
      currency: userData.store.currency,
      timezone: userData.store.timezone
    }));
    dispatch(setPaymentConfiguration(userData.store.payment_config));
    localStorage.setItem("session", JSON.stringify(userSession));
    // Also store login time separately for easy access
    localStorage.setItem("login_time", Date.now().toString());
    const drawerResponse = await openDrawer({
      store_id: userData.store_id,
      opening_amount: amount,
      transaction_type: "opening_amount",
      opening_note: "",
      temp_access_token: temp_access_token,
    });
    if (drawerResponse?.error) {
      openSnackbar(drawerResponse.error, "error");
      return false;
    }
    const drawerResponseData = drawerResponse?.data ?? null;
    // So drawerResponse is already the data object, not drawerResponse.data
    if (drawerResponseData?.id) {
      const updatedSession = {
        ...userSession,
        drawer_id: drawerResponseData.id,
      };
      dispatch(saveSession(updatedSession));
      localStorage.setItem("session", JSON.stringify(updatedSession));
    }
    setShowOpeningBalance(false);
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {showKeyboard && <Keyboard onSubmit={handleSubmitPin} error={pinError} onClearError={() => setPinError(false)} />}
        <ActionButtons onSignIn={handleSignIn} />

        {/* Liquor Store POS Offline Demo Credentials Helper */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "10px",
            textAlign: "center",
            maxWidth: "460px",
            width: "100%",
          }}
        >
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
            🍸 OFFLINE LIQUOR STORE POS DEMO
          </Box>
          <Box sx={{ fontSize: "12px", color: "#64748b", mb: 1.5 }}>
            • Cashier PIN: <strong>1234</strong> (Click Sign In above or use keypad) <br />
            • Backoffice: <strong>admin@posliquor.com</strong> / <strong>Admin@123</strong>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                handleSubmitPin("1234");
              }}
              sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600 }}
            >
              Quick Cashier (1234)
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => navigate("/backoffice/login")}
              sx={{ textTransform: "none", fontSize: "12px", fontWeight: 600 }}
            >
              Go to Backoffice Login
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Opening Balance Dialog */}
      <OpeningBalanceDialog
        open={showOpeningBalance}
        onClose={() => setShowOpeningBalance(false)}
        onSubmit={handleOpeningBalanceSubmit}
      />
    </Box>
  );
};

export default HomePage;
