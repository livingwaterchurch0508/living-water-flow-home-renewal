import HomeLayout from '../components/layout/home-layout';
import { fetchHymnsServer } from '@/app/lib/fetch/hymns.server';
import { HYMN_TAB } from '@/app/variables/enums';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // HeroSection에 필요한 데이터만 SSR에서 패칭
  const hymnsData = await fetchHymnsServer({ limit: 10, type: HYMN_TAB.HYMN });
  const hymns = hymnsData.status === 'success' ? hymnsData.payload.items : [];
  return <HomeLayout locale={locale} hymns={hymns} />;
}
