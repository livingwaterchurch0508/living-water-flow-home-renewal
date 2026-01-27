import { unstable_cache } from 'next/cache';
import { ISermon } from '@/variables/types/sermon.types';
import { getBaseUrl } from '@/variables/constants';
import { CACHE_REVALIDATE } from '@/variables/ui-constants';

interface SermonsResponse {
  status: 'success' | 'error';
  payload: {
    items: ISermon[];
    total: number;
    totalPages: number;
  };
}

interface FetchParams {
  page?: number;
  limit?: number;
  type?: number;
}

/**
 * 서버 사이드 설교 데이터 조회 (캐시 없음)
 */
export async function fetchSermonsServer({
  page = 1,
  limit = 10,
  type = 0,
}: FetchParams): Promise<SermonsResponse> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: String(type),
  });

  const res = await fetch(`${baseUrl}/api/sermons?${params}`, {
    next: { revalidate: CACHE_REVALIDATE.SERMONS },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch sermons');
  }

  return res.json();
}

/**
 * 캐시된 설교 데이터 조회
 * - 5분간 캐시 유지
 * - type별로 별도 캐시
 */
export const fetchCachedSermons = unstable_cache(
  async (params: FetchParams) => fetchSermonsServer(params),
  ['sermons'],
  {
    revalidate: CACHE_REVALIDATE.SERMONS,
    tags: ['sermons'],
  }
);

/**
 * 특정 타입의 설교 목록 조회 (캐시됨)
 */
export async function getSermonsByType(type: number, limit = 10): Promise<SermonsResponse> {
  return fetchCachedSermons({ page: 1, limit, type });
}