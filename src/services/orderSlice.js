import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const orderSlice = createApi({
  reducerPath: "orderSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => {
        console.log("--- ORDER_SLICE: createOrder Payload ---", JSON.stringify(data, null, 2));
        return {
          url: "/orders/",
          method: "POST",
          data
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    getOrders: builder.query({
      query: (params) => ({
        url: "/orders/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    getEndShiftReport: builder.query({
      query: (params) => ({
        url: "/shifts/end-shift-report",
        method: "GET",
        params: {
          start_datetime: params.start_datetime,
          end_datetime: params.end_datetime,
          store_id: params.store_id,
        },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    endShift: builder.mutation({
      query: (data) => ({
        url: "/shifts/end-shift",
        method: "POST",
        data: {
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          store_id: data.store_id,
        },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    createReturn: builder.mutation({
      query: (data) => ({
        url: "/orders/return",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useLazyGetOrdersQuery,
  useLazyGetEndShiftReportQuery,
  useEndShiftMutation,
  useCreateReturnMutation,
} = orderSlice;
export default orderSlice;
