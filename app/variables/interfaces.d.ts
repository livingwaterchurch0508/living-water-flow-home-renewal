import {
  HYMN_TAB,
  INFO_TAB,
  INTRODUCE_TAB,
  MENU_TAB,
  NEWS_TAB,
  NEWS_TYPES,
  SERMON_TAB,
  SOUL_TYPE,
} from '@/app/variables/enums';

interface ICommon {
  id: number;
  url: string | null;
  createdAt: string | null;
}

interface IHymn extends ICommon {
  name: string | null;
  desc: string | null;
  viewCount: number | SOUL_TYPE | null;
  nameEn: string | null;
  descEn: string | null;
  type: NEWS_TYPES | SERMON_TAB | HYMN_TAB | null;
}

type ISermon = IHymn;

interface ICommunity extends IHymn {
  files: IFile[];
}

interface IFile extends ICommon {
  communityId: number | null;
  caption: string | null;
  downloadCount: number | null;
  captionEn: string | null;
}

export interface IError {
  message?: string;
}

export interface ICardItem {
  title: string | null;
  content: string | null;
  createdAt: string | null;
  image?: string | null;
  youtube?: string | null;
  viewCount?: number | null;
  id: number;
}

export interface IPage {
  limit?: number;
  offset?: number;
  type?: number;
}

export interface IMoveTab {
  menuTab: MENU_TAB;
  detailTab?: INTRODUCE_TAB | SERMON_TAB | HYMN_TAB | NEWS_TAB | INFO_TAB;
}

export interface IPaginatedResponse<T> {
  total: number;
  totalPages: number;
  items: T[];
}

export type IHymnsResponse = IPaginatedResponse<IHymn>;
export type ISermonsResponse = IPaginatedResponse<ISermon>;
export type ICommunitiesResponse = IPaginatedResponse<ICommunity>;

declare module 'uuid';
