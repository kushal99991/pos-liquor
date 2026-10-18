import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const usersSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // GET /users/ (Get all users)
    getUsers: builder.query({
      query: (params) => ({
        url: "/users/",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // GET /users/{user_id} (Get user by ID)
    getUserById: builder.query({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "Users", id: userId }],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // POST /users/ (Create user)
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Users"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // PUT /users/{user_id} (Update user)
    updateUser: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        "Users",
        { type: "Users", id: userId },
      ],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // DELETE /users/{user_id} (Delete user)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),

    // POST /users/bulk-delete (Bulk delete users)
    // Accepts array of user IDs directly: [1, 2, 3]
    bulkDeleteUsers: builder.mutation({
      query: (userIds) => ({
        url: "/users/bulk-delete",
        method: "POST",
        data: Array.isArray(userIds) ? userIds : [userIds], // Ensure it's always an array
      }),
      invalidatesTags: ["Users"],
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = usersSlice;

export default usersSlice;

