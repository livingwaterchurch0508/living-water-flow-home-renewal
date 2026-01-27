// ============================================
// UI 관련 상수
// ============================================

/**
 * 그리드 스팬 설정 (Soul 타입 설교 카드용)
 */
export const GRID_SPAN = {
  DEFAULT: 6,
  LARGE: 12,
  MEDIUM: 9,
  SMALL: 5,
} as const;

/**
 * 콘텐츠 길이 임계값 (스팬 결정용)
 */
export const CONTENT_LENGTH_THRESHOLD = {
  LARGE: 200,
  MEDIUM: 100,
  SMALL: 50,
} as const;

/**
 * 콘텐츠 길이에 따른 스팬 계산
 */
export function calculateGridSpan(contentLength: number): number {
  if (contentLength > CONTENT_LENGTH_THRESHOLD.LARGE) {
    return GRID_SPAN.LARGE;
  }
  if (contentLength > CONTENT_LENGTH_THRESHOLD.MEDIUM) {
    return GRID_SPAN.MEDIUM;
  }
  if (contentLength < CONTENT_LENGTH_THRESHOLD.SMALL) {
    return GRID_SPAN.SMALL;
  }
  return GRID_SPAN.DEFAULT;
}

// ============================================
// 스타일 상수
// ============================================

/**
 * Soul 타입별 그라데이션 클래스 (카드 목록용)
 */
export const SOUL_GRADIENT_MAP: Record<number, string> = {
  0: 'bg-gradient-to-br from-blue-200/30 to-blue-100/10 dark:from-blue-500/20 dark:to-blue-400/10',
  1: 'bg-gradient-to-br from-green-200/30 to-green-100/10 dark:from-green-500/20 dark:to-green-400/10',
  2: 'bg-gradient-to-br from-purple-200/30 to-purple-100/10 dark:from-purple-500/20 dark:to-purple-400/10',
} as const;

/**
 * Soul 타입별 그라데이션 클래스 (다이얼로그용 - 세로 방향)
 */
export const SOUL_GRADIENT_DIALOG_MAP: Record<number, string> = {
  0: 'bg-gradient-to-b from-blue-200/30 to-blue-100/10 dark:from-blue-500/20 dark:to-blue-400/10',
  1: 'bg-gradient-to-b from-green-200/30 to-green-100/10 dark:from-green-500/20 dark:to-green-400/10',
  2: 'bg-gradient-to-b from-purple-200/30 to-purple-100/10 dark:from-purple-500/20 dark:to-purple-400/10',
} as const;

/**
 * Soul 타입별 색상 클래스 (목록용)
 */
export const SOUL_COLOR_MAP: Record<number, string> = {
  0: 'text-blue-500 dark:text-blue-400',
  1: 'text-green-500 dark:text-green-400',
  2: 'text-purple-500 dark:text-purple-400',
} as const;

/**
 * Soul 타입별 색상 클래스 (다이얼로그용 - 더 진한 색상)
 */
export const SOUL_COLOR_DIALOG_MAP: Record<number, string> = {
  0: 'text-blue-600 dark:text-blue-400',
  1: 'text-green-600 dark:text-green-400',
  2: 'text-purple-600 dark:text-purple-400',
} as const;

/**
 * Soul 타입별 번역 키 (Menu.Sermon 네임스페이스)
 */
export const SOUL_TYPE_LABEL_KEYS: Record<number, string> = {
  0: 'introduce',
  1: 'mission',
  2: 'spirit',
} as const;

/**
 * Soul 타입 라벨 반환 함수
 * @param sermonType - SOUL_TYPE 값
 * @param translator - useTranslations('Menu.Sermon') 반환값
 * @returns 번역된 라벨 문자열
 */
export function getSoulTypeLabel(
  sermonType: number | null | undefined,
  translator: (key: string) => string
): string {
  const key = SOUL_TYPE_LABEL_KEYS[sermonType ?? -1];
  return key ? translator(key) : '';
}

// ============================================
// 쿼리 관련 상수
// ============================================

/**
 * 데이터 쿼리 기본값
 */
export const QUERY_DEFAULTS = {
  PAGE_SIZE: 10,
  INFINITE_PAGE_SIZE: 12,
  STALE_TIME: 1000 * 60 * 5, // 5분
  CACHE_TIME: 1000 * 60 * 30, // 30분
} as const;

/**
 * IntersectionObserver 설정
 */
export const INTERSECTION_OBSERVER_CONFIG = {
  THRESHOLD: 0.1,
  ROOT_MARGIN: '100px',
} as const;

// ============================================
// 캐시 관련 상수
// ============================================

/**
 * 서버 사이드 캐시 revalidate 시간 (초)
 */
export const CACHE_REVALIDATE = {
  STATS: 60, // 1분
  SERMONS: 300, // 5분
  HYMNS: 300, // 5분
  COMMUNITIES: 300, // 5분
  SEARCH: 60, // 1분
} as const;