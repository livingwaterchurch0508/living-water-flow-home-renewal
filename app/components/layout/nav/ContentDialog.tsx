'use client';

import { useLocale } from 'next-intl';

import { ContentCard } from '@/components/cards/ContentCard';
import { CommunityCard } from '@/components/cards/CommunityCard';
import { SermonCard } from '@/components/cards/SermonCard';

import { SearchResult } from '@/variables/types/search.types';

interface ContentDialogProps {
  selectedContent: {
    item: SearchResult;
    type: 'sermon' | 'hymn' | 'community';
  } | null;
  onDialogClose: () => void;
}

export function ContentDialog({ selectedContent, onDialogClose }: ContentDialogProps) {
  const locale = useLocale();

  if (!selectedContent) {
    return null;
  }

  const { item, type } = selectedContent;

  if (type === 'community') {
    return (
      <CommunityCard
        name={locale === 'ko' ? item.name : item.nameEn || ''}
        desc={item.fileCaption || ''}
        url={item.fileUrl || ''}
        createdAt={item.createdAt || ''}
        caption={Number(item.fileCaption) || 0}
        variant="page"
        onDialogClose={onDialogClose}
        autoOpen
        id={item.id}
      />
    );
  }

  if (type === 'sermon' && !item.url) {
    return (
      <SermonCard
        name={locale === 'ko' ? item.name : item.nameEn || ''}
        desc={locale === 'ko' ? item.desc : item.descEn || ''}
        sermonType={item.viewCount}
        autoOpen
        onDialogClose={onDialogClose}
      />
    );
  }

  return (
    <ContentCard
      name={locale === 'ko' ? item.name : item.nameEn || ''}
      desc={locale === 'ko' ? item.desc || '' : item.descEn || ''}
      url={item.url || ''}
      createdAt={item.createdAt || ''}
      variant="page"
      autoOpen
      onDialogClose={onDialogClose}
      type={type}
    />
  );
} 