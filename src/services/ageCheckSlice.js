import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const ageCheckSlice = createApi({
  reducerPath: "ageCheckSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    verifyAge: builder.mutation({
      query: (data) => {
        return {
          url: "/age-check/verify-age",
          method: "POST", 
          data,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
  }),
});

export const { useVerifyAgeMutation } = ageCheckSlice;
export default ageCheckSlice;
