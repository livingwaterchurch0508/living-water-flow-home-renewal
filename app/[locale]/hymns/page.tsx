import { Metadata } from 'next';
import HymnsClient from '@/components/hymns/HymnsClient';
import { metadata } from '@/pages/layout';
import { YOUTUBE_URL } from '@/variables/constants';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function fetchHymnById(id: string) {
  if (!id) return null;
  try {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_BASE_URL}/api/hymns/${id}`, {
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
  const hymn = await fetchHymnById(id);
  if (!hymn) {
    return metadata;
  }
  const youtubeId = hymn.url || '';
  const thumbnail = youtubeId
    ? `${YOUTUBE_URL.THUMB_NAIL}${youtubeId}/mqdefault.jpg`
    : 'https://livingwater-church.co.kr/home_banner.png';
  // 썸네일 등 커스텀 처리 필요시 여기에 추가
  return {
    title: locale === 'en' ? hymn.nameEn : hymn.name,
    description: locale === 'en' ? hymn.descEn : hymn.desc,
    openGraph: {
      title: locale === 'en' ? hymn.nameEn : hymn.name,
      description: locale === 'en' ? hymn.descEn : hymn.desc,
      images: [thumbnail],
      type: 'website',
    },
  };
}

export default async function HymnsPage({ searchParams }: Props) {
  const props = await searchParams;
  // 서버에서 필요한 데이터 fetch (리스트 등은 클라이언트에서 처리)
  const selectedHymn = props.id ? await fetchHymnById(props.id) : null;
  return <HymnsClient searchParams={props} selectedHymn={selectedHymn} />;
}
