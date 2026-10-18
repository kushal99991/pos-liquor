import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const discountSlice = createApi({
  reducerPath: "discountSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Discount"],
  endpoints: (builder) => ({
    getDiscountList: builder.query({
      query: (params) => ({
        url: "/discounts",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Discount"],
    }),
    getDiscountById: builder.query({
      query: (discountId) => ({
        url: `/discounts/${discountId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Discount", id }],
    }),
    createDiscount: builder.mutation({
      query: (data) => ({
        url: "/discounts",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Discount"],
    }),
    updateDiscount: builder.mutation({
      query: ({ discountId, data }) => ({
        url: `/discounts/${discountId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { discountId }) => [
        { type: "Discount", id: discountId },
        "Discount",
      ],
    }),
    deleteDiscount: builder.mutation({
      query: (discountId) => ({
        url: `/discounts/${discountId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, discountId) => [
        { type: "Discount", id: discountId },
        "Discount",
      ],
    }),
  }),
});

export const {
  useGetDiscountListQuery,
  useLazyGetDiscountListQuery,
  useGetDiscountByIdQuery,
  useLazyGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountSlice;
export default discountSlice;
