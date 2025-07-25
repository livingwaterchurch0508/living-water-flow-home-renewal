import { NextResponse } from 'next/server';
import { getSermons } from '@/lib/db/postgres/sermons';
import { getHymns } from '@/lib/db/postgres/hymns';
import { getCommunities } from '@/lib/db/postgres/communities';
import { SERMON_TAB, HYMN_TAB, NEWS_TYPES } from '@/variables/enums';

function getTotal(result: unknown): number {
  return result &&
    typeof result === 'object' &&
    'total' in result &&
    typeof (result as { total: unknown }).total === 'number'
    ? (result as { total: number }).total
    : 0;
}

export async function GET() {
  // 각 타입별 카운트 집계
  const [sermonRhema, sermonSoul, hymnHymn, hymnSong, newsService, newsEvent, newsStory] = await Promise.all([
    getSermons({ limit: 1, offset: 0, type: SERMON_TAB.RHEMA }),
    getSermons({ limit: 1, offset: 0, type: SERMON_TAB.SOUL }),
    getHymns({ limit: 1, offset: 0, type: HYMN_TAB.HYMN }),
    getHymns({ limit: 1, offset: 0, type: HYMN_TAB.SONG }),
    getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.SERVICE }),
    getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.EVENT }),
    getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.STORY }),
  ]);
  const sermonCount = getTotal(sermonRhema) + getTotal(sermonSoul);
  const hymnCount = getTotal(hymnHymn) + getTotal(hymnSong);
  const newsCount = getTotal(newsService) + getTotal(newsEvent) + getTotal(newsStory);
  return NextResponse.json({
    sermonCount,
    hymnCount,
    newsCount,
    sermonRhema: getTotal(sermonRhema),
    sermonSoul: getTotal(sermonSoul),
    hymnHymn: getTotal(hymnHymn),
    hymnSong: getTotal(hymnSong),
    newsService: getTotal(newsService),
    newsEvent: getTotal(newsEvent),
    newsStory: getTotal(newsStory),
  });
} 