import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const subCategorySlice = createApi({
  reducerPath: "subCategorySliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["SubCategory"],
  endpoints: (builder) => ({
    getSubCategories: builder.query({
      query: (params) => ({
        url: "/categories/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["SubCategory"],
    }),
    getSubCategoryById: builder.query({
      query: (subCategoryId) => ({
        url: `/categories/${subCategoryId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "SubCategory", id }],
    }),
    createSubCategory: builder.mutation({
      query: (data) => ({
        url: "/categories/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["SubCategory", "Category"],
    }),
    updateSubCategory: builder.mutation({
      query: ({ subCategoryId, data }) => ({
        url: `/categories/${subCategoryId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { subCategoryId }) => [
        { type: "SubCategory", id: subCategoryId },
        "SubCategory",
        "Category",
      ],
    }),
    deleteSubCategory: builder.mutation({
      query: (subCategoryId) => ({
        url: `/categories/${subCategoryId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, subCategoryId) => [
        { type: "SubCategory", id: subCategoryId },
        "SubCategory",
        "Category",
      ],
    }),
  }),
});

export const {
  useGetSubCategoriesQuery,
  useLazyGetSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useLazyGetSubCategoryByIdQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} = subCategorySlice;
export default subCategorySlice;

