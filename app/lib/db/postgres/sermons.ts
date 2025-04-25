import { desc, eq, ilike, or, and, sql } from 'drizzle-orm';
import { getDb } from './dbConnection';
import { sermons } from './schema';
import { ISermon } from '@/app/variables/interfaces';
import {
  IPage,
  IPaginatedResponse,
  DbResult,
  formatDate,
  handleDbConnection,
  createErrorResponse,
  calculatePagination,
} from './utils';

export type SermonsResponse = IPaginatedResponse<ISermon>;

interface GetSermonsParams extends Required<Pick<IPage, 'limit' | 'offset'>> {
  type: number;
  search?: string;
}

export async function getSermons({
  limit = 10,
  offset = 0,
  type,
  search,
}: GetSermonsParams): DbResult<SermonsResponse> {
  try {
    const db = await handleDbConnection(getDb, 'GET_SERMONS');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }

    const whereCondition = search
      ? and(
          eq(sermons.type, type),
          or(
            ilike(sermons.name, `%${search}%`),
            ilike(sermons.desc, `%${search}%`),
            ilike(sermons.nameEn, `%${search}%`),
            ilike(sermons.descEn, `%${search}%`)
          )
        )
      : eq(sermons.type, type);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: sermons.id,
          name: sermons.name,
          nameEn: sermons.nameEn,
          desc: sermons.desc,
          descEn: sermons.descEn,
          url: sermons.url,
          type: sermons.type,
          viewCount: sermons.viewCount,
          createdAt: sermons.createdAt,
        })
        .from(sermons)
        .where(whereCondition)
        .orderBy(desc(sermons.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(sermons)
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
    return createErrorResponse(error, 'Failed to fetch sermons');
  }
}

export interface SermonIds {
  ids: { id: number | null }[];
  sermons: ISermon[];
}

export async function getSermonsById(id: number, type: number): DbResult<SermonIds> {
  try {
    const db = await handleDbConnection(getDb, 'GET_SERMONS_BY_ID');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }

    const [ids, sermonsData] = await Promise.all([
      db
        .select({ id: sermons.id })
        .from(sermons)
        .orderBy(desc(sermons.createdAt))
        .where(eq(sermons.type, type)),
      db
        .select({
          id: sermons.id,
          name: sermons.name,
          nameEn: sermons.nameEn,
          desc: sermons.desc,
          descEn: sermons.descEn,
          url: sermons.url,
          type: sermons.type,
          viewCount: sermons.viewCount,
          createdAt: sermons.createdAt,
        })
        .from(sermons)
        .where(eq(sermons.id, id)),
    ]);

    return {
      ids,
      sermons: sermonsData.map((sermon) => ({
        ...sermon,
        createdAt: formatDate(sermon.createdAt),
      })),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch sermons by id');
  }
}

export async function getSermonById(id: string): Promise<ISermon | null> {
  try {
    const db = await handleDbConnection(getDb, 'GET_SERMON_BY_ID');
    if (!db) return null;

    const result = await db
      .select({
        id: sermons.id,
        name: sermons.name,
        nameEn: sermons.nameEn,
        desc: sermons.desc,
        descEn: sermons.descEn,
        url: sermons.url,
        type: sermons.type,
        viewCount: sermons.viewCount,
        createdAt: sermons.createdAt,
      })
      .from(sermons)
      .where(eq(sermons.id, parseInt(id)))
      .limit(1);

    if (!result.length) return null;

    const sermon = result[0];
    return {
      ...sermon,
      createdAt: formatDate(sermon.createdAt),
    };
  } catch (error) {
    console.error('[GET_SERMON_BY_ID_ERROR]', error);
    return null;
  }
}
