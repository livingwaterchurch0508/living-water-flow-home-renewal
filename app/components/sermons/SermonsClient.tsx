'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BookOpenIcon } from 'lucide-react';

import { ContentCard } from '@/components/cards/ContentCard';
import { SermonCard } from '@/components/cards/SermonCard';
import { useSidebar } from '@/components/ui/sidebar';
import { MasonryGrid, MasonryItem } from '@/components/magicui/masonry-grid';
import { HeroSection } from '@/components/layout/hero-section';
import { TabSection } from '@/components/layout/tab-section';
import { ContentListSkeleton } from '@/components/ui/content-list-skeleton';
import { DetailSkeleton } from '@/components/ui/detail-skeleton';
import { MotionEffect } from '@/components/animate-ui/effects/motion-effect';

import { useInfiniteSermons } from '@/hooks/use-sermons';
import { useUrlParams } from '@/hooks/use-url-params';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useSelectedItem } from '@/hooks/use-selected-item';
import { cn } from '@/lib/utils';
import { localizeContentList, localizeContent } from '@/lib/locale-utils';
import { SERMON_TAB } from '@/variables/enums';
import { SECTION_WIDTH } from '@/variables/constants';
import {
  calculateGridSpan,
  SOUL_GRADIENT_MAP,
  SOUL_COLOR_MAP,
  QUERY_DEFAULTS,
  getSoulTypeLabel,
} from '@/variables/ui-constants';
import type { ISermon } from '@/variables/types/sermon.types';

interface SermonsClientProps {
  searchParams: { id?: string; type?: string };
  selectedSermon: ISermon | null;
}

const SermonsClient: React.FC<SermonsClientProps> = ({ searchParams, selectedSermon }) => {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const sermonT = useTranslations('Menu.Sermon');
  const searchT = useTranslations('Search');
  const locale = useLocale();
  const { state } = useSidebar();
  const { removeParam, closeDialog, setParam } = useUrlParams('/sermons');
  const currentType = searchParams.type ?? SERMON_TAB.RHEMA.toString();
  const currentTypeNumber = Number(currentType);
  const selectedId = searchParams.id;
  const [selectedSermonState, setSelectedSermonState] = useState<ISermon | null>(null);

  // 공유 상수 사용
  const typeColorMap = SOUL_COLOR_MAP;
  const typeLabel = (sermonType?: number | null) => getSoulTypeLabel(sermonType ?? null, sermonT);

  // 선택된 설교 데이터를 가져오는 쿼리 (id가 있을 때만)
  const { data: selectedSermonData, isLoading: isLoadingSermon } = useSelectedItem<ISermon>({
    selectedId,
    endpoint: '/api/sermons',
    queryKey: 'sermon',
    onInvalidId: () => removeParam('id'),
    initialData: selectedSermon,
  });

  // searchParams에 id가 없을 때만 state로 다이얼로그 관리
  useEffect(() => {
    if (selectedId) {
      setSelectedSermonState(null);
    }
  }, [selectedId]);

  // Dialog 닫을 때 id 파라미터 제거
  const handleCloseDialog = closeDialog;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteSermons({
      limit: QUERY_DEFAULTS.INFINITE_PAGE_SIZE,
      type: currentTypeNumber,
    });

  const sermons = (data?.pages ?? []).flatMap((page) => page.payload.items);

  // sermons 다국어 변환 useMemo 적용
  const sermonsForRender = useMemo(
    () => localizeContentList(sermons, locale),
    [sermons, locale]
  );

  // 무한 스크롤 훅 사용
  const observerTarget = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

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
            {sermonsForRender.map((sermon) => {
              const contentLength = (sermon.name?.length || 0) + (sermon.desc?.length || 0);
              const span = calculateGridSpan(contentLength);
              const gradientClass = SOUL_GRADIENT_MAP[sermon.viewCount ?? 0];

              return (
                <MasonryItem key={sermon.id} span={span}>
                  <button
                    data-testid="sermon-card-button"
                    onClick={() => setSelectedSermonState(sermon)}
                    aria-label={`${typeLabel(sermon.viewCount)}: ${sermon.name}`}
                    className={cn(
                      'group relative block h-full w-full p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-300',
                      gradientClass,
                      'hover:shadow-md hover:-translate-y-0.5'
                    )}
                  >
                    <div className="space-y-1 sm:space-y-2 text-left">
                      <div className={cn('text-xs mb-2', typeColorMap[sermon.viewCount ?? 0])}>
                        {typeLabel(sermon.viewCount)}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                        {sermon.name}
                      </h3>
                      <p className="text-base sm:text-base">{sermon.desc}</p>
                    </div>
                  </button>
                </MasonryItem>
              );
            })}
          </MasonryGrid>

          {selectedSermonState && !selectedId && (
            <SermonCard
              name={selectedSermonState.name || ''}
              desc={selectedSermonState.desc || ''}
              sermonType={selectedSermonState.viewCount}
              autoOpen={true}
              onDialogClose={() => setSelectedSermonState(null)}
              id={selectedSermonState.id.toString()}
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
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sermonsForRender.map((sermon, index) => (
            <MotionEffect
              key={sermon.id}
              className="cursor-pointer"
              delay={index * 0.05}
              inView
              slide={{ direction: 'up', offset: 20 }}
            >
              <div className="flex flex-col bg-card rounded-xl overflow-hidden h-full">
                <ContentCard
                  name={sermon.name}
                  desc={sermon.desc}
                  url={sermon.url || ''}
                  createdAt={sermon.createdAt || ''}
                  type="sermon"
                  id={sermon.id.toString()}
                />
              </div>
            </MotionEffect>
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
    <div className="min-h-screen py-10 pb-20 px-6">
      <HeroSection
        title={menuT('Sermon.name')}
        content={menuT('Sermon.content')}
        icon={<BookOpenIcon className="w-16 h-16 mb-6 text-blue-500/80" />}
      />

      <TabSection
        tabs={[
          { id: SERMON_TAB.RHEMA.toString(), label: menuT('Sermon.sermon') },
          { id: SERMON_TAB.SOUL.toString(), label: menuT('Sermon.soul') },
        ]}
        activeTab={currentType}
        onTabChange={(tabId: string) => setParam('type', tabId)}
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
      {selectedId && selectedSermonData && (() => {
        const localized = localizeContent(selectedSermonData, locale);
        return isLoadingSermon ? (
          <DetailSkeleton />
        ) : currentTypeNumber === SERMON_TAB.SOUL ? (
          <SermonCard
            name={localized.name}
            desc={localized.desc}
            sermonType={selectedSermonData.viewCount}
            autoOpen={true}
            onDialogClose={handleCloseDialog}
            id={selectedSermonData.id.toString()}
          />
        ) : (
          <ContentCard
            name={localized.name}
            desc={localized.desc}
            url={selectedSermonData.url || ''}
            createdAt={selectedSermonData.createdAt || ''}
            autoOpen={true}
            onDialogClose={handleCloseDialog}
            type="sermon"
            id={selectedSermonData.id.toString()}
          />
        );
      })()}
    </div>
  );
};

export default SermonsClient;
