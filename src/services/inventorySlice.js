import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const inventorySlice = createApi({
  reducerPath: "inventorySliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        // Pagination
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        // Filters
        if (params.search) queryParams.search = params.search;
        if (params.category) queryParams.category = params.category;
        if (params.sub_category) queryParams.sub_category = params.sub_category;
        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active;
        return {
          url: "/inventory/",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response) => response, // Return response as-is, handle in component
      transformErrorResponse,
      providesTags: ["Inventory"],
    }),
    getInventoryById: builder.query({
      query: (inventoryId) => ({
        url: `/inventory/${inventoryId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    getInventoryHistory: builder.query({
      query: (inventoryId) => ({
        url: `/inventory/${inventoryId}/history`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    exportInventoryHistory: builder.query({
      query: (params) => ({
        url: "/inventory/history/export",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    addInventory: builder.mutation({
      query: (data) => ({
        url: "/inventory/add",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Inventory", "Item"],
    }),
    updateInventory: builder.mutation({
      query: (data) => ({
        url: "/inventory/update",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Inventory", "Item"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useLazyGetInventoryQuery,
  useGetInventoryByIdQuery,
  useLazyGetInventoryByIdQuery,
  useGetInventoryHistoryQuery,
  useLazyGetInventoryHistoryQuery,
  useExportInventoryHistoryQuery,
  useLazyExportInventoryHistoryQuery,
  useAddInventoryMutation,
  useUpdateInventoryMutation,
} = inventorySlice;
export default inventorySlice;
