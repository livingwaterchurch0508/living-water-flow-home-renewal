import { fetchHymnsServer } from '@/app/lib/fetch/hymns.server';
import { fetchSermonsServer } from '@/app/lib/fetch/sermons.server';
import { fetchCommunitiesServer } from '@/app/lib/fetch/communities.server';
import HomeLayout from '../components/layout/home-layout';
import { SERMON_TAB, HYMN_TAB } from '@/app/variables/enums';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // 데이터 패칭
  const hymnsData = await fetchHymnsServer({ limit: 10, type: HYMN_TAB.HYMN });
  const sermonsData = await fetchSermonsServer({ limit: 10 });
  const type1SermonsData = await fetchSermonsServer({ limit: 10, type: SERMON_TAB.SOUL });
  const communitiesData = await fetchCommunitiesServer({ limit: 10 });

  const hymns = hymnsData.status === 'success' ? hymnsData.payload.items : [];
  const sermons = sermonsData.status === 'success' ? sermonsData.payload.items : [];
  const type1Sermons = type1SermonsData.status === 'success' ? type1SermonsData.payload.items : [];
  const communities = communitiesData.status === 'success' ? communitiesData.payload.items : [];

  return (
    <HomeLayout
      locale={locale}
      hymns={hymns}
      sermons={sermons}
      type1Sermons={type1Sermons}
      communities={communities}
    />
  );
}
