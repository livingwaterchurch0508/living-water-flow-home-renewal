'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Church, HomeIcon, Music, Newspaper, MapPin, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Dock, DockIcon } from '@/app/components/magicui/dock';
import {
  Separator,
  buttonVariants,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/app/components/ui';
import { Youtube } from '@/app/components/icon/Youtube';

import { cn } from '@/app/lib/utils';
import { ROUTER_PATHS, YOUTUBE_URL } from '@/app/variables/constants';
import { MENU_TAB } from '@/app/variables/enums';

export default function BottomDock() {
  const t = useTranslations('Menu');

  const pathname = usePathname();

  const isActive = (path: string) => {
    const currentPath = pathname.split('/').slice(2).join('/');
    const comparePath = path.startsWith('/') ? path.slice(1) : path;

    return currentPath === comparePath;
  };

  const getIconColor = (path: string) => {
    if (!isActive(path)) return 'text-muted-foreground';

    switch (path) {
      case '/':
        return 'text-violet-500';
      case `/${ROUTER_PATHS[MENU_TAB.INTRODUCE]}`:
        return 'text-indigo-500';
      case `/${ROUTER_PATHS[MENU_TAB.SERMON]}`:
        return 'text-blue-500';
      case `/${ROUTER_PATHS[MENU_TAB.HYMN]}`:
        return 'text-rose-500';
      case `/${ROUTER_PATHS[MENU_TAB.NEWS]}`:
        return 'text-emerald-500';
      case `/${ROUTER_PATHS[MENU_TAB.INFO]}`:
        return 'text-cyan-500';
      default:
        return 'text-muted-foreground';
    }
  };

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
                  'size-10'
                )}
              >
                <HomeIcon className={cn(getIconColor('/'), 'size-4')} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-1" />
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
                  'size-10'
                )}
              >
                <Church
                  className={cn(getIconColor(`/${ROUTER_PATHS[MENU_TAB.INTRODUCE]}`), 'size-4')}
                />
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
                  'size-10'
                )}
              >
                <BookOpen
                  className={cn(getIconColor(`/${ROUTER_PATHS[MENU_TAB.SERMON]}`), 'size-4')}
                />
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
                  'size-10'
                )}
              >
                <Music className={cn(getIconColor(`/${ROUTER_PATHS[MENU_TAB.HYMN]}`), 'size-4')} />
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
                  'size-10'
                )}
              >
                <Newspaper
                  className={cn(getIconColor(`/${ROUTER_PATHS[MENU_TAB.NEWS]}`), 'size-4')}
                />
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
                  'size-10'
                )}
              >
                <MapPin className={cn(getIconColor(`/${ROUTER_PATHS[MENU_TAB.INFO]}`), 'size-4')} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Info.name')}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-1" />
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
                  'size-10'
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
