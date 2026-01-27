import type { NEWS_TYPES } from '@/variables/enums';
import type { ICommon, IContent, IPaginatedResponse } from '@/variables/types/common.types';

/**
 * 파일 인터페이스
 */
export interface IFile extends ICommon {
  communityId: number;
  caption: string | null;
  captionEn: string | null;
  downloadCount: number | null;
}

/**
 * 커뮤니티(소식) 인터페이스
 * - type: NEWS_TYPES (0=예배, 1=행사, 2=이야기)
 */
export interface ICommunity extends IContent {
  type: NEWS_TYPES | null;
  files: IFile[];
}

export type ICommunitiesResponse = IPaginatedResponse<ICommunity>;