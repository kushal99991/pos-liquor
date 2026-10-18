import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";

const cartSlice = createApi({
  reducerPath: "cartSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    addToCartItem: builder.mutation({
      query: (data) => {
        return {
          url: "/cart/add",
          method: "POST",
          data,
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    getCartList: builder.query({
      query: () => {
        return {
          url: "/cart/hold/list",
          method: "GET",
        };
      },
      transformResponse: (response) => response, // FastAPI already returns JSON with access_token, user, etc.
      transformErrorResponse,
    }),
    holdCart: builder.mutation({
      query: ({ cartId, remark, discount }) => ({
        url: `/cart/hold/${cartId}`,
        method: "PUT",
        data: { remark, discount },
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    resumeCart: builder.mutation({
      query: ({ cartId }) => ({
        url: `/cart/resume/${cartId}`,
        method: "PUT",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
    voidCart: builder.mutation({
      query: ({ cartId }) => ({
        url: `/cart/void/${cartId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response,
      transformErrorResponse,
    }),
  }),
});

export const { 
  useAddToCartItemMutation, 
  useLazyGetCartListQuery, 
  useGetCartListQuery, 
  useHoldCartMutation, 
  useResumeCartMutation,
  useVoidCartMutation 
} = cartSlice;
export default cartSlice;
