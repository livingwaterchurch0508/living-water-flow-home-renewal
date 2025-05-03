import HomeLayout from '../components/layout/home-layout';
import { getHymns } from '@/app/lib/db/postgres/hymns';
import { HYMN_TAB } from '@/app/variables/enums';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // HeroSection에 필요한 데이터만 SSR에서 패칭 (DB 직접 호출)
  const hymnsData = await getHymns({ limit: 10, offset: 0, type: HYMN_TAB.HYMN });
  const hymns = hymnsData && 'items' in hymnsData ? hymnsData.items : [];
  return <HomeLayout locale={locale} hymns={hymns} />;
}
