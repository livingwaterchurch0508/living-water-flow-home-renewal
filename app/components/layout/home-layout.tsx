'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { ContentCard } from '@/app/components/cards/ContentCard';
import { CommunityCard } from '@/app/components/cards/CommunityCard';
import { SermonCard } from '@/app/components/cards/SermonCard';
import { Carousel, CarouselContent, CarouselItem, buttonVariants } from '@/app/components/ui';
import { MasonryGrid, MasonryItem } from '@/app/components/magicui/masonry-grid';
import { Youtube } from '@/app/components/icon/Youtube';
import { HeroSection } from '@/app/components/layout/hero-section';
import HomeSection from '@/app/components/layout/home-section';

import { cn } from '@/app/lib/utils';
import { YOUTUBE_URL, ROUTER_PATHS } from '@/app/variables/constants';
import { MENU_TAB, INTRODUCE_TAB } from '@/app/variables/enums';
import type { IHymn, ISermon, ICommunity } from '@/app/variables/interfaces';
import { ContentListSkeleton } from '@/app/components/ui';

interface ApiResponse<T> {
  status: string;
  payload: { items: T[] };
}

interface HomeClientProps {
  locale: string;
  hymns: IHymn[];
}

export default function HomeLayout({ locale, hymns }: HomeClientProps) {
  const t = useTranslations('Main');
  const menuT = useTranslations('Menu');
  const [selectedSermon, setSelectedSermon] = useState<{ name: string; desc: string } | null>(null);

  // Sermons lazy fetch
  const { ref: sermonRef, inView: sermonInView } = useInView({ triggerOnce: true });
  const { data: sermons = [], isLoading: sermonsLoading } = useQuery<ISermon[]>({
    queryKey: ['sermons', locale],
    queryFn: async () => {
      const res = await fetch(`/api/sermons?limit=10&type=0&page=1`);
      const json: ApiResponse<ISermon> = await res.json();
      return json.status === 'success' ? json.payload.items : [];
    },
    enabled: sermonInView,
  });

  // type1Sermons lazy fetch
  const { ref: type1Ref, inView: type1InView } = useInView({ triggerOnce: true });
  const { data: type1Sermons = [], isLoading: type1Loading } = useQuery<ISermon[]>({
    queryKey: ['type1Sermons', locale],
    queryFn: async () => {
      const res = await fetch(`/api/sermons?limit=10&type=1&page=1`);
      const json: ApiResponse<ISermon> = await res.json();
      return json.status === 'success' ? json.payload.items : [];
    },
    enabled: type1InView,
  });

  // communities lazy fetch
  const { ref: commRef, inView: commInView } = useInView({ triggerOnce: true });
  const { data: communities = [], isLoading: commLoading } = useQuery<ICommunity[]>({
    queryKey: ['communities', locale],
    queryFn: async () => {
      const res = await fetch(`/api/communities?limit=10&type=0&page=1`);
      const json: ApiResponse<ICommunity> = await res.json();
      return json.status === 'success' ? json.payload.items : [];
    },
    enabled: commInView,
  });

  return (
    <div className="space-y-20 py-10 px-2">
      <HeroSection
        title={t('Info.title')}
        content={t('Info.description')}
        bg1="from-blue-500/20"
        bg2="to-violet-500/20"
        bgDark1="dark:from-blue-500/10"
        bgDark2="dark:to-violet-500/10"
        color1="from-gray-900"
        color2="to-gray-600"
        colorDark1="dark:from-white"
        colorDark2="dark:to-gray-200"
      >
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
      </HeroSection>

      <HomeSection
        path={`${ROUTER_PATHS[MENU_TAB.HYMN]}?type=0`}
        title={t('Hymn.title')}
        viewAll={t('Common.viewAll')}
      >
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {hymns.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                hymns.map((hymn) => (
                  <CarouselItem key={hymn.id} className="pl-4 basis-auto">
                    <ContentCard
                      type="hymn"
                      name={locale === 'en' ? hymn.nameEn || hymn.name || '' : hymn.name || ''}
                      desc={locale === 'en' ? hymn.descEn || hymn.desc || '' : hymn.desc || ''}
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
      </HomeSection>

      <HomeSection
        path={`${ROUTER_PATHS[MENU_TAB.SERMON]}?type=0`}
        title={t('Sermon.title')}
        viewAll={t('Common.viewAll')}
      >
        <div className="relative" ref={sermonRef}>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {sermonsLoading ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  <ContentListSkeleton count={12} />
                </div>
              ) : sermons.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                sermons.map((sermon: ISermon) => (
                  <CarouselItem key={sermon.id} className="pl-4 basis-auto">
                    <ContentCard
                      type="sermon"
                      name={
                        locale === 'en' ? sermon.nameEn || sermon.name || '' : sermon.name || ''
                      }
                      desc={
                        locale === 'en' ? sermon.descEn || sermon.desc || '' : sermon.desc || ''
                      }
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
      </HomeSection>

      <HomeSection
        path={`${ROUTER_PATHS[MENU_TAB.NEWS]}?type=0`}
        title={t('News.title')}
        viewAll={t('Common.viewAll')}
      >
        <div className="relative" ref={commRef}>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {commLoading ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  <ContentListSkeleton count={12} />
                </div>
              ) : communities.length === 0 ? (
                <div className="w-full text-center py-8 text-muted-foreground">
                  {t('Common.noData')}
                </div>
              ) : (
                communities.map((community: ICommunity) => (
                  <CarouselItem key={community.id} className="pl-4 basis-auto">
                    <CommunityCard
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
                      variant="home"
                    />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </HomeSection>

      <HomeSection
        path={`${ROUTER_PATHS[MENU_TAB.SERMON]}?type=SOUL`}
        title={t('Spirit.title')}
        viewAll={t('Common.viewAll')}
      >
        <div ref={type1Ref}>
          {type1Loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <ContentListSkeleton count={12} />
            </div>
          ) : type1Sermons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('Common.noData')}</div>
          ) : (
            <div className="w-full">
              <MasonryGrid className="gap-2 sm:gap-3 md:gap-4">
                {type1Sermons.map((sermon: ISermon, index: number) => {
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
                  const name =
                    locale === 'en' ? sermon.nameEn || sermon.name || '' : sermon.name || '';
                  const desc =
                    locale === 'en' ? sermon.descEn || sermon.desc || '' : sermon.desc || '';
                  return (
                    <MasonryItem key={sermon.id} span={span}>
                      <button
                        data-testid="sermon-card-button"
                        onClick={() => setSelectedSermon({ name, desc })}
                        className={cn(
                          'group relative block h-full w-full p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-300',
                          gradientClass,
                          'hover:shadow-md hover:-translate-y-0.5'
                        )}
                      >
                        <div className="space-y-1 sm:space-y-2 text-left">
                          <h3
                            data-testid="sermon-card-title"
                            className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight"
                          >
                            {name}
                          </h3>
                          <p
                            data-testid="sermon-card-desc"
                            className="text-base sm:text-base text-muted-foreground"
                          >
                            {desc}
                          </p>
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
        </div>
      </HomeSection>
    </div>
  );
}
