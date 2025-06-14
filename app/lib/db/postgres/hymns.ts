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

/**
 * Create a new hymn
 */
export async function createHymn(data: {
  name: string;
  nameEn?: string;
  desc?: string;
  descEn?: string;
  url: string;
  type: number;
  createdAt?: string;
}): DbResult<IHymn> {
  try {
    const db = await handleDbConnection(getDb, 'CREATE_HYMN');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const [inserted] = await db
      .insert(hymns)
      .values({
        name: data.name,
        nameEn: data.nameEn,
        desc: data.desc,
        descEn: data.descEn,
        url: data.url,
        type: data.type,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      })
      .returning();
    if (!inserted) {
      return createErrorResponse(new Error('Insert failed'), 'Failed to create hymn');
    }
    return {
      ...inserted,
      createdAt: formatDate(inserted.createdAt),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to create hymn');
  }
}

/**
 * Utility to sanitize update data for hymns
 * - Non-nullable fields (name, url, type, viewCount) must not be set to null
 * - Nullable fields (desc, nameEn, descEn) can be set to null
 */
function sanitizeHymnUpdateData(
  data: Partial<Omit<IHymn, 'id' | 'createdAt'>>
): Record<string, string | number | null | undefined> {
  const sanitized: Record<string, string | number | null | undefined> = {};
  if (data.name !== undefined && data.name !== null) sanitized.name = data.name;
  if (data.url !== undefined && data.url !== null) sanitized.url = data.url;
  if (data.type !== undefined && data.type !== null) sanitized.type = data.type;
  if (data.viewCount !== undefined && data.viewCount !== null) sanitized.viewCount = data.viewCount;
  if (data.desc !== undefined) sanitized.desc = data.desc;
  if (data.nameEn !== undefined) sanitized.nameEn = data.nameEn;
  if (data.descEn !== undefined) sanitized.descEn = data.descEn;
  return sanitized;
}

/**
 * Update an existing hymn
 */
export async function updateHymn(
  id: number,
  data: Partial<Omit<IHymn, 'id'>> & { createdAt?: string }
): DbResult<IHymn> {
  try {
    const db = await handleDbConnection(getDb, 'UPDATE_HYMN');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const sanitizedData = sanitizeHymnUpdateData(data);
    const [updated] = await db.update(hymns).set(sanitizedData).where(eq(hymns.id, id)).returning();
    if (!updated) {
      return createErrorResponse(new Error('Update failed'), 'Failed to update hymn');
    }
    return {
      ...updated,
      createdAt: formatDate(updated.createdAt),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to update hymn');
  }
}

/**
 * Delete a hymn by id
 */
export async function deleteHymn(id: number): DbResult<{ id: number }> {
  try {
    const db = await handleDbConnection(getDb, 'DELETE_HYMN');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const [deleted] = await db.delete(hymns).where(eq(hymns.id, id)).returning({ id: hymns.id });
    if (!deleted) {
      return createErrorResponse(new Error('Delete failed'), 'Failed to delete hymn');
    }
    return { id: deleted.id };
  } catch (error) {
    return createErrorResponse(error, 'Failed to delete hymn');
  }
}
