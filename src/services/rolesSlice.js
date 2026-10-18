import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const rolesSlice = createApi({
  reducerPath: "rolesApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Roles"],
  endpoints: (builder) => ({
    // GET /roles/  (Get all roles)
    getRoles: builder.query({
      query: (params) => ({
        url: "/roles/",
        method: "GET",
        params,
      }),
      providesTags: ["Roles"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // GET /roles/filter  (Get Roles by status)
    getRolesByStatus: builder.query({
      query: (params) => ({
        url: "/roles/filter",
        method: "GET",
        params,
      }),
      providesTags: ["Roles"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // GET /roles/{role_id} (Get one role)
    getRoleById: builder.query({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "GET",
      }),
      providesTags: (result, error, roleId) => [{ type: "Roles", id: roleId }],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // POST /roles/ (Create Role)
    createRole: builder.mutation({
      query: (data) => ({
        url: "/roles/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roles"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // PUT /roles/{role_id} (Update Role)
    updateRole: builder.mutation({
      query: ({ roleId, data }) => ({
        url: `/roles/${roleId}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { roleId }) => [
        "Roles",
        { type: "Roles", id: roleId },
      ],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // DELETE /roles/{role_id} (Delete Role)
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, roleId) => [
        "Roles",
        { type: "Roles", id: roleId },
      ],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetRolesQuery,
  useLazyGetRolesQuery,
  useGetRolesByStatusQuery,
  useLazyGetRolesByStatusQuery,
  useGetRoleByIdQuery,
  useLazyGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesSlice;

export default rolesSlice;
