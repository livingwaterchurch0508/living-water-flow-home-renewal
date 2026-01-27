import { sql } from 'drizzle-orm';
import { db } from './dbConnection';
import { sermons, hymns, communities } from './schema';

/**
 * 콘텐츠 통계 타입
 */
export interface ContentStats {
  sermonCount: number;
  hymnCount: number;
  newsCount: number;
  sermonRhema: number;
  sermonSoul: number;
  hymnHymn: number;
  hymnSong: number;
  newsService: number;
  newsEvent: number;
  newsStory: number;
}

/**
 * 모든 콘텐츠의 통계를 단일 쿼리로 조회
 * 기존 7개 쿼리 → 3개 쿼리로 최적화 (각 테이블별 GROUP BY)
 */
export async function getContentStats(): Promise<ContentStats> {
  try {
    // 병렬로 3개 테이블의 통계 조회
    const [sermonStats, hymnStats, communityStats] = await Promise.all([
      // 설교 통계 (type별 GROUP BY)
      db
        .select({
          type: sermons.type,
          count: sql<number>`count(*)::int`,
        })
        .from(sermons)
        .groupBy(sermons.type),

      // 찬양 통계 (type별 GROUP BY)
      db
        .select({
          type: hymns.type,
          count: sql<number>`count(*)::int`,
        })
        .from(hymns)
        .groupBy(hymns.type),

      // 소식 통계 (type별 GROUP BY)
      db
        .select({
          type: communities.type,
          count: sql<number>`count(*)::int`,
        })
        .from(communities)
        .groupBy(communities.type),
    ]);

    // 결과를 맵으로 변환
    const sermonMap = new Map(sermonStats.map((s) => [s.type, s.count]));
    const hymnMap = new Map(hymnStats.map((h) => [h.type, h.count]));
    const communityMap = new Map(communityStats.map((c) => [c.type, c.count]));

    // SERMON_TAB: 0=RHEMA, 1=SOUL
    const sermonRhema = sermonMap.get(0) || 0;
    const sermonSoul = sermonMap.get(1) || 0;

    // HYMN_TAB: 0=HYMN, 1=SONG
    const hymnHymn = hymnMap.get(0) || 0;
    const hymnSong = hymnMap.get(1) || 0;

    // NEWS_TYPES: 0=SERVICE, 1=EVENT, 2=STORY
    const newsService = communityMap.get(0) || 0;
    const newsEvent = communityMap.get(1) || 0;
    const newsStory = communityMap.get(2) || 0;

    return {
      sermonCount: sermonRhema + sermonSoul,
      hymnCount: hymnHymn + hymnSong,
      newsCount: newsService + newsEvent + newsStory,
      sermonRhema,
      sermonSoul,
      hymnHymn,
      hymnSong,
      newsService,
      newsEvent,
      newsStory,
    };
  } catch (error) {
    console.error('[GET_CONTENT_STATS_ERROR]', error instanceof Error ? error.message : 'Unknown error');
    // 에러 시 기본값 반환
    return {
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
    };
  }
}