import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
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

interface GetHymnsParams extends Required<Pick<IPage, 'limit' | 'offset'>> {
  type: number;
  search?: string;
}

export type GetHymnsResult = IHymns | IError;

export async function getHymns({
  limit,
  offset,
  type,
  search,
}: GetHymnsParams): Promise<GetHymnsResult> {
  try {
    const db = (await getDb()) as NeonHttpDatabase;
    if (!db) throw new Error('Database connection failed');

    const whereCondition = search
      ? and(
          eq(hymns.type, type),
          or(ilike(hymns.name, `%${search}%`), ilike(hymns.desc, `%${search}%`), ilike(hymns.nameEn, `%${search}%`), ilike(hymns.descEn, `%${search}%`))
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

export type GetHymnsByIdResult = IHymnsById | IError;

export async function getHymnsById(id: number, type: HYMN_TAB): Promise<GetHymnsByIdResult> {
  try {
    const db = (await getDb()) as NeonHttpDatabase;
    if (!db) throw new Error('Database connection failed');

    const ids = await db
      .select({ id: hymns.id })
      .from(hymns)
      .orderBy(desc(hymns.createdAt))
      .where(eq(hymns.type, type));

    const hymnsData = await db
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
      .where(eq(hymns.id, id));

    const transformedHymns = hymnsData.map((hymn) => ({
      ...hymn,
      createdAt: hymn.createdAt ? DateTime.fromJSDate(hymn.createdAt).toISO() : null,
    }));

    return {
      ids,
      hymns: transformedHymns,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }
    return {
      message: 'An unknown error occurred',
    };
  }
}
