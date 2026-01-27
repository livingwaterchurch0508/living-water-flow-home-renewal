import type { HYMN_TAB } from '@/variables/enums';
import type { IContent, IPaginatedResponse } from '@/variables/types/common.types';

/**
 * 찬양 인터페이스
 * - type: HYMN_TAB (0=찬송가, 1=복음성가)
 */
export interface IHymn extends IContent {
  type: HYMN_TAB | null;
}

export type IHymnsResponse = IPaginatedResponse<IHymn>;