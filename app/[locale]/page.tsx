'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { ContentCard } from '@/app/components/cards/ContentCard';
import { CommunityCard } from '@/app/components/cards/CommunityCard';
import { SermonCard } from '@/app/components/cards/SermonCard';
import { useHymns } from '@/app/hooks/use-hymns';
import { useSermons } from '@/app/hooks/use-sermons';
import { useCommunities } from '@/app/hooks/use-communities';
import type { IHymn, ISermon, ICommunity } from '@/app/variables/interfaces';
import { Carousel, CarouselContent, CarouselItem } from '@/app/components/ui/carousel';
import { useSidebar } from '@/app/components/ui/sidebar';
import { cn } from '@/app/lib/utils';
import { Skeleton } from '@/app/components/ui/skeleton';
import { YOUTUBE_URL, ROUTER_PATHS } from '@/app/variables/constants';
import { MENU_TAB, SERMON_TAB, HYMN_TAB, INTRODUCE_TAB } from '@/app/variables/enums';
import Youtube from '@/app/components/icon/Youtube';
import { buttonVariants } from '@/app/components/ui/button';
import { MasonryGrid, MasonryItem } from '@/app/components/masonry/masonry-grid';
import { useLocale } from 'next-intl';
export default function Home() {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const errorT = useTranslations('Error');
  const { state } = useSidebar();
   const locale = useLocale();

  const [selectedSermon, setSelectedSermon] = useState<{ name: string; desc: string } | null>(null);

  const {
    data: hymnsData,
    isLoading: isHymnsLoading,
    isError: isHymnsError,
    error: hymnsError,
  } = useHymns({
    limit: 10,
    type: HYMN_TAB.HYMN,
  });

  const {
    data: sermonsData,
    isLoading: isSermonsLoading,
    isError: isSermonsError,
    error: sermonsError,
  } = useSermons({ limit: 10 });

  const {
    data: type1SermonsData,
    isLoading: isType1SermonsLoading,
    isError: isType1SermonsError,
    error: type1SermonsError,
  } = useSermons({ limit: 10, type: SERMON_TAB.SOUL });

  const {
    data: communitiesData,
    isLoading: isCommunitiesLoading,
    isError: isCommunitiesError,
    error: communitiesError,
  } = useCommunities({ limit: 10 });

  const hymns =
    hymnsData?.status === 'success' ? ((hymnsData.payload?.items || []) as IHymn[]) : [];
  const sermons =
    sermonsData?.status === 'success' ? ((sermonsData.payload?.items || []) as ISermon[]) : [];
  const type1Sermons =
    type1SermonsData?.status === 'success'
      ? ((type1SermonsData.payload?.items || []) as ISermon[])
      : [];
  const communities =
    communitiesData?.status === 'success'
      ? ((communitiesData.payload?.items || []) as ICommunity[])
      : [];

  const LoadingSkeleton = () => (
    <div className="w-[300px]">
      <Skeleton className="w-full aspect-video rounded-xl" />
    </div>
  );

  const LoadingBentoSkeleton = () => (
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

  const ErrorMessage = ({ error }: { error: Error | null }) => (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-lg text-red-500 mb-2">{errorT('fetchFailed')}</p>
      <p className="text-sm text-muted-foreground">{error?.message}</p>
    </div>
  );

  return (
    <div className="space-y-20 py-10 px-2">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-200">
            {t('Info.title')}
          </h1>
          <p className="max-w-3xl text-base md:text-lg text-muted-foreground mb-8 whitespace-pre-line">
            {t('Info.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/introduces?type=${INTRODUCE_TAB.WORSHIP}`}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-w-[200px] bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0'
              )}
            >
              {menuT('Introduce.worship')}
            </Link>
            <Link
              href={YOUTUBE_URL.CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'min-w-[200px] bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm'
              )}
            >
              <Youtube className="mr-2 h-5 w-5" />
              {menuT('youtube')}
            </Link>
          </div>

          {/* 하단 장식 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </section>

      <section
        className={cn(
          'space-y-8 transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('Hymn.title')}</h2>
          <Link
            href={`/${ROUTER_PATHS[MENU_TAB.HYMN]}?type=0`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('Common.viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {isHymnsError ? (
                <ErrorMessage error={hymnsError} />
              ) : isHymnsLoading ? (
                [...Array(4)].map((_, i) => (
                  <CarouselItem key={i} className="pl-4 basis-auto">
                    <LoadingSkeleton />
                  </CarouselItem>
                ))
              ) : hymns.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                hymns.map((hymn) => (
                  <CarouselItem key={hymn.id} className="pl-4 basis-auto">
                    <ContentCard
                      id={hymn.id}
                      name={locale === 'en' ? (hymn.nameEn || hymn.name || '') : (hymn.name || '')}
                      desc={locale === 'en' ? (hymn.descEn || hymn.desc || '') : (hymn.desc || '')}
                      url={hymn.url || ''}
                      createdAt={hymn.createdAt || ''}
                      variant="home"
                    />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      <section
        className={cn(
          'space-y-8 transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('Sermon.title')}</h2>
          <Link
            href={`/${ROUTER_PATHS[MENU_TAB.SERMON]}?type=0`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('Common.viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {isSermonsError ? (
                <ErrorMessage error={sermonsError} />
              ) : isSermonsLoading ? (
                [...Array(4)].map((_, i) => (
                  <CarouselItem key={i} className="pl-4 basis-auto">
                    <LoadingSkeleton />
                  </CarouselItem>
                ))
              ) : sermons.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                sermons.map((sermon) => (
                  <CarouselItem key={sermon.id} className="pl-4 basis-auto">
                    <ContentCard
                      id={sermon.id}
                      name={locale === 'en' ? (sermon.nameEn || sermon.name || '') : (sermon.name || '')}
                      desc={locale === 'en' ? (sermon.descEn || sermon.desc || '') : (sermon.desc || '')}
                      url={sermon.url || ''}
                      createdAt={sermon.createdAt || ''}
                      variant="home"
                    />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      <section
        className={cn(
          'space-y-8 transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('News.title')}</h2>
          <Link
            href={`/${ROUTER_PATHS[MENU_TAB.NEWS]}?type=0`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('Common.viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {isCommunitiesError ? (
                <ErrorMessage error={communitiesError} />
              ) : isCommunitiesLoading ? (
                [...Array(4)].map((_, i) => (
                  <CarouselItem key={i} className="pl-4 basis-auto">
                    <LoadingSkeleton />
                  </CarouselItem>
                ))
              ) : communities.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                communities.map((community) => (
                  <CarouselItem key={community.id} className="pl-4 basis-auto">
                    <CommunityCard
                      name={locale === 'en' ? (community.nameEn || community.name || '') : (community.name || '')}
                      desc={locale === 'en' ? (community.descEn || community.desc || '') : (community.desc || '')}
                      url={community.files[0]?.url || ''}
                      createdAt={community.createdAt || ''}
                      caption={Number(community.files[0]?.caption) || 1}
                      variant="home"
                    />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      <section
        className={cn(
          'space-y-8 transition-[width] duration-200',
          state === 'expanded'
            ? 'w-full md:w-[calc(100vw-270px)]'
            : 'w-full md:w-[calc(100vw-62px)]'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('Spirit.title')}</h2>
          <Link
            href={`/${ROUTER_PATHS[MENU_TAB.SERMON]}?type=${SERMON_TAB.SOUL}`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('Common.viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {isType1SermonsError ? (
          <ErrorMessage error={type1SermonsError} />
        ) : isType1SermonsLoading ? (
          <LoadingBentoSkeleton />
        ) : type1Sermons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('Common.noData')}</div>
        ) : (
          <div className="w-full">
            <MasonryGrid className="gap-2 sm:gap-3 md:gap-4">
              {type1Sermons.map((sermon, index) => {
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

                const name = locale === 'en' ? (sermon.nameEn || sermon.name || '') : (sermon.name || '');
                const desc = locale === 'en' ? (sermon.descEn || sermon.desc || '') : (sermon.desc || '');
                
                return (
                  <MasonryItem key={sermon.id} span={span}>
                    <button
                      onClick={() => setSelectedSermon({ name, desc })}
                      className={cn(
                        "group relative block h-full w-full p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-300",
                        gradientClass,
                        "hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="space-y-1 sm:space-y-2 text-left">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight">{name}</h3>
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
          </div>
        )}
      </section>
    </div>
  );
}
