'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { NewspaperIcon } from 'lucide-react';

import { MotionEffect } from '@/components/animate-ui/effects/motion-effect';
import { CommunityCard } from '@/components/cards/CommunityCard';
import { useSidebar } from '@/components/ui/sidebar';
import { HeroSection } from '@/components/layout/hero-section';
import { TabSection } from '@/components/layout/tab-section';
import { ContentListSkeleton } from '@/components/ui/content-list-skeleton';
import { DetailSkeleton } from '@/components/ui/detail-skeleton';

import { useInfiniteCommunities } from '@/hooks/use-communities';
import { useUrlParams } from '@/hooks/use-url-params';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useSelectedItem } from '@/hooks/use-selected-item';
import { cn } from '@/lib/utils';
import { localizeContentList, localizeContent } from '@/lib/locale-utils';
import { NEWS_TYPES } from '@/variables/enums';
import { SECTION_WIDTH } from '@/variables/constants';
import { ICommunity } from '@/variables/types/community.types';

interface NewsClientProps {
  searchParams: { [key: string]: string | undefined };
  selectedCommunity: ICommunity | null;
}

const NewsClient: React.FC<NewsClientProps> = ({ searchParams, selectedCommunity }) => {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
  const { state } = useSidebar();
  const { removeParam, closeDialog, setParam } = useUrlParams('/news');
  const currentType = Number(searchParams.type) || NEWS_TYPES.SERVICE;
  const selectedId = searchParams.id;
  const [selectedCommunityState, setSelectedCommunityState] = useState<number | null>(null);

  // 선택된 커뮤니티 데이터를 가져오는 쿼리 (id가 있을 때만)
  const { data: selectedCommunityData, isLoading: isLoadingCommunity } = useSelectedItem<ICommunity>({
    selectedId,
    endpoint: '/api/communities',
    queryKey: 'community',
    onInvalidId: () => removeParam('id'),
    initialData: selectedCommunity,
  });

  // Dialog 닫을 때 id 파라미터 제거
  const handleCloseDialog = closeDialog;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteCommunities({
      limit: 12,
      type: currentType,
    });

  const communities = (data?.pages ?? []).flatMap((page) => page.payload.items);

  // communities 다국어 변환 useMemo 적용
  const communitiesForRender = useMemo(
    () => localizeContentList(communities, locale),
    [communities, locale]
  );

  // 무한 스크롤 훅 사용
  const observerTarget = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="min-h-screen py-10 pb-20 px-6">
      <HeroSection
        title={menuT('News.name')}
        content={menuT('News.content')}
        icon={<NewspaperIcon className="w-16 h-16 mb-6 text-emerald-500/80" />}
      />

      <TabSection
        tabs={[
          { id: NEWS_TYPES.SERVICE, label: menuT('News.service') },
          { id: NEWS_TYPES.EVENT, label: menuT('News.event') },
          { id: NEWS_TYPES.STORY, label: menuT('News.story') },
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => setParam('type', tabId.toString())}
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
          <ContentListSkeleton count={12} />
        ) : communities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {communitiesForRender.map((community, index) => (
                <MotionEffect
                  key={community.id}
                  className="cursor-pointer"
                  delay={index * 0.05}
                  inView
                  onClick={() => {
                    setSelectedCommunityState(community.id);
                  }}
                  slide={{ direction: 'up', offset: 20 }}
                >
                  <CommunityCard
                    name={community.name}
                    desc={community.desc}
                    url={community.files[0]?.url || ''}
                    createdAt={community.createdAt || ''}
                    caption={Number(community.files[0]?.caption) || 1}
                    autoOpen={selectedCommunityState === community.id}
                    onDialogClose={() => {
                      setSelectedCommunityState(null);
                    }}
                    id={community.id.toString()}
                  />
                </MotionEffect>
              ))}
            </div>

            {/* 무한 스크롤 로딩 인디케이터 */}
            <div ref={observerTarget} className="mt-8">
              {isFetchingNextPage && <ContentListSkeleton count={12} />}
            </div>
          </>
        )}
      </section>

      {/* 선택된 커뮤니티 Dialog */}
      {selectedId && selectedCommunityData && (() => {
        const localized = localizeContent(selectedCommunityData, locale);
        return isLoadingCommunity ? (
          <DetailSkeleton />
        ) : (
          <CommunityCard
            name={localized.name}
            desc={localized.desc}
            url={selectedCommunityData.files[0]?.url || ''}
            createdAt={selectedCommunityData.createdAt || ''}
            caption={Number(selectedCommunityData.files[0]?.caption) || 1}
            autoOpen={true}
            onDialogClose={handleCloseDialog}
            id={selectedCommunityData.id.toString()}
          />
        );
      })()}
    </div>
  );
};

export default NewsClient;
