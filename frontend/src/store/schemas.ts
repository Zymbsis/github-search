import { z } from 'zod';

export const GithubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  avatar_url: z.url(),
  html_url: z.url(),
  score: z.number(),
  location: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  entity: z.literal('user').optional().default('user'),
});

export const GithubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  score: z.number(),
  stargazers_count: z.number(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
    html_url: z.string(),
  }),
  entity: z.literal('repository').optional().default('repository'),
});

export const SearchApiResponseSchema = z.object({
  data: z.object({
    total_count: z.number(),
    items: z.array(GithubUserSchema.or(GithubRepositorySchema)),
  }),
});

export const ApiErrorSchema = z.object({
  error: z.string().optional(),
  detail: z.string().optional(),
});

export type GithubUser = z.infer<typeof GithubUserSchema>;
export type GithubRepository = z.infer<typeof GithubRepositorySchema>;
export type SearchApiResponse = z.infer<typeof SearchApiResponseSchema>;
