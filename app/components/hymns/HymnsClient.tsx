'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { MusicIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useSidebar } from '@/components/ui/sidebar';
import { HeroSection } from '@/components/layout/hero-section';
import { TabSection } from '@/components/layout/tab-section';
import { ContentCard } from '@/components/cards/ContentCard';
import { ContentListSkeleton } from '@/components/ui/content-list-skeleton';
import { DetailSkeleton } from '@/components/ui/detail-skeleton';
import { MotionEffect } from '@/components/animate-ui/effects/motion-effect';

import { useInfiniteHymns } from '@/hooks/use-hymns';
import { cn } from '@/lib/utils';
import { HYMN_TAB } from '@/variables/enums';
import { SECTION_WIDTH } from '@/variables/constants';
import type { IHymn } from '@/variables/types/hymn.types';

interface HymnsClientProps {
  searchParams: { [key: string]: string | undefined };
  selectedHymn: IHymn | null;
}

// URL 파라미터에서 특정 param을 제거하고 /hymns로 push하는 함수
function removeParamAndPush(
  param: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>
) {
  const params = new URLSearchParams(searchParams);
  params.delete(param);
  router.push(`/hymns?${params.toString()}`, { scroll: false });
}

const HymnsClient: React.FC<HymnsClientProps> = ({ searchParams, selectedHymn }) => {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const nextSearchParams = useSearchParams();
  const currentType = Number(searchParams.type) || HYMN_TAB.HYMN;
  const selectedId = searchParams.id;
  const observerTarget = useRef<HTMLDivElement>(null);

  // 선택된 찬양 데이터를 가져오는 쿼리
  const { data: selectedHymnData, isLoading: isLoadingHymn } = useQuery({
    queryKey: ['hymn', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const response = await fetch(`/api/hymns/${selectedId}`);
      if (!response.ok) {
        removeParamAndPush('id', nextSearchParams, router);
        return null;
      }
      const data = await response.json();
      if (data.status === 'error' || !data.payload) {
        removeParamAndPush('id', nextSearchParams, router);
        return null;
      }
      return data.payload;
    },
    enabled: !!selectedId,
    initialData: selectedHymn || undefined,
  });

  // Dialog 닫을 때 id 파라미터 제거
  const handleCloseDialog = () => {
    removeParamAndPush('id', nextSearchParams, router);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteHymns({
      limit: 12,
      type: currentType,
    });

  const hymns = (data?.pages ?? []).flatMap((page) => page.payload.items);

  const hymnsForRender = useMemo(() => {
    return hymns.map((hymn) => ({
      ...hymn,
      name: locale === 'en' ? hymn.nameEn || hymn.name || '' : hymn.name || '',
      desc: locale === 'en' ? hymn.descEn || hymn.desc || '' : hymn.desc || '',
    }));
  }, [hymns, locale]);

  useEffect(() => {
    if (!observerTarget.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerTarget.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, observerTarget]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(nextSearchParams);
    params.set('type', value);
    router.push(`/hymns?${params.toString()}`);
  };

  return (
    <div className="min-h-screen py-10 pb-20 px-6">
      <HeroSection
        title={menuT('Hymn.name')}
        content={currentType === HYMN_TAB.HYMN ? menuT('Hymn.contentHymn') : menuT('Hymn.content')}
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
            {error?.message ? (
              <p className="text-sm text-muted-foreground">{error.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                알 수 없는 오류가 발생했습니다. 네트워크 상태를 확인하거나, 잠시 후 다시 시도해
                주세요.
              </p>
            )}
          </div>
        ) : isLoading ? (
          <ContentListSkeleton count={12} />
        ) : hymns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="mt-8">
              {hymnsForRender.length > 0 && (
                <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {hymnsForRender.map((hymn, index) => (
                    <MotionEffect
                      key={hymn.id}
                      slide={{ direction: 'up', offset: 20 }}
                      className="cursor-pointer"
                      delay={index * 0.05}
                      inView
                    >
                      <ContentCard
                        name={hymn.name}
                        desc={hymn.desc}
                        url={hymn.url || ''}
                        createdAt={hymn.createdAt || ''}
                        type="hymn"
                        autoOpen={false}
                        onDialogClose={handleCloseDialog}
                        id={hymn.id.toString()}
                      />
                    </MotionEffect>
                  ))}
                </div>
              )}

              {/* 무한 스크롤 로딩 인디케이터 */}
              <div ref={observerTarget} className="mt-8">
                {isFetchingNextPage && <ContentListSkeleton count={12} />}
              </div>
            </div>
          </>
        )}
      </section>

      {/* 선택된 찬양 Dialog */}
      {selectedId && selectedHymnData && (
        <>
          {isLoadingHymn ? (
            <DetailSkeleton />
          ) : (
            <ContentCard
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
              type="hymn"
              id={selectedHymnData.id.toString()}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HymnsClient;
