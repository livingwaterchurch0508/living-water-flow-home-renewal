'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { NewspaperIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { CommunityCard } from '@/app/components/cards/CommunityCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useSidebar } from '@/app/components/ui/sidebar';
import { HeroSection } from '@/app/components/layout/hero-section';
import { TabSection } from '@/app/components/layout/tab-section';

import { useInfiniteCommunities } from '@/app/hooks/use-communities';
import { cn } from '@/app/lib/utils';
import { NEWS_TAB } from '@/app/variables/enums';
import { SECTION_WIDTH } from '@/app/variables/constants';

export default function NewsPage() {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || NEWS_TAB.NEWS;
  const selectedId = searchParams.get('id');
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  // 선택된 커뮤니티 데이터를 가져오는 쿼리
  const { data: selectedCommunityData, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ['community', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const response = await fetch(`/api/communities/${selectedId}`);
      if (!response.ok) {
        // 에러 발생 시 URL 파라미터에서 id 제거
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/news?${params.toString()}`);
        return null;
      }
      const data = await response.json();
      if (data.status === 'error' || !data.payload) {
        // 데이터가 없을 때도 URL 파라미터에서 id 제거
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/news?${params.toString()}`);
        return null;
      }
      return data.payload;
    },
    enabled: !!selectedId,
  });

  // Dialog 닫을 때 id 파라미터 제거
  const handleCloseDialog = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    router.push(`/news?${params.toString()}`);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteCommunities({
      limit: 12,
      type: currentType,
    });

  const communities = data?.pages.flatMap((page) => page.payload.items) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen py-10 pb-20 px-2 space-y-16">
      <HeroSection
        title={menuT('News.name')}
        content={menuT('News.content')}
        bg1="from-emerald-500/20"
        bg2="to-teal-500/20"
        bgDark1="dark:from-emerald-500/10"
        bgDark2="dark:to-teal-500/10"
        color1="from-emerald-600"
        color2="to-teal-600"
        colorDark1="dark:from-emerald-400"
        colorDark2="dark:to-teal-400"
        icon={<NewspaperIcon className="w-16 h-16 mb-6 text-emerald-500/80" />}
      />

      <TabSection
        tabs={[
          { id: NEWS_TAB.NEWS, label: menuT('News.service') },
          { id: NEWS_TAB.EVENT, label: menuT('News.event') },
          { id: NEWS_TAB.STORY, label: menuT('News.story') },
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => {
          const params = new URLSearchParams(searchParams);
          params.set('type', tabId.toString());
          router.push(`/news?${params.toString()}`);
        }}
        accentColor="bg-emerald-500"
      />

      <section
        className={cn(
          'transition-[width] duration-200 px-4 sm:px-6',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
        )}
      >
        {isError ? (
          <div className="text-center py-20">
            <p className="text-lg text-red-500 mb-2">{errorT('fetchFailed')}</p>
            <p className="text-sm text-muted-foreground">{error?.message || errorT('tryAgain')}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col bg-card rounded-xl overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-5 w-[85%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {communities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => {
                    setSelectedCommunity(community.id);
                  }}
                  className="cursor-pointer"
                >
                  <CommunityCard
                    name={
                      locale === 'en'
                        ? community.nameEn || community.name || ''
                        : community.name || ''
                    }
                    desc={
                      locale === 'en'
                        ? community.descEn || community.desc || ''
                        : community.desc || ''
                    }
                    url={community.files[0]?.url || ''}
                    createdAt={community.createdAt || ''}
                    caption={Number(community.files[0]?.caption) || 1}
                    autoOpen={selectedCommunity === community.id}
                    onDialogClose={() => {
                      setSelectedCommunity(null);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 무한 스크롤 로딩 인디케이터 */}
            <div ref={observerTarget} className="mt-8">
              {isFetchingNextPage && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col bg-card rounded-xl overflow-hidden">
                      <Skeleton className="w-full aspect-video" />
                      <div className="p-4 space-y-2.5">
                        <Skeleton className="h-5 w-[85%]" />
                        <Skeleton className="h-4 w-[60%]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* 선택된 커뮤니티 Dialog */}
      {selectedId && selectedCommunityData && (
        <>
          {isLoadingCommunity ? (
            <div className="w-full aspect-video bg-card rounded-xl p-8">
              <div className="h-full flex flex-col gap-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="flex-1 w-full" />
              </div>
            </div>
          ) : (
            <CommunityCard
              name={
                locale === 'en'
                  ? selectedCommunityData.nameEn || selectedCommunityData.name
                  : selectedCommunityData.name
              }
              desc={
                locale === 'en'
                  ? selectedCommunityData.descEn || selectedCommunityData.desc
                  : selectedCommunityData.desc
              }
              url={selectedCommunityData.files[0]?.url || ''}
              createdAt={selectedCommunityData.createdAt}
              caption={Number(selectedCommunityData.files[0]?.caption) || 1}
              autoOpen={true}
              onDialogClose={handleCloseDialog}
            />
          )}
        </>
      )}
    </div>
  );
}
