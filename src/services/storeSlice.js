import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const storeSlice = createApi({
  reducerPath: "storeApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    storeInstallation: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/store-installation",
          method: "POST",
          data,
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    getActiveStores: builder.query({
      query: () => ({
        url: "/auth/stores/active",
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const { useStoreInstallationMutation, useGetActiveStoresQuery, useLazyGetActiveStoresQuery } = storeSlice;
export default storeSlice;
