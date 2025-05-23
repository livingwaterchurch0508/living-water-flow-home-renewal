import { Metadata } from 'next';
import NewsClient from '@/app/components/news/NewsClient';
import { metadata } from '@/app/[locale]/layout';

async function fetchCommunityById(id: string) {
  if (!id) return null;
  try {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_BASE_URL}/api/communities/${id}`, {
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

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { id } = await searchParams;
  if (!id) {
    return metadata;
  }
  const community = await fetchCommunityById(id);
  if (!community) {
    return metadata;
  }
  // 썸네일 등 커스텀 처리 필요시 여기에 추가
  return {
    title: locale === 'en' ? community.nameEn : community.name,
    description: locale === 'en' ? community.descEn : community.desc,
    openGraph: {
      title: locale === 'en' ? community.nameEn : community.name,
      description: locale === 'en' ? community.descEn : community.desc,
      images: [
        `/api/image?imageName=${community.files?.[0]?.url}0.jpg` ||
          'https://livingwater-church.co.kr/home_banner.png',
      ],
      type: 'website',
    },
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const props = await searchParams;
  // 서버에서 필요한 데이터 fetch (리스트 등은 클라이언트에서 처리)
  const selectedCommunity = props.id ? await fetchCommunityById(props.id) : null;
  return <NewsClient searchParams={props} selectedCommunity={selectedCommunity} />;
}
