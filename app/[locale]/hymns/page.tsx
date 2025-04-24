'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { MusicIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { ContentCard } from '@/app/components/cards/ContentCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useSidebar } from '@/app/components/ui/sidebar';
import { HeroSection } from '@/app/components/hero-section';
import { TabSection } from '@/app/components/ui/tab-section';

import { useInfiniteHymns } from '@/app/hooks/use-hymns';
import { cn } from '@/app/lib/utils';
import { HYMN_TAB } from '@/app/variables/enums';
import { SECTION_WIDTH } from '@/app/variables/constants';

export default function HymnsPage() {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || HYMN_TAB.HYMN;
  const selectedId = searchParams.get('id');
  const observerTarget = useRef<HTMLDivElement>(null);

  // 선택된 찬양 데이터를 가져오는 쿼리
  const { data: selectedHymnData, isLoading: isLoadingHymn } = useQuery({
    queryKey: ['hymn', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const response = await fetch(`/api/hymns/${selectedId}`);
      if (!response.ok) {
        // 에러 발생 시 URL 파라미터에서 id 제거
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/hymns?${params.toString()}`);
        return null;
      }
      const data = await response.json();
      if (data.status === 'error' || !data.payload) {
        // 데이터가 없을 때도 URL 파라미터에서 id 제거
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/hymns?${params.toString()}`);
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
    router.push(`/hymns?${params.toString()}`);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteHymns({
      limit: 12,
      type: currentType,
    });

  const hymns = data?.pages.flatMap((page) => page.payload.items) ?? [];

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

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', value);
    router.push(`/hymns?${params.toString()}`);
  };

  return (
    <div className="min-h-screen py-10 pb-20 px-2 space-y-16">
      <HeroSection
        title={menuT('Hymn.name')}
        content={menuT('Hymn.content')}
        bg1="from-rose-500/20"
        bg2="to-orange-500/20"
        bgDark1="dark:from-rose-500/10"
        bgDark2="dark:to-orange-500/10"
        color1="from-rose-600"
        color2="to-orange-600"
        colorDark1="dark:from-rose-400"
        colorDark2="dark:to-orange-400"
        icon={<MusicIcon className="w-16 h-16 mb-6 text-rose-500/80" />}
      />

      <TabSection
        tabs={[
          { id: HYMN_TAB.HYMN, label: menuT('Hymn.hymn') },
          { id: HYMN_TAB.SONG, label: menuT('Hymn.song') },
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => handleTabChange(tabId.toString())}
        accentColor="bg-rose-500"
      />

      {/* 찬양 그리드 */}
      <section
        className={cn(
          'transition-[width] duration-200 px-4 sm:px-6',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
        )}
      >
        {isError ? (
          <div className="text-center py-20">
            <p className="text-lg text-red-500 mb-2">{errorT('fetchFailed')}</p>
            <p className="text-sm text-muted-foreground">{error?.message}</p>
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
        ) : hymns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {hymns.map((hymn) => (
                <div key={hymn.id} className="flex flex-col bg-card rounded-xl overflow-hidden">
                  <ContentCard
                    id={hymn.id}
                    name={locale === 'en' ? hymn.nameEn || hymn.name || '' : hymn.name || ''}
                    desc={locale === 'en' ? hymn.descEn || hymn.desc || '' : hymn.desc || ''}
                    url={hymn.url || ''}
                    createdAt={hymn.createdAt || ''}
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

      {/* 선택된 찬양 Dialog */}
      {selectedId && selectedHymnData && (
        <>
          {isLoadingHymn ? (
            <div className="w-full aspect-video bg-card rounded-xl p-8">
              <div className="h-full flex flex-col gap-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="flex-1 w-full" />
              </div>
            </div>
          ) : (
            <ContentCard
              id={selectedHymnData.id}
              name={
                locale === 'en'
                  ? selectedHymnData.nameEn || selectedHymnData.name
                  : selectedHymnData.name
              }
              desc={
                locale === 'en'
                  ? selectedHymnData.descEn || selectedHymnData.desc
                  : selectedHymnData.desc
              }
              url={selectedHymnData.url}
              createdAt={selectedHymnData.createdAt}
              autoOpen={true}
              onDialogClose={handleCloseDialog}
            />
          )}
        </>
      )}
    </div>
  );
}
