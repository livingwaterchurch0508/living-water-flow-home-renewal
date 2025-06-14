import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { CommunitiesGetResponse } from '@/app/api/communities/route';
import { QueryParams } from '@/app/lib/api-utils';
import { ICommunity } from '@/app/variables/interfaces';

async function fetchCommunities({ page = 1, limit = 1000, type = 0 }: Partial<QueryParams>) {
  try {
    const params = new URLSearchParams();

    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('type', String(type));

    const response = await fetch(`/api/communities?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch communities');
    }

    return response.json() as Promise<CommunitiesGetResponse>;
  } catch (error) {
    console.error('Fetch communities error:', error);
    throw error;
  }
}

interface CommunitiesResponse {
  status: 'success' | 'error';
  payload: {
    items: ICommunity[];
    total: number;
    totalPages: number;
  };
}

interface InfiniteCommunityParams {
  limit: number;
  search?: string;
  type: number;
}

const fetchCommunitiesInfinite = async ({
  pageParam = 1,
  limit,
  search,
  type,
}: InfiniteCommunityParams & { pageParam?: number }): Promise<CommunitiesResponse> => {
  try {
    const params = new URLSearchParams();

    params.append('page', String(pageParam));
    params.append('limit', String(limit));
    params.append('type', String(type));

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`/api/communities?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch communities');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch infinite communities error:', error);
    throw error;
  }
};

export const useInfiniteCommunities = ({ limit, search, type }: InfiniteCommunityParams) => {
  return useInfiniteQuery({
    queryKey: ['communities', search, type],
    queryFn: ({ pageParam }) => fetchCommunitiesInfinite({ pageParam, limit, search, type }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.payload.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

export function useCommunities({ page = 1, limit = 10, type = 0 }: Partial<QueryParams> = {}) {
  return useQuery({
    queryKey: ['communities', { page, limit, type }],
    queryFn: () => fetchCommunities({ page, limit, type }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export { fetchCommunities };
