import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const categorySlice = createApi({
  reducerPath: "categorySliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCateogriesList: builder.query({
      query: (params) => ({
        url: "/categories/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Category"],
    }),
    getCategoryById: builder.query({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/categories/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/categories/${categoryId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { categoryId }) => [
        { type: "Category", id: categoryId },
        "Category",
      ],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, categoryId) => [
        { type: "Category", id: categoryId },
        "Category",
      ],
    }),
  }),
});

export const {
  useGetCateogriesListQuery,
  useLazyGetCateogriesListQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categorySlice;
export default categorySlice;
