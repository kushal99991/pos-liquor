import React, { useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography, IconButton, InputAdornment, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Lock, Visibility, VisibilityOff, Settings as SettingsIcon } from "@mui/icons-material";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import toast from "react-hot-toast";
import { useAdminLoginMutation } from "services/authSlice";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";
import { saveSession } from "store/slice/auth.slice";

import loginBG from "../../../assets/images/backoffice/backoffice-login-bg.jpg";
import userImage from "../../../assets/images/backoffice/user.png";
import { KeyboardTextField } from "components/elements";
import SettingsDrawer from "components/ui/SettingsDrawer/SettingsDrawer";


const CustomTextField = styled(KeyboardTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    paddingLeft: "4px",
    "& fieldset": { border: "none" },
    borderBottom: "2px solid #c4c4c4",
    borderRadius: 0,
    "&:hover": { borderBottomColor: "#9e9e9e" },
    "&.Mui-focused": { borderBottomColor: theme.palette.primary.main },
    "&.Mui-error": { borderBottomColor: theme.palette.error.main },
  },
  "& .MuiInputBase-input": { paddingLeft: "4px" },
}));

const LoginPage = () => {
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email.trim())
      newErrors.email = "Email is required";
    if (!credentials.password.trim())
      newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error) => {
    if (!error?.error) return "Authentication failed";

    // RTK Query error structure: { error: { data: { detail: "..." }, message: "..." } }
    const errorData = error.error.data;
    const errorMessage = errorData?.detail || error.error?.message || "Authentication failed";

    // Parse error message to provide user-friendly messages
    if (typeof errorMessage === "string") {
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes("email") || lowerMessage.includes("username") || lowerMessage.includes("user")) {
        return "Email incorrect";
      }
      if (lowerMessage.includes("password")) {
        return "Password incorrect";
      }
      if (lowerMessage.includes("invalid") || lowerMessage.includes("incorrect") || lowerMessage.includes("wrong")) {
        return "Invalid email or password";
      }
      if (lowerMessage.includes("credentials") || lowerMessage.includes("authentication") || lowerMessage.includes("unauthorized")) {
        return "Authentication failed";
      }
      // Return original message if it's already user-friendly
      return errorMessage;
    }

    // Handle array of error details (FastAPI validation errors)
    if (Array.isArray(errorMessage)) {
      const emailError = errorMessage.find((e) => 
        e.loc?.includes("email") || 
        e.loc?.includes("username") || 
        e.msg?.toLowerCase().includes("email") ||
        e.msg?.toLowerCase().includes("username")
      );
      const passwordError = errorMessage.find((e) => 
        e.loc?.includes("password") || 
        e.msg?.toLowerCase().includes("password")
      );
      
      if (emailError) return "Email incorrect";
      if (passwordError) return "Password incorrect";
      return "Authentication failed";
    }

    // Handle array in errorData.detail
    if (Array.isArray(errorData?.detail)) {
      const emailError = errorData.detail.find((e) => 
        e.loc?.includes("email") || 
        e.loc?.includes("username") || 
        e.msg?.toLowerCase().includes("email")
      );
      const passwordError = errorData.detail.find((e) => 
        e.loc?.includes("password") || 
        e.msg?.toLowerCase().includes("password")
      );
      
      if (emailError) return "Email incorrect";
      if (passwordError) return "Password incorrect";
      return "Authentication failed";
    }

    return "Authentication failed";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Clear previous errors
    setErrors({});

    try {
      const result = await adminLogin({
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        const errorMessage = getErrorMessage(result);
        setErrors({ form: errorMessage });
        return;
      }

      // Set cookie with access token
      const accessToken = result.data.access_token;
      // If remember me is checked, set cookie for 30 days, otherwise 1 day
      const cookieExpiration = rememberMe ? 30 : 1;
      Cookies.set(appConfig.tokenName, accessToken, { expires: cookieExpiration });

      // Save user session
      const userData = result.data.user;
      const userSession = {
        id: userData?.id,
        name: userData?.name,
        email: userData?.email,
        store_id: userData?.store_id,
        roles: userData?.roles || [],
        token: accessToken,
      };
      dispatch(saveSession(userSession));
      localStorage.setItem("session", JSON.stringify(userSession));

      toast.success(`Welcome back, ${userData?.name || "Admin"}!`);
      navigate("/backoffice/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ form: "Authentication failed" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev, [name]: "" };
      // Clear form error when user starts typing
      if (prev.form) {
        delete newErrors.form;
      }
      return newErrors;
    });
  };

  const handleOpenSettings = () => {
    setSettingsDrawerOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDrawerOpen(false);
  };

  return (
    <>
      <Box sx={{ backgroundImage: `url(${loginBG})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", }} className="h-screen w-full flex items-center justify-center p-4">
        {/* Settings Icon Button - Fixed Position */}
        <IconButton
          onClick={handleOpenSettings}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "#6b7280",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
            zIndex: 1000,
          }}
        >
          <SettingsIcon />
        </IconButton>

        <Card
          className="max-w-3xl flex flex-wrap"
          elevation={12}
          sx={{
            width: "100%",
            borderRadius: 4,
          }}
        >
          <Box className="w-full md:w-1/2 max-w-full">
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box className="text-left mb-6">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  className="text-3xl font-bold text-gray-800 mb-6"
                >
                  Glory<span className="text-red-500">POS</span>
                </Typography>
              </Box>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <CustomTextField
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PermIdentityIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <CustomTextField
                  fullWidth
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isLoading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlineIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox 
                      color="primary" 
                      name="remember" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Remember me"
                  sx={{ mt: 1 }}
                />

                <Box className="block text-center">
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    startIcon={<Lock />}
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      px: 4,
                      fontWeight: "bold",
                      display: "inline-block ",
                      width: "auto",
                      backgroundColor: "#c0707d",
                      borderRadius: "50px",
                      "&:hover": { backgroundColor: "#ac4858" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  {errors.form && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 2, 
                        borderRadius: 1,
                        "& .MuiAlert-message": {
                          width: "100%",
                          textAlign: "center",
                        }
                      }}
                    >
                      {errors.form}
                    </Alert>
                  )}
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f1f5f9", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 1 }}>
                      Demo: <strong>admin@posliquor.com</strong> / <strong>Admin@123</strong>
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setCredentials({
                          email: "admin@posliquor.com",
                          password: "Admin@123",
                        });
                        setErrors({});
                      }}
                      sx={{ fontSize: "11px", textTransform: "none", py: 0.2 }}
                    >
                      Fill Demo Credentials
                    </Button>
                  </Box>
                </Box>
              </form>

              {/* Footer */}
              <Box className="flex justify-between mt-6">
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  <a
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Back to Dashboard
                  </a>
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  <a
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Forgot Password?
                  </a>
                </Typography>                
              </Box>
            </CardContent>
          </Box>

          <Box className="hidden md:flex w-1/2 items-center justify-center p-6">
            <img
              src={userImage}
              className="max-w-full w-auto h-auto"
              alt="login"
            />
          </Box>
        </Card>
      </Box>

      {/* Settings Drawer */}
      <SettingsDrawer 
        open={settingsDrawerOpen} 
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default LoginPage;
