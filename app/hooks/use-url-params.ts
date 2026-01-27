'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * URL 파라미터 관리를 위한 공유 훅
 * removeParamAndPush 함수 중복을 제거하기 위해 생성
 */
export function useUrlParams(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * 특정 파라미터를 제거하고 해당 경로로 이동
   */
  const removeParam = useCallback(
    (param: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(param);
      const queryString = params.toString();
      router.push(queryString ? `${basePath}?${queryString}` : basePath, { scroll: false });
    },
    [searchParams, router, basePath]
  );

  /**
   * 특정 파라미터를 설정하고 해당 경로로 이동
   */
  const setParam = useCallback(
    (param: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(param, value);
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, basePath]
  );

  /**
   * 다이얼로그 닫기 (id 파라미터 제거)
   */
  const closeDialog = useCallback(() => {
    removeParam('id');
  }, [removeParam]);

  return {
    searchParams,
    removeParam,
    setParam,
    closeDialog,
  };
}