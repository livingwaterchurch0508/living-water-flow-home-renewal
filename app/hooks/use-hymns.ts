import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { HymnsGetResponse } from '@/api/hymns/route';
import { QueryParams } from '@/lib/api-utils';
import { IHymn } from '@/variables/types/hymn.types';

async function fetchHymns({ page = 1, limit = 1000, type = 0 }: Partial<QueryParams>) {
  try {
    const params = new URLSearchParams();

    // 모든 파라미터를 숫자로 변환하여 추가
    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('type', String(type));

    const response = await fetch(`/api/hymns?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch hymns');
    }

    return response.json() as Promise<HymnsGetResponse>;
  } catch (error) {
    console.error('Fetch hymns error:', error);
    throw error;
  }
}

interface HymnsResponse {
  status: 'success' | 'error';
  payload: {
    items: IHymn[];
    total: number;
    totalPages: number;
  };
}

interface InfiniteHymnParams {
  limit: number;
  search?: string;
  type: number;
}

const fetchHymnsInfinite = async ({
  pageParam = 1,
  limit,
  search,
  type,
}: InfiniteHymnParams & { pageParam?: number }): Promise<HymnsResponse> => {
  try {
    const params = new URLSearchParams();

    // 모든 파라미터를 문자열로 변환하여 추가
    params.append('page', String(pageParam));
    params.append('limit', String(limit));
    params.append('type', String(type));

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`/api/hymns?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch hymns');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch infinite hymns error:', error);
    return { status: 'error', payload: { items: [], total: 0, totalPages: 0 } };
  }
};

export const useInfiniteHymns = ({ limit, search, type }: InfiniteHymnParams) => {
  return useInfiniteQuery({
    queryKey: ['hymns', search, type],
    queryFn: ({ pageParam }) => fetchHymnsInfinite({ pageParam, limit, search, type }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.payload.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};
export function useHymns({ page = 1, limit = 10, type = 0 }: Partial<QueryParams> = {}) {
  return useQuery({
    queryKey: ['hymns', { page, limit, type }],
    queryFn: () => fetchHymns({ page, limit, type }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export { fetchHymns };
