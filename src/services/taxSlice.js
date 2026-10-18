import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const taxSlice = createApi({
  reducerPath: "taxSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getTaxesList: builder.query({
      query: () => {
        return {
          url: "/taxes/",
          method: "GET",
        };
      },
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    getItemTaxes: builder.query({
      query: (itemId) => {
        return {
          url: `/taxes/item/${itemId}`,
          method: "GET",
        };
      },
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    bulkUpdateItemTaxes: builder.mutation({
      query: (data) => {
        return {
          url: "/taxes/item/bulk",
          method: "PUT",
          data,
        };
      },
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const { 
  useGetTaxesListQuery, 
  useGetItemTaxesQuery,
  useLazyGetItemTaxesQuery,
  useBulkUpdateItemTaxesMutation,
} = taxSlice;
export default taxSlice;

