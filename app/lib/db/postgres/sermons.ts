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

/**
 * Create a new sermon
 */
export async function createSermon(data: {
  name: string;
  nameEn?: string;
  desc?: string;
  descEn?: string;
  url: string;
  type: number;
  viewCount?: number;
  createdAt?: string;
}): DbResult<ISermon> {
  try {
    const db = await handleDbConnection(getDb, 'CREATE_SERMON');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const [inserted] = await db
      .insert(sermons)
      .values({
        name: data.name,
        nameEn: data.nameEn,
        desc: data.desc,
        descEn: data.descEn,
        url: data.url,
        type: data.type,
        viewCount: data.viewCount,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      })
      .returning();
    if (!inserted) {
      return createErrorResponse(new Error('Insert failed'), 'Failed to create sermon');
    }
    return {
      ...inserted,
      createdAt: formatDate(inserted.createdAt),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to create sermon');
  }
}

/**
 * Utility to sanitize update data for sermons
 * - Non-nullable fields (name, url, type, viewCount) must not be set to null
 * - Nullable fields (desc, nameEn, descEn) can be set to null
 */
function sanitizeSermonUpdateData(
  data: Partial<Omit<ISermon, 'id'>>
): Record<string, string | number | Date | null | undefined> {
  const sanitized: Record<string, string | number | Date | null | undefined> = {};
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
 * Update an existing sermon
 */
export async function updateSermon(
  id: number,
  data: Partial<Omit<ISermon, 'id'>> & { createdAt?: string }
): DbResult<ISermon> {
  try {
    const db = await handleDbConnection(getDb, 'UPDATE_SERMON');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const sanitizedData = sanitizeSermonUpdateData(data);
    if (data.createdAt) {
      sanitizedData.createdAt = new Date(data.createdAt);
    }
    const [updated] = await db
      .update(sermons)
      .set(sanitizedData)
      .where(eq(sermons.id, id))
      .returning();
    if (!updated) {
      return createErrorResponse(new Error('Update failed'), 'Failed to update sermon');
    }
    return {
      ...updated,
      createdAt: formatDate(updated.createdAt),
    };
  } catch (error) {
    return createErrorResponse(error, 'Failed to update sermon');
  }
}

/**
 * Delete a sermon by id
 */
export async function deleteSermon(id: number): DbResult<{ id: number }> {
  try {
    const db = await handleDbConnection(getDb, 'DELETE_SERMON');
    if (!db) {
      return createErrorResponse(
        new Error('Database connection failed'),
        'Failed to connect to database'
      );
    }
    const [deleted] = await db
      .delete(sermons)
      .where(eq(sermons.id, id))
      .returning({ id: sermons.id });
    if (!deleted) {
      return createErrorResponse(new Error('Delete failed'), 'Failed to delete sermon');
    }
    return { id: deleted.id };
  } catch (error) {
    return createErrorResponse(error, 'Failed to delete sermon');
  }
}
