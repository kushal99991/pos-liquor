import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const authSlice = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        return {
          url: "/auth/login",
          method: "POST",
          data: {
            username: credentials.username,
            password: credentials.password,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(credentials.domain && { "X-Tenant-ID": credentials.domain }), // optional tenant header
          },
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    cashieLogin: builder.mutation({
      query: (credentials) => {
        const formData = new FormData();
        formData.append('pin', credentials.pin)
        return {
          url: "/auth/auth/cashier-login",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    adminLogin: builder.mutation({
      query: (credentials) => {
        return {
          url: "/auth/auth/admin-login",
          method: "POST",
          data: {
            email: credentials.email,
            password: credentials.password,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    whoAmI: builder.mutation({
      query: () => ({
        url: "/auth/whoami",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useCashieLoginMutation, useAdminLoginMutation, useWhoAmIMutation } = authSlice;
export default authSlice;
