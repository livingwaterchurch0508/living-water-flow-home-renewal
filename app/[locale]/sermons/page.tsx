'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpenIcon } from 'lucide-react';

import { ContentCard } from '@/app/components/cards/ContentCard';
import { SermonCard } from '@/app/components/cards/SermonCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useSidebar } from '@/app/components/ui/sidebar';
import { MasonryGrid, MasonryItem } from '@/app/components/masonry/masonry-grid';
import { HeroSection } from '@/app/components/hero-section';
import { TabSection } from '@/app/components/ui/tab-section';

import { useInfiniteSermons } from '@/app/hooks/use-sermons';
import { cn } from '@/app/lib/utils';
import { SERMON_TAB } from '@/app/variables/enums';

export default function SermonsPage() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const locale = useLocale();
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || SERMON_TAB.RHEMA;
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedSermon, setSelectedSermon] = useState<{ name: string; desc: string } | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteSermons({
      limit: 12,
      type: currentType,
    });

  const sermons = data?.pages.flatMap((page) => page.payload.items) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const LoadingSkeleton = () => {
    if (currentType === SERMON_TAB.SOUL) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="space-y-2 p-6 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    return (
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
    );
  };

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
      return <LoadingSkeleton />;
    }

    if (sermons.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">{searchT('noResults')}</p>
        </div>
      );
    }

    if (currentType === SERMON_TAB.SOUL) {
      return (
        <>
          <MasonryGrid className="gap-2 sm:gap-3 md:gap-4">
            {sermons.map((sermon, index) => {
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

              const name = locale === 'en' ? sermon.nameEn || sermon.name || '' : sermon.name || '';
              const desc = locale === 'en' ? sermon.descEn || sermon.desc || '' : sermon.desc || '';

              return (
                <MasonryItem key={sermon.id} span={span}>
                  <button
                    onClick={() => setSelectedSermon({ name, desc })}
                    className={cn(
                      'group relative block h-full w-full p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-300',
                      gradientClass,
                      'hover:shadow-md hover:-translate-y-0.5'
                    )}
                  >
                    <div className="space-y-1 sm:space-y-2 text-left">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight">
                        {name}
                      </h3>
                      <p className="text-base sm:text-base text-muted-foreground">{desc}</p>
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
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="space-y-2 p-6 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                  >
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {sermons.map((sermon) => (
            <div key={sermon.id} className="flex flex-col bg-card rounded-xl overflow-hidden">
              <ContentCard
                id={sermon.id}
                name={locale === 'en' ? sermon.nameEn || sermon.name || '' : sermon.name || ''}
                desc={locale === 'en' ? sermon.descEn || sermon.desc || '' : sermon.desc || ''}
                url={sermon.url || ''}
                createdAt={sermon.createdAt || ''}
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
    );
  };

  return (
    <div className="min-h-screen py-10 px-2 space-y-16">
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
          { id: SERMON_TAB.RHEMA, label: menuT('Sermon.sermon') },
          { id: SERMON_TAB.SOUL, label: menuT('Sermon.soul') }
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => router.push(`/sermons?type=${tabId.toString()}`)}
        accentColor="bg-blue-500"
      />

      {/* 설교 콘텐츠 */}
      <section
        className={cn(
          'transition-[width] duration-200 px-4 sm:px-6',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        {renderContent()}
      </section>
    </div>
  );
}
