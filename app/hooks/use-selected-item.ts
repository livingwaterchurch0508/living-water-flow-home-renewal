'use client';

import { useQuery } from '@tanstack/react-query';

interface UseSelectedItemOptions<T> {
  /** 선택된 아이템의 ID */
  selectedId: string | undefined;
  /** API 엔드포인트 (예: '/api/sermons') */
  endpoint: string;
  /** 쿼리 키 prefix (예: 'sermon') */
  queryKey: string;
  /** ID가 유효하지 않을 때 호출되는 콜백 */
  onInvalidId: () => void;
  /** 서버에서 전달받은 초기 데이터 */
  initialData?: T | null;
}

/**
 * 선택된 아이템 데이터를 가져오는 공통 훅
 * SermonsClient, HymnsClient, NewsClient에서 중복되는 로직을 통합
 */
export function useSelectedItem<T>({
  selectedId,
  endpoint,
  queryKey,
  onInvalidId,
  initialData,
}: UseSelectedItemOptions<T>) {
  return useQuery({
    queryKey: [queryKey, selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      try {
        const response = await fetch(`${endpoint}/${selectedId}`);
        if (!response.ok) {
          onInvalidId();
          return null;
        }
        const data = await response.json();
        if (data.status === 'error' || !data.payload) {
          onInvalidId();
          return null;
        }
        return data.payload as T;
      } catch {
        onInvalidId();
        return null;
      }
    },
    enabled: !!selectedId,
    initialData: initialData || undefined,
  });
}
