import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getContentStats } from '@/lib/db/postgres/stats';
import { CACHE_REVALIDATE } from '@/variables/ui-constants';

/**
 * 캐시된 통계 조회 함수
 * - 60초 동안 캐시 유지
 * - 'admin-stats' 태그로 필요시 수동 무효화 가능
 */
const getCachedStats = unstable_cache(
  async () => getContentStats(),
  ['admin-stats'],
  {
    revalidate: CACHE_REVALIDATE.STATS,
    tags: ['admin-stats'],
  }
);

export async function GET() {
  try {
    const stats = await getCachedStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[STATS_API_ERROR]', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      {
        sermonCount: 0,
        hymnCount: 0,
        newsCount: 0,
        sermonRhema: 0,
        sermonSoul: 0,
        hymnHymn: 0,
        hymnSong: 0,
        newsService: 0,
        newsEvent: 0,
        newsStory: 0,
      },
      { status: 500 }
    );
  }
}