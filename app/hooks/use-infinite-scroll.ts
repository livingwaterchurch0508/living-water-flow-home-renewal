'use client';

import { useEffect, useRef, RefObject } from 'react';
import { INTERSECTION_OBSERVER_CONFIG } from '@/variables/ui-constants';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * 무한 스크롤을 위한 IntersectionObserver 훅
 * 여러 컴포넌트에서 중복되는 로직을 추출
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = INTERSECTION_OBSERVER_CONFIG.THRESHOLD,
  rootMargin = INTERSECTION_OBSERVER_CONFIG.ROOT_MARGIN,
}: UseInfiniteScrollOptions): RefObject<HTMLDivElement | null> {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, threshold, rootMargin]);

  return observerTarget;
}