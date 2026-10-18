import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const itemSlice = createApi({
  reducerPath: "itemSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Item"],
  endpoints: (builder) => ({
    getItems: builder.query({
      query: (params) => ({
        url: "/items/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Item"],
    }),
    getItem: builder.query({
      query: (params) => ({
        url: "/items/item",
        method: "GET",
        params:
          typeof params === "object" && params !== null
            ? params
            : { item_id: params },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    getItemById: builder.query({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Item", id }],
    }),
    createItem: builder.mutation({
      query: (data) => ({
        url: "/items/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Item"],
    }),
    updateItem: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/items/${itemId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { itemId }) => [
        { type: "Item", id: itemId },
        "Item",
      ],
    }),
    deleteItem: builder.mutation({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, itemId) => [
        { type: "Item", id: itemId },
        "Item",
      ],
    }),
    createItemUpc: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/items/${itemId}/upcs`,
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    updateItemUpc: builder.mutation({
      query: ({ upcId, data }) => ({
        url: `/item-upcs/${upcId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    deleteItemUpc: builder.mutation({
      query: (upcId) => ({
        url: `/item-upcs/${upcId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    createItemVariant: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/items/${itemId}/variants`,
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    updateItemVariant: builder.mutation({
      query: ({ variantId, data }) => ({
        url: `/items/variants/${variantId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    deleteItemVariant: builder.mutation({
      query: (variantId) => ({
        url: `/items/variants/${variantId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetItemsQuery,
  useLazyGetItemsQuery,
  useGetItemQuery,
  useLazyGetItemQuery,
  useGetItemByIdQuery,
  useLazyGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useCreateItemUpcMutation,
  useUpdateItemUpcMutation,
  useDeleteItemUpcMutation,
  useCreateItemVariantMutation,
  useUpdateItemVariantMutation,
  useDeleteItemVariantMutation,
} = itemSlice;
export default itemSlice;
