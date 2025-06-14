import { redirect } from 'next/navigation';
import DashboardUI from '@/app/components/admin/DashboardUI';
import { getSermons } from '@/app/lib/db/postgres/sermons';
import { getHymns } from '@/app/lib/db/postgres/hymns';
import { getCommunities } from '@/app/lib/db/postgres/communities';
import { SERMON_TAB, HYMN_TAB, NEWS_TYPES } from '@/app/variables/enums';
import { isAdminAuthenticated } from '@/app/lib/auth';

function getTotal(result: unknown): number {
  return result &&
    typeof result === 'object' &&
    'total' in result &&
    typeof (result as { total: unknown }).total === 'number'
    ? (result as { total: number }).total
    : 0;
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // 관리자 인증을 비동기로 확인합니다.
  if (!(await isAdminAuthenticated())) {
    redirect(`/${locale}/admin/login`);
  }
  // Fetch data for each type
  const [sermonRhema, sermonSoul, hymnHymn, hymnSong, newsService, newsEvent, newsStory] =
    await Promise.all([
      getSermons({ limit: 1, offset: 0, type: SERMON_TAB.RHEMA }),
      getSermons({ limit: 1, offset: 0, type: SERMON_TAB.SOUL }),
      getHymns({ limit: 1, offset: 0, type: HYMN_TAB.HYMN }),
      getHymns({ limit: 1, offset: 0, type: HYMN_TAB.SONG }),
      getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.SERVICE }),
      getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.EVENT }),
      getCommunities({ limit: 1, offset: 0, type: NEWS_TYPES.STORY }),
    ]);
  // Count aggregation
  const sermonCount = getTotal(sermonRhema) + getTotal(sermonSoul);
  const hymnCount = getTotal(hymnHymn) + getTotal(hymnSong);
  const newsCount = getTotal(newsService) + getTotal(newsEvent) + getTotal(newsStory);
  return (
    <DashboardUI
      locale={locale}
      sermonCount={sermonCount}
      hymnCount={hymnCount}
      newsCount={newsCount}
      sermonRhema={getTotal(sermonRhema)}
      sermonSoul={getTotal(sermonSoul)}
      hymnHymn={getTotal(hymnHymn)}
      hymnSong={getTotal(hymnSong)}
      newsService={getTotal(newsService)}
      newsEvent={getTotal(newsEvent)}
      newsStory={getTotal(newsStory)}
    />
  );
}
