'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { DateTime } from 'luxon';
import { motion, useScroll } from 'motion/react';
import { Languages } from 'lucide-react';

import { buttonVariants } from '@/app/components/ui/button';
import { Button } from '@/app/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/app/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/app/components/ui/sidebar';
import { ModeToggle } from '@/app/components/icon/mode-toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import Youtube from '@/app/components/icon/Youtube';
import { ContentCard } from '@/app/components/cards/ContentCard';
import { CommunityCard } from '@/app/components/cards/CommunityCard';
import { SermonCard } from '@/app/components/cards/SermonCard';

import { useDebounce } from '@/app/hooks/use-debounce';
import { cn } from '@/app/lib/utils';
import { YOUTUBE_URL } from '@/app/variables/constants';
import { LOCALE_TYPE } from '@/app/variables/enums';

interface SearchResult {
  id: string;
  name: string;
  url?: string;
  type?: string;
  desc?: string;
  nameEn?: string;
  descEn?: string;
  createdAt?: string;
  thumbnailUrl?: string;
  files?: { url: string; caption: string }[];
  fileUrl?: string;
  fileCaption?: string;
}

interface SearchResponse {
  status: string;
  payload: {
    sermons: SearchResult[];
    hymns: SearchResult[];
    communities: SearchResult[];
  };
}

function getRelativeTime(dateStr: string) {
  return DateTime.fromISO(dateStr).toRelative({ locale: 'ko' });
}

