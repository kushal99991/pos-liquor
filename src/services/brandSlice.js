import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const brandSlice = createApi({
  reducerPath: "brandSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrandListing: builder.query({
      query: (params) => ({
        url: "/brands/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Brand"],
    }),
    getBrandById: builder.query({
      query: (brandId) => ({
        url: `/brands/${brandId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Brand", id }],
    }),
    createBrand: builder.mutation({
      query: (data) => ({
        url: "/brands/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: ({ brandId, data }) => ({
        url: `/brands/${brandId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { brandId }) => [
        { type: "Brand", id: brandId },
        "Brand",
      ],
    }),
    deleteBrand: builder.mutation({
      query: (brandId) => ({
        url: `/brands/${brandId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, brandId) => [
        { type: "Brand", id: brandId },
        "Brand",
      ],
    }),
  }),
});

export const {
  useGetBrandListingQuery,
  useLazyGetBrandListingQuery,
  useGetBrandByIdQuery,
  useLazyGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandSlice;
export default brandSlice;
