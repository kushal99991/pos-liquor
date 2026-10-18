
import { appConfig } from "config/app.config";
import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: appConfig.baseUrl, // Make sure to set this in your .env file
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Add any request interceptors here (e.g., adding auth tokens)
    const token = Cookies.get(appConfig.tokenName);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally here
    const publicUrl = ["/auth/login", "/auth/auth/admin-login", "/auth/auth/cashier-login"];
    if (
      error.response?.status === 401 &&
      !publicUrl.includes(error.response?.config?.url)
    ) {
      localStorage.clear();
      Cookies.remove(appConfig.tokenName);
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    accept: "*/*",
    "X-Tenant-ID": Cookies.get(appConfig.domainName) || "",
    Authorization: `Bearer ${Cookies.get(appConfig.tokenName)}`,
  };
};

export default apiClient;
