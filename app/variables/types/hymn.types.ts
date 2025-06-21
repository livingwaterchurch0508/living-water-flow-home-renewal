import type {
  HYMN_TAB,
  NEWS_TYPES,
  SERMON_TAB,
  SOUL_TYPE,
} from '@/variables/enums';
import type { ICommon, IPaginatedResponse } from '@/variables/types/common.types';

export interface IHymn extends ICommon {
  name: string | null;
  desc: string | null;
  viewCount: number | SOUL_TYPE | null;
  nameEn: string | null;
  descEn: string | null;
  type: NEWS_TYPES | SERMON_TAB | HYMN_TAB | null;
}

export type IHymnsResponse = IPaginatedResponse<IHymn>; 