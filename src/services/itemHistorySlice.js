import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const itemHistorySlice = createApi({
  reducerPath: "itemHistorySliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["ItemHistory"],
  endpoints: (builder) => ({
    getItemHistories: builder.query({
      query: (params) => ({
        url: "/inventory-history/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["ItemHistory"],
    }),
    getItemHistoryById: builder.query({
      query: (itemHistoryId) => ({
        url: `/item-histories/${itemHistoryId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "ItemHistory", id }],
    }),
  }),
});

export const {
  useGetItemHistoriesQuery,
  useLazyGetItemHistoriesQuery,
  useGetItemHistoryByIdQuery,
  useLazyGetItemHistoryByIdQuery,
} = itemHistorySlice;
export default itemHistorySlice;

