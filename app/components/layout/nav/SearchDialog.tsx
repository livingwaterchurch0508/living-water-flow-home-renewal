'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { SearchResultList } from '@/components/layout/nav/SearchResultList';
import { ContentDialog } from '@/components/layout/nav/ContentDialog';

import { useDebounce } from '@/hooks/use-debounce';
import { SearchResponse, SearchResult } from '@/variables/types/search.types';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const performSearch = async (
  searchQuery: string,
  setSearchResults: (results: SearchResponse | null) => void,
  setIsLoading: (loading: boolean) => void,
) => {
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

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [selectedContent, setSelectedContent] = useState<{
    item: SearchResult;
    type: 'sermon' | 'hymn' | 'community';
  } | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const tSearch = useTranslations('Search');

  useEffect(() => {
    performSearch(debouncedQuery, setSearchResults, setIsLoading);
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult, type: 'sermon' | 'hymn' | 'community') => {
    setSelectedContent({ item, type });
    onOpenChange(false);
  };

  const handleDialogClose = () => {
    setSelectedContent(null);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
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
              <SearchResultList results={searchResults.payload} onSelect={handleSelect} />
            )}
          </CommandList>
        </Command>
      </CommandDialog>
      <ContentDialog selectedContent={selectedContent} onDialogClose={handleDialogClose} />
    </>
  );
} 