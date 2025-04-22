'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Church, HomeIcon, Music, Newspaper, MapPin, BookOpen } from 'lucide-react';

import { Dock, DockIcon } from '@/app/components/magicui/dock';
import { Separator } from '@/app/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import Youtube from '@/app/components/icon/Youtube';
import { buttonVariants } from '@/app/components/ui/button';

import { cn } from '@/app/lib/utils';
import { ROUTER_PATHS, YOUTUBE_URL } from '@/app/variables/constants';
import { MENU_TAB } from '@/app/variables/enums';

export default function BottomDock() {
  const t = useTranslations('Menu');
  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center">
      <Dock className="bg-background/80 shadow-lg backdrop-blur-md">
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={'/'}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <HomeIcon className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${ROUTER_PATHS[MENU_TAB.INTRODUCE]}?type=0`}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <Church className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Introduce.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${ROUTER_PATHS[MENU_TAB.SERMON]}?type=0`}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <BookOpen className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Sermon.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${ROUTER_PATHS[MENU_TAB.HYMN]}?type=0`}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <Music className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Hymn.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${ROUTER_PATHS[MENU_TAB.NEWS]}?type=0`}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <Newspaper className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('News.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${ROUTER_PATHS[MENU_TAB.INFO]}?type=0`}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
              >
                <MapPin className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Info.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={YOUTUBE_URL.CHANNEL}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  }),
                  'size-12'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('youtube')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
}
