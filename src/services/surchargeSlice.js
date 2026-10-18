import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const surchargeSlice = createApi({
  reducerPath: "surchargeSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Surcharge"],
  endpoints: (builder) => ({
    getSurchargeList: builder.query({
      query: (params) => ({
        url: "/surcharges",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Surcharge"],
    }),
    getSurchargeById: builder.query({
      query: (surchargeId) => ({
        url: `/surcharges/${surchargeId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Surcharge", id }],
    }),
    createSurcharge: builder.mutation({
      query: (data) => ({
        url: "/surcharges",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Surcharge"],
    }),
    updateSurcharge: builder.mutation({
      query: ({ surchargeId, data }) => ({
        url: `/surcharges/${surchargeId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { surchargeId }) => [
        { type: "Surcharge", id: surchargeId },
        "Surcharge",
      ],
    }),
    deleteSurcharge: builder.mutation({
      query: (surchargeId) => ({
        url: `/surcharges/${surchargeId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, surchargeId) => [
        { type: "Surcharge", id: surchargeId },
        "Surcharge",
      ],
    }),
  }),
});

export const {
  useGetSurchargeListQuery,
  useLazyGetSurchargeListQuery,
  useGetSurchargeByIdQuery,
  useLazyGetSurchargeByIdQuery,
  useCreateSurchargeMutation,
  useUpdateSurchargeMutation,
  useDeleteSurchargeMutation,
} = surchargeSlice;
export default surchargeSlice;