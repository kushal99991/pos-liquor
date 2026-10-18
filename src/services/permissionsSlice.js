import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const permissionsSlice = createApi({
  reducerPath: "permissionsApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => ({
        url: "/permissions",
        method: "GET",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const { useGetPermissionsQuery, useLazyGetPermissionsQuery } =
  permissionsSlice;

export default permissionsSlice;







