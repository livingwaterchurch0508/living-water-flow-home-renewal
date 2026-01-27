import { unstable_cache } from 'next/cache';
import { ICommunity } from '@/variables/types/community.types';
import { getBaseUrl } from '@/variables/constants';
import { CACHE_REVALIDATE } from '@/variables/ui-constants';

interface CommunitiesPayload {
  items: ICommunity[];
  total: number;
  totalPages: number;
}

interface CommunitiesResponse {
  status: 'success' | 'error';
  payload: CommunitiesPayload;
}

interface FetchParams {
  page?: number;
  limit?: number;
  type?: number;
}

/**
 * 서버 사이드 소식 데이터 조회 (캐시 없음)
 */
export async function fetchCommunitiesServer({
  page = 1,
  limit = 10,
  type = 0,
}: FetchParams): Promise<CommunitiesPayload> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: String(type),
  });

  const res = await fetch(`${baseUrl}/api/communities?${params}`, {
    next: { revalidate: CACHE_REVALIDATE.COMMUNITIES },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch communities');
  }

  const data: CommunitiesResponse = await res.json();
  return data.payload;
}

/**
 * 캐시된 소식 데이터 조회
 * - 5분간 캐시 유지
 * - type별로 별도 캐시
 */
export const fetchCachedCommunities = unstable_cache(
  async (params: FetchParams) => fetchCommunitiesServer(params),
  ['communities'],
  {
    revalidate: CACHE_REVALIDATE.COMMUNITIES,
    tags: ['communities'],
  }
);

/**
 * 특정 타입의 소식 목록 조회 (캐시됨)
 */
export async function getCommunitiesByType(type: number, limit = 10): Promise<CommunitiesPayload> {
  return fetchCachedCommunities({ page: 1, limit, type });
}