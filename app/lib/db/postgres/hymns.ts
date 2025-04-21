import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { desc, eq, ilike, or, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { getDb } from './dbConnection';
import { hymns } from './schema';
import { IError, IHymn, IPage } from '@/app/variables/interfaces';
import { HYMN_TAB } from '@/app/variables/enums';

export interface IHymns {
  total: number;
  items: IHymn[];
  totalPages: number;
}

interface GetHymnsParams extends IPage {
  type: number;
  search?: string;
}

export async function getHymns({
  limit,
  offset,
  type,
  search,
}: GetHymnsParams): Promise<IHymns | IError> {
  try {
    const db: NeonHttpDatabase = await getDb();

    let query = db
      .select({
        id: hymns.id,
        name: hymns.name,
        desc: hymns.desc,
        url: hymns.url,
        type: hymns.type,
        createdAt: hymns.createdAt,
      })
      .from(hymns)
      .where(eq(hymns.type, type));

    // Add search condition if search query exists
    if (search) {
      query = query.where(or(ilike(hymns.name, `%${search}%`), ilike(hymns.desc, `%${search}%`)));
    }

    const [items, totalResult] = await Promise.all([
      query.orderBy(desc(hymns.createdAt)).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(hymns)
        .where(eq(hymns.type, type)),
    ]);

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
    console.error('Error in getHymns:', error);
    return {
      message: 'Failed to fetch hymns',
    };
  }
}

export interface IHymnsById {
  ids: { id: number | null }[];
  hymns: IHymn[];
}

export type IHymnType = Awaited<IError> | Awaited<IHymnsById> | null;

export async function getHymnsById(id: number, type: HYMN_TAB) {
  const db: NeonHttpDatabase<Record<string, never>> | null = await getDb();

  if (!db) return null;

  try {
    const ids = await db
      .select({ id: hymns.id })
      .from(hymns)
      .orderBy(desc(hymns.createdAt))
      .where(eq(hymns.type, type));

    const hymnsData = await db.select().from(hymns).where(eq(hymns.id, id));

    // Transform dates using Luxon
    const transformedHymns = hymnsData.map((hymn) => ({
      ...hymn,
      createdAt: hymn.createdAt
        ? DateTime.fromJSDate(new Date(hymn.createdAt)).setZone('Asia/Seoul').toISO()
        : null,
    }));

    return {
      ids,
      hymns: transformedHymns,
    };
  } catch (error) {
    console.error('[GET_HYMN_BY_ID_ERROR]', error);
    return error as { message: string };
  }
}
