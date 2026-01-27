import { DateTime } from 'luxon';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { IError, Result } from '@/variables/types/common.types';

// ============================================
// 타입 정의
// ============================================

export interface IPage {
  limit: number;
  offset: number;
}

export interface IPaginatedResponse<T> {
  total: number;
  totalPages: number;
  items: T[];
}

/**
 * @deprecated 새 코드에서는 DbResultNew를 사용하세요
 */
export type DbResult<T> = Promise<T | IError>;

/**
 * 판별 유니온을 사용하는 새로운 Result 타입
 * 컴파일 타임에 성공/실패를 구분할 수 있습니다.
 */
export type DbResultNew<T> = Promise<Result<T, IError>>;

// ============================================
// 날짜 포맷팅
// ============================================

export const formatDate = (date: Date | string | null): string | null => {
  if (!date) return null;
  try {
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).setZone('Asia/Seoul').toISO() || null;
    }
    return DateTime.fromSQL(date).setZone('Asia/Seoul').toISO() || null;
  } catch (error) {
    console.error('[FORMAT_DATE_ERROR]', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// ============================================
// DB 연결 처리
// ============================================

export const handleDbConnection = async <
  TDatabase extends NeonHttpDatabase<Record<string, unknown>>
>(
  getDb: () => Promise<TDatabase | null>,
  errorPrefix: string
): Promise<TDatabase | null> => {
  try {
    const db = await getDb();
    if (!db) {
      console.error(`[${errorPrefix}] Database connection failed`);
      return null;
    }
    return db;
  } catch (error) {
    console.error(`[${errorPrefix}]`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// ============================================
// 에러 응답 생성
// ============================================

/**
 * @deprecated 새 코드에서는 createError를 사용하세요
 */
export const createErrorResponse = (error: unknown, defaultMessage: string): IError => {
  console.error('[DB_ERROR]', error instanceof Error ? error.message : 'Unknown error');
  return {
    message: error instanceof Error ? error.message : defaultMessage,
  };
};

/**
 * 판별 유니온 에러 응답 생성
 */
export const createError = <T>(error: unknown, defaultMessage: string): Result<T, IError> => {
  console.error('[DB_ERROR]', error instanceof Error ? error.message : 'Unknown error');
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : defaultMessage,
    },
  };
};

/**
 * 판별 유니온 성공 응답 생성
 */
export const createSuccess = <T>(data: T): Result<T, IError> => {
  return {
    success: true,
    data,
  };
};

// ============================================
// 페이지네이션 계산
// ============================================

export const calculatePagination = (
  total: number,
  limit: number
): { total: number; totalPages: number } => {
  return {
    total: Number(total) || 0,
    totalPages: Math.ceil((Number(total) || 0) / limit),
  };
};

// ============================================
// 타입 가드
// ============================================

/**
 * IError 타입인지 확인
 */
export function isDbError(result: unknown): result is IError {
  return (
    result !== null &&
    typeof result === 'object' &&
    'message' in result &&
    typeof (result as { message: unknown }).message === 'string'
  );
}