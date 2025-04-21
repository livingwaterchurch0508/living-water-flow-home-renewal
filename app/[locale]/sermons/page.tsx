'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteSermons } from '@/app/hooks/use-sermons';
import { ContentCard } from '@/app/components/cards/ContentCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/lib/utils';
import { useSidebar } from '@/app/components/ui/sidebar';
import { SERMON_TAB } from '@/app/variables/enums';
import { BookOpenIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BentoCard, BentoGrid } from '@/app/components/magicui/bento-grid';

export default function SermonsPage() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || SERMON_TAB.RHEMA;
  const observerTarget = useRef<HTMLDivElement>(null);

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
          <BentoGrid>
            {sermons.map((sermon, index) => {
              const backgroundPatterns = [
                'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
                'bg-gradient-to-br from-zinc-100 to-neutral-200 dark:from-zinc-800 dark:to-neutral-900',
                'bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900',
              ];
              const backgroundClass = backgroundPatterns[index % 3];

              return (
                <BentoCard
                  key={sermon.id}
                  name={sermon.name || ''}
                  className={backgroundClass}
                  description={sermon.desc || ''}
                  href={`/sermons/${sermon.id}?type=${SERMON_TAB.SOUL}`}
                  cta={t('Common.viewMore')}
                  index={index}
                />
              );
            })}
          </BentoGrid>

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
                name={sermon.name || ''}
                desc={sermon.desc || ''}
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
      {/* 히어로 섹션 */}
      <section
        className={cn(
          'relative h-[600px] transition-[width] duration-200 rounded-3xl overflow-hidden',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-500/10 dark:to-violet-500/10" />

        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />

        {/* 콘텐츠 */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <BookOpenIcon className="w-16 h-16 mb-6 text-blue-500/80" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            {menuT('Sermon.name')}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8">
            {menuT('Sermon.content')}
          </p>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 필터 및 검색 섹션 */}
      <section
        className={cn(
          'space-y-6 transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => router.push(`/sermons?type=${SERMON_TAB.RHEMA.toString()}`)}
            className={cn(
              'px-6 py-2 rounded-full transition-colors',
              currentType === SERMON_TAB.RHEMA
                ? 'bg-blue-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {menuT('Sermon.sermon')}
          </button>
          <button
            onClick={() => router.push(`/sermons?type=${SERMON_TAB.SOUL.toString()}`)}
            className={cn(
              'px-6 py-2 rounded-full transition-colors',
              currentType === SERMON_TAB.SOUL
                ? 'bg-blue-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {menuT('Sermon.soul')}
          </button>
        </div>
      </section>

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
