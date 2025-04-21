'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteHymns } from '@/app/hooks/use-hymns';
import { ContentCard } from '@/app/components/cards/ContentCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/lib/utils';
import { useSidebar } from '@/app/components/ui/sidebar';
import { MusicIcon } from 'lucide-react';
import { HYMN_TAB } from '@/app/variables/enums';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HymnsPage() {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const { state } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = Number(searchParams.get('type')) || HYMN_TAB.HYMN;
  const observerTarget = useRef<HTMLDivElement>(null);

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
    router.push(`/hymns?type=${value}`);
  };

  return (
    <div className="min-h-screen py-10 px-2 space-y-16">
      {/* 히어로 섹션 */}
      <section
        className={cn(
          'relative h-[400px] transition-[width] duration-200 rounded-3xl overflow-hidden',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 dark:from-rose-500/10 dark:to-orange-500/10" />

        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />

        {/* 콘텐츠 */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <MusicIcon className="w-16 h-16 mb-6 text-rose-500/80" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400">
            {menuT('Hymn.name')}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-8">
            {menuT('Hymn.content')}
          </p>
        </div>

        {/* 하단 장식 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 탭 섹션 */}
      <section
        className={cn(
          'transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => handleTabChange(HYMN_TAB.HYMN.toString())}
            className={cn(
              'px-6 py-2 rounded-full transition-colors',
              currentType === HYMN_TAB.HYMN
                ? 'bg-rose-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {menuT('Hymn.hymn')}
          </button>
          <button
            onClick={() => handleTabChange(HYMN_TAB.SONG.toString())}
            className={cn(
              'px-6 py-2 rounded-full transition-colors',
              currentType === HYMN_TAB.SONG
                ? 'bg-rose-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {menuT('Hymn.song')}
          </button>
        </div>
      </section>

      {/* 찬양 그리드 */}
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
                    name={hymn.name || ''}
                    desc={hymn.desc || ''}
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
    </div>
  );
}
