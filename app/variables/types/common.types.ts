// ============================================
// 기본 인터페이스
// ============================================

export interface ICommon {
  id: number;
  url: string | null;
  createdAt: string | null;
}

export interface IPage {
  limit?: number;
  offset?: number;
  type?: number;
}

export interface IPaginatedResponse<T> {
  total: number;
  totalPages: number;
  items: T[];
}

// ============================================
// 에러 처리 (판별 유니온)
// ============================================

export interface IError {
  message: string;
}

/**
 * 성공/실패를 컴파일 타임에 구분할 수 있는 Result 타입
 */
export type Result<T, E = IError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Result 타입 헬퍼 함수
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

export function isError<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

// ============================================
// 콘텐츠 기본 인터페이스
// ============================================

/**
 * 모든 콘텐츠(설교, 찬양, 소식)의 공통 필드
 */
export interface IContent extends ICommon {
  name: string | null;
  nameEn: string | null;
  desc: string | null;
  descEn: string | null;
  viewCount: number | null;
}