'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, useScroll } from 'framer-motion';
import { Languages } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/icon/mode-toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Youtube } from '@/components/icon/Youtube';
import { SearchDialog } from '@/components/layout/nav/SearchDialog';

import { cn } from '@/lib/utils';
import { YOUTUBE_URL } from '@/variables/constants';
import { LOCALE_TYPE } from '@/variables/enums';

export function Nav() {
  const [openSearch, setOpenSearch] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Menu');
  const tSearch = useTranslations('Search');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setScrolled(latest > 0);
    });
  }, [scrollY]);

  const handleLanguageChange = (newLocale: LOCALE_TYPE) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <>
      <motion.div
        className={cn(
          'sticky top-0 z-50 w-full bg-background/80 backdrop-blur-[6px] backdrop-saturate-150',
          scrolled && 'bg-background/90 backdrop-blur-[8px]',
        )}
        initial={{ backdropFilter: 'blur(6px)' }}
        animate={{
          backdropFilter: scrolled ? 'blur(8px)' : 'blur(6px)',
          backgroundColor: scrolled
            ? 'rgba(var(--background-rgb), 0.9)'
            : 'rgba(var(--background-rgb), 0.8)',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-14 w-full items-center px-2 md:px-4">
          <div className="flex items-center gap-1 md:gap-2">
            <SidebarTrigger />
            <Link href={`/${locale}`} className="flex items-center gap-1 md:gap-2">
              <Image src="/logo.webp" alt="logo" width={32} height={32} className="rounded-sm" />
              <span className="hidden lg:block text-lg font-semibold">{t('name')}</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-2 md:px-4">
            <Button
              variant="outline"
              className="relative h-8 w-full max-w-[600px] justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
              onClick={() => setOpenSearch(true)}
            >
              <span className="hidden lg:inline-flex">{tSearch('placeholder')}</span>
              <span className="inline-flex lg:hidden">{tSearch('shortPlaceholder')}</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        buttonVariants({
                          variant: 'outline',
                          size: 'icon',
                        }),
                      )}
                    >
                      <Languages className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">Change Language</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('language')}</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleLanguageChange(LOCALE_TYPE.KO)}
                >
                  <span className="rounded-sm w-4 h-4 flex items-center justify-center">🇰🇷</span>
                  <span>한국어</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleLanguageChange(LOCALE_TYPE.EN)}
                >
                  <span className="rounded-sm w-4 h-4 flex items-center justify-center">🇺🇸</span>
                  <span>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={YOUTUBE_URL.CHANNEL}
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'icon',
                    }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">{t('youtube')}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('youtube')}</p>
              </TooltipContent>
            </Tooltip>
            <ModeToggle />
          </div>
        </div>

        <motion.div
          className="h-[2px] w-full bg-border/50"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500"
            style={{
              scaleX: scrollYProgress,
              transformOrigin: '0%',
            }}
          />
        </motion.div>
      </motion.div>

      <SearchDialog open={openSearch} onOpenChange={setOpenSearch} />
    </>
  );
}
