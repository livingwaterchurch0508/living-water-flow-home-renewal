import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { SermonsGetResponse } from '@/app/api/sermons/route';
import { QueryParams } from '@/app/lib/api-utils';
import { ISermon } from '@/app/variables/interfaces';

async function fetchSermons({ page = 1, limit = 1000, type = 0 }: Partial<QueryParams>) {
  try {
    const params = new URLSearchParams();

    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('type', String(type));

    const response = await fetch(`/api/sermons?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sermons');
    }

    return response.json() as Promise<SermonsGetResponse>;
  } catch (error) {
    console.error('Fetch sermons error:', error);
    throw error;
  }
}

interface SermonsResponse {
  status: 'success' | 'error';
  payload: {
    items: ISermon[];
    total: number;
    totalPages: number;
  };
}

interface InfiniteSermonParams {
  limit: number;
  search?: string;
  type: number;
}

const fetchSermonsInfinite = async ({
  pageParam = 1,
  limit,
  search,
  type,
}: InfiniteSermonParams & { pageParam?: number }): Promise<SermonsResponse> => {
  try {
    const params = new URLSearchParams();

    params.append('page', String(pageParam));
    params.append('limit', String(limit));
    params.append('type', String(type));

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`/api/sermons?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sermons');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch infinite sermons error:', error);
     throw error;
  }
};

export const useInfiniteSermons = ({ limit, search, type }: InfiniteSermonParams) => {
  return useInfiniteQuery({
    queryKey: ['sermons', search, type],
    queryFn: ({ pageParam }) => fetchSermonsInfinite({ pageParam, limit, search, type }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.payload.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

export function useSermons({ page = 1, limit = 10, type = 0 }: Partial<QueryParams> = {}) {
  return useQuery({
    queryKey: ['sermons', { page, limit, type }],
    queryFn: () => fetchSermons({ page, limit, type }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export { fetchSermons };
