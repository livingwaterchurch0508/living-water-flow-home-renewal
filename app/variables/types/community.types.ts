import type { ICommon, IPaginatedResponse } from '@/variables/types/common.types';
import type { IHymn } from './hymn.types';

export interface IFile extends ICommon {
  communityId: number | null;
  caption: string | null;
  downloadCount: number | null;
  captionEn: string | null;
}

export interface ICommunity extends IHymn {
  files: IFile[];
}

export type ICommunitiesResponse = IPaginatedResponse<ICommunity>; 