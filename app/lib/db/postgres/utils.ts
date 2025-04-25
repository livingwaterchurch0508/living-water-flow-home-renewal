import { DateTime } from 'luxon';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export interface IPage {
  limit: number;
  offset: number;
}

export interface IError {
  message: string;
}

export interface IPaginatedResponse<T> {
  total: number;
  totalPages: number;
  items: T[];
}

export type DbResult<T> = Promise<T | IError>;

export const formatDate = (date: Date | string | null): string | null => {
  if (!date) return null;
  try {
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).setZone('Asia/Seoul').toISO() || null;
    }
    return DateTime.fromSQL(date).setZone('Asia/Seoul').toISO() || null;
  } catch (error) {
    console.error('[FORMAT_DATE_ERROR]', error);
    return null;
  }
};

export const handleDbConnection = async (
  getDb: () => Promise<NeonHttpDatabase | null>,
  errorPrefix: string
): Promise<NeonHttpDatabase | null> => {
  try {
    const db = await getDb();
    if (!db) {
      console.error(`[${errorPrefix}] Database connection failed`);
      return null;
    }
    return db;
  } catch (error) {
    console.error(`[${errorPrefix}]`, error);
    return null;
  }
};

export const createErrorResponse = (error: unknown, defaultMessage: string): IError => {
  console.error(`[DB_ERROR]`, error);
  return {
    message: error instanceof Error ? error.message : defaultMessage,
  };
};

export const calculatePagination = (
  total: number,
  limit: number
): { total: number; totalPages: number } => {
  return {
    total: Number(total) || 0,
    totalPages: Math.ceil((Number(total) || 0) / limit),
  };
};
