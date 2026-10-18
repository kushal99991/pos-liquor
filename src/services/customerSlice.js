import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const customerSlice = createApi({
  reducerPath: "customerSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({
        url: "/customers/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Customer"],
    }),
    getCustomerById: builder.query({
      query: (customerId) => ({
        url: `/customers/${customerId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Customer", id }],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: "/customers/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation({
      query: ({ customerId, data }) => ({
        url: `/customers/${customerId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { customerId }) => [
        { type: "Customer", id: customerId },
        "Customer",
      ],
    }),
    deleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/customers/${customerId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, customerId) => [
        { type: "Customer", id: customerId },
        "Customer",
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerSlice;
export default customerSlice;
