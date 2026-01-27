import { unstable_cache } from 'next/cache';
import { IHymn } from '@/variables/types/hymn.types';
import { getBaseUrl } from '@/variables/constants';
import { CACHE_REVALIDATE } from '@/variables/ui-constants';

interface HymnsResponse {
  status: 'success' | 'error';
  payload: {
    items: IHymn[];
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
 * 서버 사이드 찬양 데이터 조회 (캐시 없음)
 */
export async function fetchHymnsServer({
  page = 1,
  limit = 10,
  type = 0,
}: FetchParams): Promise<HymnsResponse> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: String(type),
  });

  const res = await fetch(`${baseUrl}/api/hymns?${params}`, {
    next: { revalidate: CACHE_REVALIDATE.HYMNS },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch hymns');
  }

  return res.json();
}

/**
 * 캐시된 찬양 데이터 조회
 * - 5분간 캐시 유지
 * - type별로 별도 캐시
 */
export const fetchCachedHymns = unstable_cache(
  async (params: FetchParams) => fetchHymnsServer(params),
  ['hymns'],
  {
    revalidate: CACHE_REVALIDATE.HYMNS,
    tags: ['hymns'],
  }
);

/**
 * 특정 타입의 찬양 목록 조회 (캐시됨)
 */
export async function getHymnsByType(type: number, limit = 10): Promise<HymnsResponse> {
  return fetchCachedHymns({ page: 1, limit, type });
}