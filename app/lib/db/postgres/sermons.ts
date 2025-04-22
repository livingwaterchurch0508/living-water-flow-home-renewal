import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { desc, eq, ilike, sql } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { getDb } from './dbConnection';
import { sermons } from './schema';
import { IError, IPage, ISermon } from '@/app/variables/interfaces';

export interface ISermons {
  total: number;
  items: ISermon[];
  totalPages: number;
}

interface GetSermonsParams extends Required<Pick<IPage, 'limit' | 'offset'>> {
  type: number;
  search?: string;
}

export async function getSermons({
  limit = 10,
  offset = 0,
  type,
  search,
}: GetSermonsParams): Promise<ISermons | IError> {
  try {
    const db = (await getDb()) as NeonHttpDatabase;
    if (!db) throw new Error('Database connection failed');

    let whereClause: SQL = eq(sermons.type, type);
    if (search) {
      whereClause = sql`${whereClause} AND (${ilike(sermons.name, `%${search}%`)} OR ${ilike(sermons.desc, `%${search}%`)})`;
    }

    const items = await db
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
      .where(whereClause)
      .orderBy(desc(sermons.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sermons)
      .where(whereClause);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt ? DateTime.fromJSDate(item.createdAt).toISO() : null,
      })),
    };
  } catch (error) {
    console.error('Error in getSermons:', error);
    return {
      message: 'Failed to fetch sermons',
    };
  }
}

export interface ISermonsById {
  ids: { id: number | null }[];
  sermons: ISermon[];
}

export type ISermonType = Awaited<IError> | Awaited<ISermonsById> | null;

export async function getSermonsById(id: number, type: number) {
  try {
    const db = (await getDb()) as NeonHttpDatabase;
    if (!db) throw new Error('Database connection failed');

    const ids = await db
      .select({ id: sermons.id })
      .from(sermons)
      .orderBy(desc(sermons.createdAt))
      .where(eq(sermons.type, type));

    const sermonsData = await db
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
      .where(eq(sermons.id, id));

    const transformedSermons = sermonsData.map((sermon) => ({
      ...sermon,
      createdAt: sermon.createdAt
        ? DateTime.fromJSDate(new Date(sermon.createdAt)).setZone('Asia/Seoul').toISO()
        : null,
    }));

    return {
      ids,
      sermons: transformedSermons,
    };
  } catch (error) {
    console.error('[GET_SERMON_BY_ID_ERROR]', error);
    return error as { message: string };
  }
}
