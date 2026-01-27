import { useQuery, useInfiniteQuery, UseQueryResult, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { QueryParams } from '@/lib/api-utils';

// ============================================
// 타입 정의
// ============================================

interface PaginatedPayload<T> {
  items: T[];
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  payload: PaginatedPayload<T>;
}

interface InfiniteQueryParams {
  limit: number;
  search?: string;
  type: number;
}

interface FetchParams extends Partial<QueryParams> {
  pageParam?: number;
}

// ============================================
// 상수
// ============================================

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5분
const DEFAULT_LIMIT = 1000;

// ============================================
// 공통 fetch 함수 생성기
// ============================================

function createFetcher<T>(endpoint: string) {
  return async ({
    page = 1,
    limit = DEFAULT_LIMIT,
    type = 0,
    search,
  }: FetchParams): Promise<ApiResponse<T>> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('type', String(type));

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`/api/${endpoint}?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch ${endpoint}`);
    }

    return response.json();
  };
}

// ============================================
// 공통 훅 팩토리
// ============================================

interface CreateDataHooksOptions {
  endpoint: string;
  queryKey: string;
}

interface DataHooks<T> {
  useData: (params?: Partial<QueryParams>) => UseQueryResult<ApiResponse<T>, Error>;
  useInfiniteData: (params: InfiniteQueryParams) => UseInfiniteQueryResult<InfiniteData<ApiResponse<T>>, Error>;
  fetchData: (params: FetchParams) => Promise<ApiResponse<T>>;
}

export function createDataHooks<T>({ endpoint, queryKey }: CreateDataHooksOptions): DataHooks<T> {
  const fetchData = createFetcher<T>(endpoint);

  const useData = ({ page = 1, limit = 10, type = 0 }: Partial<QueryParams> = {}) => {
    return useQuery({
      queryKey: [queryKey, { page, limit, type }],
      queryFn: () => fetchData({ page, limit, type }),
      staleTime: DEFAULT_STALE_TIME,
    });
  };

  const useInfiniteData = ({ limit, search, type }: InfiniteQueryParams) => {
    return useInfiniteQuery({
      queryKey: [queryKey, search, type],
      queryFn: ({ pageParam }) => fetchData({ page: pageParam, limit, search, type }),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return nextPage <= lastPage.payload.totalPages ? nextPage : undefined;
      },
      initialPageParam: 1,
    });
  };

  return {
    useData,
    useInfiniteData,
    fetchData,
  };
}

// ============================================
// 사전 정의된 훅
// ============================================

import { ISermon } from '@/variables/types/sermon.types';
import { IHymn } from '@/variables/types/hymn.types';
import { ICommunity } from '@/variables/types/community.types';

// Sermons
export const {
  useData: useSermonsData,
  useInfiniteData: useInfiniteSermonsData,
  fetchData: fetchSermonsData,
} = createDataHooks<ISermon>({ endpoint: 'sermons', queryKey: 'sermons' });

// Hymns
export const {
  useData: useHymnsData,
  useInfiniteData: useInfiniteHymnsData,
  fetchData: fetchHymnsData,
} = createDataHooks<IHymn>({ endpoint: 'hymns', queryKey: 'hymns' });

// Communities
export const {
  useData: useCommunitiesData,
  useInfiniteData: useInfiniteCommunitiesData,
  fetchData: fetchCommunitiesData,
} = createDataHooks<ICommunity>({ endpoint: 'communities', queryKey: 'communities' });