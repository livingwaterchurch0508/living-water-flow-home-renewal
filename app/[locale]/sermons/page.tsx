import { Metadata } from 'next';

import SermonsClient from '@/components/sermons/SermonsClient';

import { metadata } from '@/pages/layout';
import { YOUTUBE_URL } from '@/variables/constants';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function fetchSermonById(id: string) {
  if (!id) return null;
  try {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_BASE_URL}/api/sermons/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'error' || !data.payload) return null;
    return data.payload;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { id } = await searchParams;
  if (!id) {
    return metadata;
  }
  const sermon = await fetchSermonById(id);
  if (!sermon) {
    return metadata;
  }
  const youtubeId = sermon.url || '';
  const thumbnail = youtubeId
    ? `${YOUTUBE_URL.THUMB_NAIL}${youtubeId}/mqdefault.jpg`
    : 'https://livingwater-church.co.kr/home_banner.png';

  return {
    title: locale === 'en' ? sermon.nameEn : sermon.name,
    description: locale === 'en' ? sermon.descEn : sermon.desc,
    openGraph: {
      title: locale === 'en' ? sermon.nameEn : sermon.name,
      description: locale === 'en' ? sermon.descEn : sermon.desc,
      images: [thumbnail],
      type: 'website',
    },
  };
}

export default async function SermonsPage({ searchParams }: Props) {
  const props = await searchParams;
  // 서버에서 필요한 데이터 fetch (리스트 등은 클라이언트에서 처리)
  const selectedSermon = props.id ? await fetchSermonById(props.id) : null;
  return <SermonsClient searchParams={props} selectedSermon={selectedSermon} />;
}
