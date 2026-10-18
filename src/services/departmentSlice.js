import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const departmentSlice = createApi({
  reducerPath: "departmentSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getDepartmentListing: builder.query({
      query: (params) => ({
        url: "/departments/",
        method: "GET",
        params,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Department"],
    }),
    getDepartmentById: builder.query({
      query: (departmentId) => ({
        url: `/departments/${departmentId}`,
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: "/departments/",
        method: "POST",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation({
      query: ({ departmentId, data }) => ({
        url: `/departments/${departmentId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, { departmentId }) => [
        { type: "Department", id: departmentId },
        "Department",
      ],
    }),
    deleteDepartment: builder.mutation({
      query: (departmentId) => ({
        url: `/departments/${departmentId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      invalidatesTags: (result, error, departmentId) => [
        { type: "Department", id: departmentId },
        "Department",
      ],
    }),
  }),
});

export const {
  useGetDepartmentListingQuery,
  useLazyGetDepartmentListingQuery,
  useGetDepartmentByIdQuery,
  useLazyGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentSlice;
export default departmentSlice;
