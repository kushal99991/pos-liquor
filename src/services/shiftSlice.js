import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const shiftSlice = createApi({
  reducerPath: "shiftSliceApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Shift"],
  endpoints: (builder) => ({
    getShiftReport: builder.query({
      query: (params) => ({
        url: "/shifts/report/get-report",
        method: "GET",
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
      providesTags: ["Shift"],
    }),
  }),
});

export const {
  useGetShiftReportQuery,
  useLazyGetShiftReportQuery,
} = shiftSlice;
export default shiftSlice;


