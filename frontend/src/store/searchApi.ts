import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiErrorSchema, SearchApiResponseSchema } from './schemas';
import type { SearchApiResponse } from './schemas';

type SearchEntityType = 'users' | 'repositories';

export type SearchQueryArgs = {
  type: SearchEntityType;
  search: string;
};

const baseUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!baseUrl) {
  throw new Error('VITE_API_URL is not set');
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  keepUnusedDataFor: 60 * 60,
  endpoints: (builder) => ({
    search: builder.query<SearchApiResponse, SearchQueryArgs>({
      query: ({ type, search }) => ({
        url: '/search',
        method: 'POST',
        body: { type, search },
      }),
      transformResponse: (raw: unknown): SearchApiResponse =>
        SearchApiResponseSchema.parse(raw),
      transformErrorResponse: (response) => {
        const result = ApiErrorSchema.safeParse(response.data);
        if (result.success) {
          return (
            result.data.error ||
            result.data.detail ||
            'Unable to fetch results.'
          );
        }
        return 'Unable to fetch search results right now.';
      },
    }),
  }),
});

export const { useSearchQuery } = searchApi;
