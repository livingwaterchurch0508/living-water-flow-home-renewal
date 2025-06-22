'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { DateTime } from 'luxon';

import { CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { YOUTUBE_URL } from '@/variables/constants';
import { SearchResult } from '@/variables/types/search.types';

interface SearchResultListProps {
  results: {
    sermons: SearchResult[];
    hymns: SearchResult[];
    communities: SearchResult[];
  };
  onSelect: (item: SearchResult, type: 'sermon' | 'hymn' | 'community') => void;
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

const SoulTypeBadge = ({ type }: { type?: number }) => {
  const t = useTranslations('Menu.Sermon');

  const soulType = type;
  if (type === undefined || soulType === undefined) {
    return null;
  }

  const soulTypes = [
    {
      text: t('introduce'),
      color: 'bg-blue-100 text-blue-800',
    },
    {
      text: t('mission'),
      color: 'bg-green-100 text-green-800',
    },
    {
      text: t('spirit'),
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const props = soulTypes[soulType];

  if (!props) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center p-1 h-12 w-16 rounded-sm ${props.color}`}>
      <span className="text-xs font-semibold text-center">{props.text}</span>
    </div>
  );
};

export function SearchResultList({ results, onSelect }: SearchResultListProps) {
  const t = useTranslations('Menu');
  const locale = useLocale();

  return (
    <>
      {results.sermons?.length > 0 && (
        <>
          <CommandGroup heading={t('Sermon.name')}>
            {results.sermons.map((sermon) => (
              <CommandItem
                key={sermon.id}
                value={`sermon-${sermon.id}`}
                onSelect={() => onSelect(sermon, 'sermon')}
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
                  {sermon.url ? (
                    <div className="relative h-12 w-16 rounded-sm overflow-hidden">
                      <Image
                        src={getYouTubeThumbnail(sermon.url) || ''}
                        alt={sermon.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <SoulTypeBadge type={sermon.viewCount} />
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </>
      )}
      {results.hymns?.length > 0 && (
        <>
          <CommandGroup heading={t('Hymn.name')}>
            {results.hymns.map((hymn) => (
              <CommandItem
                key={hymn.id}
                value={`hymn-${hymn.id}`}
                onSelect={() => onSelect(hymn, 'hymn')}
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
      {results.communities?.length > 0 && (
        <CommandGroup heading={t('News.name')}>
          {results.communities.map((community) => (
            <CommandItem
              key={community.id}
              value={`community-${community.id}`}
              onSelect={() => onSelect(community, 'community')}
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
  );
} 