import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const cashierDrawerSlice = createApi({
  reducerPath: "cashierDrawerApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    openDrawer: builder.mutation({
      query: (data) => {
        const {temp_access_token, ...rest} = data;
        return {
          url: "/pos/drawer/open",
          method: "POST",
          data: rest,
          headers: {
            "Authorization": `Bearer ${temp_access_token}`
          }
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    getOpenDrawer: builder.query({
      query: () => ({
        url: "/pos/drawer/get-open",
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    getDrawerBalance: builder.query({
      query: (drawer_id) => ({
        url: `/pos/drawer/transaction/balance/${drawer_id}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    createDrawerTransaction: builder.mutation({
      query: (data) => ({
        url: "/pos/drawer/transaction",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    closeDrawer: builder.mutation({
      query: (data) => ({
        url: "/pos/drawer/close",
        method: "POST",
        data: {
          drawer_id: data.drawer_id,
          closing_amount: data.closing_amount,
          cash_collected: data.cash_collected,
          drop_amount: data.drop_amount,
          expected_cash: data.expected_cash,
          difference: data.difference,
        },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const { useOpenDrawerMutation, useGetOpenDrawerQuery, useLazyGetOpenDrawerQuery, useGetDrawerBalanceQuery, useLazyGetDrawerBalanceQuery, useCreateDrawerTransactionMutation, useCloseDrawerMutation } = cashierDrawerSlice;
export default cashierDrawerSlice;
