import { desc, eq, ilike, or, and, sql } from 'drizzle-orm';
import { getDb } from './dbConnection';
import { hymns } from './schema';
import { IHymn } from '@/app/variables/interfaces';
import { HYMN_TAB } from '@/app/variables/enums';
import {
  IPage,
  IPaginatedResponse,
  DbResult,
  formatDate,
  handleDbConnection,
  createErrorResponse,
  calculatePagination,
} from './utils';

export type HymnsResponse = IPaginatedResponse<IHymn>;

interface GetHymnsParams extends Required<Pick<IPage, 'limit' | 'offset'>> {
  type: number;
  search?: string;
}

export async function getHymns({
  limit = 10,
  offset = 0,
  type,
  search,
}: GetHymnsParams): DbResult<HymnsResponse> {
  try {
    const db = await handleDbConnection(getDb, 'GET_HYMNS');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }

    const whereCondition = search
      ? and(
          eq(hymns.type, type),
          or(
            ilike(hymns.name, `%${search}%`),
            ilike(hymns.desc, `%${search}%`),
            ilike(hymns.nameEn, `%${search}%`),
            ilike(hymns.descEn, `%${search}%`)
          )
        )
      : eq(hymns.type, type);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: hymns.id,
          name: hymns.name,
          nameEn: hymns.nameEn,
          desc: hymns.desc,
          descEn: hymns.descEn,
          url: hymns.url,
          type: hymns.type,
          viewCount: hymns.viewCount,
          createdAt: hymns.createdAt,
        })
        .from(hymns)
        .where(whereCondition)
        .orderBy(desc(hymns.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(hymns)
        .where(whereCondition),
    ]);

    const { total, totalPages } = calculatePagination(totalResult[0].count, limit);

    return {
      total,
      totalPages,
      items: items.map((item) => ({
        ...item,
        createdAt: formatDate(item.createdAt),
      })),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch hymns');
  }
}

export interface HymnIds {
  ids: { id: number | null }[];
  hymns: IHymn[];
}

export async function getHymnsById(id: number, type: HYMN_TAB): DbResult<HymnIds> {
  try {
    const db = await handleDbConnection(getDb, 'GET_HYMNS_BY_ID');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }

    const [ids, hymnsData] = await Promise.all([
      db
        .select({ id: hymns.id })
        .from(hymns)
        .orderBy(desc(hymns.createdAt))
        .where(eq(hymns.type, type)),
      db
        .select({
          id: hymns.id,
          name: hymns.name,
          nameEn: hymns.nameEn,
          desc: hymns.desc,
          descEn: hymns.descEn,
          url: hymns.url,
          type: hymns.type,
          viewCount: hymns.viewCount,
          createdAt: hymns.createdAt,
        })
        .from(hymns)
        .where(eq(hymns.id, id)),
    ]);

    return {
      ids,
      hymns: hymnsData.map((hymn) => ({
        ...hymn,
        createdAt: formatDate(hymn.createdAt),
      })),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch hymns by id');
  }
}

export async function getHymnById(id: string): Promise<IHymn | null> {
  try {
    const db = await handleDbConnection(getDb, 'GET_HYMN_BY_ID');
    if (!db) return null;

    const result = await db
      .select({
        id: hymns.id,
        name: hymns.name,
        nameEn: hymns.nameEn,
        desc: hymns.desc,
        descEn: hymns.descEn,
        url: hymns.url,
        type: hymns.type,
        viewCount: hymns.viewCount,
        createdAt: hymns.createdAt,
      })
      .from(hymns)
      .where(eq(hymns.id, parseInt(id)))
      .limit(1);

    if (!result.length) return null;

    const hymn = result[0];
    return {
      ...hymn,
      createdAt: formatDate(hymn.createdAt),
    };
  } catch (error) {
    console.error('[GET_HYMN_BY_ID_ERROR]', error);
    return null;
  }
}
