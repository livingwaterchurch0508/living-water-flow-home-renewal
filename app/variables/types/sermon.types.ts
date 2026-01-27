import { SERMON_TAB, SOUL_TYPE } from '@/variables/enums';
import type { IContent, IPaginatedResponse } from '@/variables/types/common.types';

/**
 * 설교 인터페이스
 * - type: SERMON_TAB (0=레마, 1=소울)
 * - soulType: SOUL_TYPE (소울 타입일 때만 사용, viewCount에 저장됨)
 */
export interface ISermon extends IContent {
  type: SERMON_TAB | null;
}

/**
 * 소울 타입 설교 (type === SERMON_TAB.SOUL)
 * viewCount 필드를 SOUL_TYPE으로 사용
 */
export interface ISoulSermon extends ISermon {
  type: SERMON_TAB.SOUL;
  soulType: SOUL_TYPE;
}

/**
 * 타입 가드: 소울 타입 설교인지 확인
 */
export function isSoulSermon(sermon: ISermon): sermon is ISoulSermon {
  return sermon.type === SERMON_TAB.SOUL;
}

/**
 * viewCount를 SOUL_TYPE으로 변환 (소울 타입일 때)
 */
export function getSoulType(sermon: ISermon): SOUL_TYPE | null {
  if (isSoulSermon(sermon) && typeof sermon.viewCount === 'number') {
    return sermon.viewCount as SOUL_TYPE;
  }
  return null;
}

export type ISermonsResponse = IPaginatedResponse<ISermon>;