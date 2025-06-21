import type { IPaginatedResponse } from '@/variables/types/common.types';
import type { IHymn } from './hymn.types';

export type ISermon = IHymn;

export type ISermonsResponse = IPaginatedResponse<ISermon>; 