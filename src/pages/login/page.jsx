import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";
import { ShoppingCart, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "hooks/useAuth";
import { useLoginMutation } from "services/authSlice";

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [login, {isLoading}] = useLoginMutation();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect when logged in
  // if (isAuthenticated) {
  //   return (
  //     <Navigate
  //       to={user?.role === "admin" ? "/admin" : "/cashier/scan"}
  //       replace
  //     />
  //   );
  // }

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) newErrors.username = "Username is required";
    if (!credentials.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await login(credentials);
      if (result?.error) {
        toast.error(result.error?.message || "Login failed");
        return false;
      }
      toast.success(`Welcome back, ${result.user.name}!`);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Unexpected error occurred");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <ShoppingCart className="text-blue-600" fontSize="large" />
            </div>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Liquor Shop POS
            </Typography>
            <Typography color="text.secondary">Sign in to your account</Typography>
          </div>

          {errors.form && <Alert severity="error">{errors.form}</Alert>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <KeyboardTextField
              fullWidth
              label="Username"
              name="username"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={isLoading}
              margin="normal"
            />

            <KeyboardTextField
              fullWidth
              label="Password"
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              startIcon={<Lock />}
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                backgroundColor: "#2563eb",
                "&:hover": { backgroundColor: "#1d4ed8" },
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up
            </a>
          </Typography>
        </CardContent>
      </Card>
  );
};

export default LoginPage;
