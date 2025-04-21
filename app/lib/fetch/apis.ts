import { z } from 'zod';
import { fetchAPI, fetchWithValidation, createQueryString } from './client';
import { QueryParams } from '@/app/lib/api-utils';
import type { SermonsGetResponse } from '@/app/api/sermons/route';
import type { CommunitiesGetResponse } from '@/app/api/communities/route';
import type { HymnsGetResponse } from '@/app/api/hymns/route';

// API endpoints
const API_ENDPOINTS = {
  SERMONS: '/api/sermons',
  COMMUNITIES: '/api/communities',
  HYMNS: '/api/hymns',
  COOKIE: {
    GET: '/api/getCookie',
    SET: '/api/setCookie',
  },
} as const;

// Cookie related types and schemas
const CookieDataSchema = z.object({
  menuTab: z.string(),
  detailTab: z.string().optional(),
});

const CookieResponseSchema = z.object({
  data: CookieDataSchema,
});

export type CookieData = z.infer<typeof CookieDataSchema>;

// Cookie related functions
export async function setMenuCookie(data: CookieData): Promise<void> {
  try {
    await fetchAPI(API_ENDPOINTS.COOKIE.SET, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error('Failed to set cookie:', error);
    throw error;
  }
}

export async function getMenuCookie(): Promise<CookieData | null> {
  try {
    const response = await fetchWithValidation(API_ENDPOINTS.COOKIE.GET, CookieResponseSchema);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cookie:', error);
    return null;
  }
}

// Generic fetch function for paginated data
export async function fetchPaginatedData<T>(
  baseUrl: string,
  params: Partial<QueryParams>
): Promise<T> {
  const queryString = createQueryString({
    page: params.page,
    limit: params.limit,
    type: params.type,
  });

  return fetchAPI<T>(`${baseUrl}${queryString}`);
}

// API specific fetch functions
export const apis = {
  sermons: {
    getAll: (params: Partial<QueryParams>) =>
      fetchPaginatedData<SermonsGetResponse>(API_ENDPOINTS.SERMONS, params),
    getById: (id: number) => fetchAPI<SermonsGetResponse>(`${API_ENDPOINTS.SERMONS}/${id}`),
  },
  communities: {
    getAll: (params: Partial<QueryParams>) =>
      fetchPaginatedData<CommunitiesGetResponse>(API_ENDPOINTS.COMMUNITIES, params),
    getById: (id: number) => fetchAPI<CommunitiesGetResponse>(`${API_ENDPOINTS.COMMUNITIES}/${id}`),
  },
  hymns: {
    getAll: (params: Partial<QueryParams>) =>
      fetchPaginatedData<HymnsGetResponse>(API_ENDPOINTS.HYMNS, params),
    getById: (id: number) => fetchAPI<HymnsGetResponse>(`${API_ENDPOINTS.HYMNS}/${id}`),
  },
};
