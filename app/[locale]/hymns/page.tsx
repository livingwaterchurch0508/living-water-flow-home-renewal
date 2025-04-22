'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { MusicIcon } from 'lucide-react';

import { ContentCard } from '@/app/components/cards/ContentCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useSidebar } from '@/app/components/ui/sidebar';
import { HeroSection } from '@/app/components/hero-section';
import { TabSection } from '@/app/components/ui/tab-section';

import { useInfiniteHymns } from '@/app/hooks/use-hymns';
import { cn } from '@/app/lib/utils';
import { HYMN_TAB } from '@/app/variables/enums';

export default function HymnsPage() {
  const menuT = useTranslations('Menu');
  const searchT = useTranslations('Search');
  const errorT = useTranslations('Error');
  const locale = useLocale();
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
          { id: HYMN_TAB.SONG, label: menuT('Hymn.song') }
        ]}
        activeTab={currentType}
        onTabChange={(tabId) => handleTabChange(tabId.toString())}
        accentColor="bg-rose-500"
      />

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
    </div>
  );
}
