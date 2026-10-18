import apiClient from "api/axios";
import { appConfig } from "config/app.config";
import { handleOfflineApi } from "mocks/mockApiAdapter";

const fetchBaseQuery =
  () =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      // 1. Check offline mock interceptor first
      const offlineResult = await handleOfflineApi({ url, method, data, params, headers });
      if (offlineResult?.handled) {
        if (offlineResult.error) {
          return { error: offlineResult.error };
        }
        return { data: offlineResult.data };
      }

      // 2. Fallback to network if not handled
      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status || 500,
          data: error.response?.data || error.message,
          message: error.response?.data?.detail || error.message,
        },
      };
    }
  };


export const axiosBaseQuery = fetchBaseQuery();
export const baseURL = appConfig.baseUrl;
export default axiosBaseQuery;
