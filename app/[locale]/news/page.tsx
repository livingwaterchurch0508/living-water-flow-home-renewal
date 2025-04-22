'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { NewspaperIcon } from 'lucide-react';

import { CommunityCard } from '@/app/components/cards/CommunityCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useSidebar } from '@/app/components/ui/sidebar';
import { HeroSection } from '@/app/components/hero-section';
import { TabSection } from '@/app/components/ui/tab-section';

import { useInfiniteCommunities } from '@/app/hooks/use-communities';
import { cn } from '@/app/lib/utils';
import { NEWS_TAB } from '@/app/variables/enums';

export default function NewsPage() {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || NEWS_TAB.NEWS;
  const observerTarget = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen py-10 px-2 space-y-16">
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
          { id: NEWS_TAB.STORY, label: menuT('News.story') }
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => router.push(`/news?type=${tabId.toString()}`)}
        accentColor="bg-emerald-500"
      />

      {/* 뉴스 그리드 */}
      <section
        className={cn(
          'transition-[width] duration-200 px-4 sm:px-6',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
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
        ) : communities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {communities.map((community) => (
                <CommunityCard
                  key={community.id}
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
                />
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
    </div>
  );
}
