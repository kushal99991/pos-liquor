import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const itemGroupSlice = createApi({
  reducerPath: "itemGroupSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["ItemGroup"],
  endpoints: (builder) => ({
    // GET /item-groups/ (Get all item groups)
    getItemGroups: builder.query({
      query: (params) => ({
        url: "/item-groups/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["ItemGroup"],
    }),

    // GET /item-groups/{id} (Get item group by ID)
    getItemGroupById: builder.query({
      query: (itemGroupId) => ({
        url: `/item-groups/${itemGroupId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "ItemGroup", id }],
    }),

    // POST /item-groups/ (Create item group)
    createItemGroup: builder.mutation({
      query: (data) => ({
        url: "/item-groups/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["ItemGroup"],
    }),

    // PUT /item-groups/{id} (Update item group)
    updateItemGroup: builder.mutation({
      query: ({ itemGroupId, data }) => ({
        url: `/item-groups/${itemGroupId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { itemGroupId }) => [
        { type: "ItemGroup", id: itemGroupId },
        "ItemGroup",
      ],
    }),

    // DELETE /item-groups/{id} (Delete item group)
    deleteItemGroup: builder.mutation({
      query: (itemGroupId) => ({
        url: `/item-groups/${itemGroupId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, itemGroupId) => [
        { type: "ItemGroup", id: itemGroupId },
        "ItemGroup",
      ],
    }),
  }),
});

export const {
  useGetItemGroupsQuery,
  useLazyGetItemGroupsQuery,
  useGetItemGroupByIdQuery,
  useLazyGetItemGroupByIdQuery,
  useCreateItemGroupMutation,
  useUpdateItemGroupMutation,
  useDeleteItemGroupMutation,
} = itemGroupSlice;
export default itemGroupSlice;

