'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpenIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { ContentCard } from '@/app/components/cards/ContentCard';
import { SermonCard } from '@/app/components/cards/SermonCard';
import { useSidebar } from '@/app/components/ui/sidebar';
import { MasonryGrid, MasonryItem } from '@/app/components/magicui/masonry-grid';
import { HeroSection } from '@/app/components/layout/hero-section';
import { TabSection } from '@/app/components/layout/tab-section';

import { useInfiniteSermons } from '@/app/hooks/use-sermons';
import { cn } from '@/app/lib/utils';
import { SERMON_TAB } from '@/app/variables/enums';
import { SECTION_WIDTH } from '@/app/variables/constants';
import { DetailSkeleton } from '@/app/components/ui/DetailSkeleton';
import { ContentListSkeleton } from '@/app/components/ui/ContentListSkeleton';

// URL 파라미터에서 특정 param을 제거하고 /sermons로 push하는 함수
function removeParamAndPush(
  param: string,
  searchParams: URLSearchParams,
  router: unknown,
  basePath: string
) {
  const params = new URLSearchParams(searchParams);
  params.delete(param);
  const paramString = params.toString();
  (router as { push: (url: string) => void }).push(
    paramString ? `${basePath}?${paramString}` : basePath
  );
}

export default function SermonsPage() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') ?? SERMON_TAB.RHEMA.toString();
  const currentTypeNumber = Number(currentType);
  const selectedId = searchParams.get('id');
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedSermon, setSelectedSermon] = useState<{ name: string; desc: string } | null>(null);

  // 선택된 설교 데이터를 가져오는 쿼리
  const { data: selectedSermonData, isLoading: isLoadingSermon } = useQuery({
    queryKey: ['sermon', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      try {
        const response = await fetch(`/api/sermons/${selectedId}`);
        if (!response.ok) {
          removeParamAndPush('id', searchParams, router, '/sermons');
          return null;
        }
        const data = await response.json();
        if (data.status === 'error' || !data.payload) {
          removeParamAndPush('id', searchParams, router, '/sermons');
          return null;
        }
        return data.payload;
      } catch {
        removeParamAndPush('id', searchParams, router, '/sermons');
        return null;
      }
    },
    enabled: !!selectedId,
  });

  // Dialog 닫을 때 id 파라미터 제거
  const handleCloseDialog = () => {
    removeParamAndPush('id', searchParams, router, '/sermons');
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteSermons({
      limit: 12,
      type: currentTypeNumber,
    });

  const sermons = (data?.pages ?? []).flatMap((page) => page.payload.items);

  // sermons 다국어 변환 useMemo 적용
  const sermonsForRender = useMemo(() => {
    return sermons.map((sermon) => ({
      ...sermon,
      name: locale === 'en' ? sermon.nameEn || sermon.name || '' : sermon.name || '',
      desc: locale === 'en' ? sermon.descEn || sermon.desc || '' : sermon.desc || '',
    }));
  }, [sermons, locale]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderContent = () => {
    if (isError) {
      return (
        <div className="text-center py-20">
          <p className="text-lg text-red-500 mb-2">{t('Error.fetchFailed')}</p>
          <p className="text-sm text-muted-foreground">{error?.message || t('Error.tryAgain')}</p>
        </div>
      );
    }

    if (isLoading) {
      return <ContentListSkeleton count={12} />;
    }

    if (sermons.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
        </div>
      );
    }

    if (currentTypeNumber === SERMON_TAB.SOUL) {
      return (
        <>
          <MasonryGrid className="gap-2 sm:gap-3 md:gap-4">
            {sermonsForRender.map((sermon, index) => {
              const contentLength = (sermon.name?.length || 0) + (sermon.desc?.length || 0);
              let span = 6;

              if (contentLength > 200) {
                span = 12;
              } else if (contentLength > 100) {
                span = 9;
              } else if (contentLength < 50) {
                span = 5;
              }

              const gradients = [
                'bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20',
                'bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20',
                'bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20',
                'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20',
              ];
              const gradientClass = gradients[index % gradients.length];

              return (
                <MasonryItem key={sermon.id} span={span}>
                  <button
                    data-testid="sermon-card-button"
                    onClick={() => {
                      // Dialog를 URL 파라미터로만 관리하도록 변경
                      const params = new URLSearchParams(searchParams);
                      params.set('id', String(sermon.id));
                      router.push(`/sermons?${params.toString()}`);
                    }}
                    className={cn(
                      'group relative block h-full w-full p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-300',
                      gradientClass,
                      'hover:shadow-md hover:-translate-y-0.5'
                    )}
                  >
                    <div className="space-y-1 sm:space-y-2 text-left">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight">
                        {sermon.name}
                      </h3>
                      <p className="text-base sm:text-base text-muted-foreground">{sermon.desc}</p>
                    </div>
                  </button>
                </MasonryItem>
              );
            })}
          </MasonryGrid>

          {selectedSermon && (
            <SermonCard
              name={selectedSermon.name}
              desc={selectedSermon.desc}
              autoOpen={true}
              onDialogClose={() => setSelectedSermon(null)}
            />
          )}

          {/* 무한 스크롤 로딩 인디케이터 */}
          <div ref={observerTarget} className="mt-8">
            {isFetchingNextPage && <ContentListSkeleton count={12} />}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {sermonsForRender.map((sermon) => (
            <div key={sermon.id} className="flex flex-col bg-card rounded-xl overflow-hidden">
              <ContentCard
                name={sermon.name}
                desc={sermon.desc}
                url={sermon.url || ''}
                createdAt={sermon.createdAt || ''}
                type="sermon"
              />
            </div>
          ))}
        </div>

        {/* 무한 스크롤 로딩 인디케이터 */}
        <div ref={observerTarget} className="mt-8">
          {isFetchingNextPage && <ContentListSkeleton count={12} />}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen py-10 pb-20 px-2 space-y-16">
      <HeroSection
        title={menuT('Sermon.name')}
        content={menuT('Sermon.content')}
        bg1="from-blue-500/20"
        bg2="to-violet-500/20"
        bgDark1="dark:from-blue-500/10"
        bgDark2="dark:to-violet-500/10"
        color1="from-blue-600"
        color2="to-violet-600"
        colorDark1="dark:from-blue-400"
        colorDark2="dark:to-violet-400"
        icon={<BookOpenIcon className="w-16 h-16 mb-6 text-blue-500/80" />}
      />

      <TabSection
        tabs={[
          { id: SERMON_TAB.RHEMA.toString(), label: menuT('Sermon.sermon') },
          { id: SERMON_TAB.SOUL.toString(), label: menuT('Sermon.soul') },
        ]}
        activeTab={currentType}
        onTabChange={(tabId: string) => {
          const params = new URLSearchParams(searchParams);
          params.set('type', tabId);
          router.push(`/sermons?${params.toString()}`);
        }}
        accentColor="bg-blue-500"
      />

      {/* 설교 콘텐츠 */}
      <section
        className={cn(
          'transition-[width] duration-200 px-4 sm:px-6',
          state === 'expanded' ? SECTION_WIDTH.EXPANDED : SECTION_WIDTH.COLLAPSED
        )}
      >
        {renderContent()}
      </section>

      {/* 선택된 설교 Dialog */}
      {selectedId && selectedSermonData && (
        <>
          {isLoadingSermon ? (
            <DetailSkeleton />
          ) : currentTypeNumber === SERMON_TAB.SOUL ? (
            <SermonCard
              name={
                locale === 'en'
                  ? selectedSermonData.nameEn || selectedSermonData.name
                  : selectedSermonData.name
              }
              desc={
                locale === 'en'
                  ? selectedSermonData.descEn || selectedSermonData.desc
                  : selectedSermonData.desc
              }
              autoOpen={true}
              onDialogClose={handleCloseDialog}
            />
          ) : (
            <ContentCard
              name={
                locale === 'en'
                  ? selectedSermonData.nameEn || selectedSermonData.name
                  : selectedSermonData.name
              }
              desc={
                locale === 'en'
                  ? selectedSermonData.descEn || selectedSermonData.desc
                  : selectedSermonData.desc
              }
              url={selectedSermonData.url}
              createdAt={selectedSermonData.createdAt}
              autoOpen={true}
              onDialogClose={handleCloseDialog}
              type="sermon"
            />
          )}
        </>
      )}
    </div>
  );
}