function getYouTubeThumbnail(url: string) {
  try {
    return `${YOUTUBE_URL.THUMB_NAIL}${url}/mqdefault.jpg`;
  } catch {
    return null;
  }
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [selectedContent, setSelectedContent] = useState<{
    item: SearchResult;
    type: 'sermon' | 'hymn' | 'community';
  } | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Menu');
  const tSearch = useTranslations('Search');
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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

  const handleLanguageChange = (locale: LOCALE_TYPE) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult, type: 'sermon' | 'hymn' | 'community') => {
    setOpen(type === 'sermon' && !item.url);
    setSelectedContent({ item, type });
  };

  return (
    <>
      <motion.div
        className={cn(
          'sticky top-0 z-50 w-full bg-background/80 backdrop-blur-[6px] backdrop-saturate-150',
          scrolled && 'bg-background/90 backdrop-blur-[8px]'
        )}
        initial={{ backdropFilter: 'blur(6px)' }}
        animate={{
          backdropFilter: scrolled ? 'blur(8px)' : 'blur(6px)',
          backgroundColor: scrolled
            ? 'rgba(var(--background), 0.9)'
            : 'rgba(var(--background), 0.8)',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-14 w-full items-center px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Living Water Church Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="hidden lg:block text-lg font-semibold">{t('name')}</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <Button
              variant="outline"
              className="relative h-8 w-full max-w-[600px] justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
              onClick={() => setOpen(true)}
            >
              <span className="hidden lg:inline-flex">{tSearch('placeholder')}</span>
              <span className="inline-flex lg:hidden">{tSearch('shortPlaceholder')}</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-4">
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
                        })
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
                    })
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

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={tSearch('placeholder')}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>{tSearch('searching')}</CommandEmpty>
            ) : !query ? (
              <CommandEmpty>{tSearch('initial')}</CommandEmpty>
            ) : !searchResults?.payload ? (
              <CommandEmpty>{tSearch('noResults')}</CommandEmpty>
            ) : (
              <>
                {searchResults.payload.sermons?.length > 0 && (
                  <>
                    <CommandGroup heading={t('Sermon.name')}>
                      {searchResults.payload.sermons.map((sermon) => (
                        <CommandItem
                          key={sermon.id}
                          value={`sermon-${sermon.id}`}
                          onSelect={() => handleSelect(sermon, 'sermon')}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-center w-full gap-3">
                            <div className="flex-1">
                              <div className="font-medium">
                                {locale === 'ko' ? sermon.name : sermon.nameEn}
                              </div>
                              {sermon.createdAt && (
                                <div className="text-xs text-muted-foreground">
                                  {getRelativeTime(sermon.createdAt)}
                                </div>
                              )}
                            </div>
                            {sermon.url && (
                              <div className="relative h-12 w-16 rounded-sm overflow-hidden">
                                <Image
                                  src={getYouTubeThumbnail(sermon.url) || ''}
                                  alt={sermon.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                {searchResults.payload.hymns?.length > 0 && (
                  <>
                    <CommandGroup heading={t('Hymn.name')}>
                      {searchResults.payload.hymns.map((hymn) => (
                        <CommandItem
                          key={hymn.id}
                          value={`hymn-${hymn.id}`}
                          onSelect={() => handleSelect(hymn, 'hymn')}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-center w-full gap-3">
                            <div className="flex-1">
                              <div className="font-medium">
                                {locale === 'ko' ? hymn.name : hymn.nameEn}
                              </div>
                              {hymn.createdAt && (
                                <div className="text-xs text-muted-foreground">
                                  {getRelativeTime(hymn.createdAt)}
                                </div>
                              )}
                            </div>
                            {hymn.url && (
                              <div className="relative h-12 w-16 rounded-sm overflow-hidden">
                                <Image
                                  src={getYouTubeThumbnail(hymn.url) || ''}
                                  alt={hymn.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                {searchResults.payload.communities?.length > 0 && (
                  <CommandGroup heading={t('News.name')}>
                    {searchResults.payload.communities.map((community) => (
                      <CommandItem
                        key={community.id}
                        value={`community-${community.id}`}
                        onSelect={() => handleSelect(community, 'community')}
                        className="cursor-pointer hover:bg-accent"
                      >
                        <div className="flex items-center w-full gap-3">
                          <div className="flex-1">
                            <div className="font-medium">
                              {locale === 'ko' ? community.name : community.nameEn}
                            </div>
                            {community.createdAt && (
                              <div className="text-xs text-muted-foreground">
                                {getRelativeTime(community.createdAt)}
                              </div>
                            )}
                          </div>
                          {community.files?.[0]?.url && (
                            <div className="relative h-12 w-16 rounded-sm overflow-hidden">
                              <Image
                                src={`/api/image?imageName=${community.files[0].url}1.jpg`}
                                alt={community.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      {selectedContent &&
        (selectedContent.type === 'community' ? (
          <div className="hidden">
            <CommunityCard
              name={locale === 'ko' ? selectedContent.item.name : selectedContent.item.nameEn || ''}
              desc={selectedContent.item.fileCaption || ''}
              url={selectedContent.item.fileUrl || ''}
              createdAt={selectedContent.item.createdAt || ''}
              caption={Number(selectedContent.item.fileCaption) || 0}
              variant="page"
              onDialogClose={() => setSelectedContent(null)}
              autoOpen
            />
          </div>
        ) : selectedContent.type === 'sermon' && !selectedContent.item.url ? (
          <div className="hidden">
            <SermonCard
              name={locale === 'ko' ? selectedContent.item.name : selectedContent.item.nameEn || ''}
              desc={locale === 'ko' ? selectedContent.item.desc : selectedContent.item.descEn || ''}
              autoOpen
              onDialogClose={() => setSelectedContent(null)}
            />
          </div>
        ) : (
          <div className="hidden">
            <ContentCard
              name={locale === 'ko' ? selectedContent.item.name : selectedContent.item.nameEn || ''}
              desc={
                locale === 'ko'
                  ? selectedContent.item.desc || ''
                  : selectedContent.item.descEn || ''
              }
              url={selectedContent.item.url || ''}
              createdAt={selectedContent.item.createdAt || ''}
              variant="page"
              autoOpen
              onDialogClose={() => setSelectedContent(null)}
            />
          </div>
        ))}
    </>
  );
}
