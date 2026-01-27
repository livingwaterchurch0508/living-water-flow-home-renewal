// 통합 데이터 훅
export {
  createDataHooks,
  useSermonsData,
  useInfiniteSermonsData,
  fetchSermonsData,
  useHymnsData,
  useInfiniteHymnsData,
  fetchHymnsData,
  useCommunitiesData,
  useInfiniteCommunitiesData,
  fetchCommunitiesData,
} from './use-data-query';

// 기존 훅 (하위 호환성)
export { useSermons, useInfiniteSermons, fetchSermons } from './use-sermons';
export { useHymns, useInfiniteHymns, fetchHymns } from './use-hymns';
export { useCommunities, useInfiniteCommunities, fetchCommunities } from './use-communities';

// 유틸리티 훅
export { useIsMobile } from './use-mobile';
export { useDebounce } from './use-debounce';
export { useShare } from './use-share';
export { useUrlParams } from './use-url-params';
export { useInfiniteScroll } from './use-infinite-scroll';
export { useSelectedItem } from './use-selected-item';