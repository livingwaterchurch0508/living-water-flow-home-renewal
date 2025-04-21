import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { getDb } from './dbConnection';
import { communities, files } from './schema';
import { NEWS_TAB, NEWS_TYPES } from '@/app/variables/enums';
import { IError, IPage } from '@/app/variables/interfaces';

type Community = typeof communities.$inferSelect;
type File = typeof files.$inferSelect;

export interface ICommunities {
  total: number;
  communities: (Omit<Community, 'createdAt'> & { createdAt: string | null })[];
  totalPages: number;
}

export type ICommunitiesType = Awaited<IError> | Awaited<ICommunities> | null;

interface IGetCommunities extends IPage {
  type?: NEWS_TYPES;
}

const formatDate = (date: Date | string | null): string | null => {
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

export async function getCommunities({
  type = NEWS_TYPES.ALL,
  offset = 0,
  limit = 10,
}: IGetCommunities) {
  const db: NeonHttpDatabase<Record<string, never>> | null = await getDb();

  if (!db) return null;

  try {
    const totalQuery = db.select({ total: sql<number>`count(*) as total` }).from(communities);

    if (type !== NEWS_TYPES.ALL) {
      totalQuery.where(eq(communities.type, type));
    }

    const [results] = await totalQuery;
    const total = Number(results.total) || 0;

    const query = db
      .select()
      .from(communities)
      .orderBy(desc(communities.createdAt))
      .limit(limit)
      .offset(offset);

    if (type !== NEWS_TYPES.ALL) {
      query.where(eq(communities.type, type));
    }

    const communitiesRows = await query;
    const communityIds = communitiesRows.map((community) => community.id);

    let rows;
    if (type === NEWS_TYPES.ALL) {
      rows = await db
        .select({ community: communities, file: files })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(inArray(communities.id, communityIds))
        .orderBy(desc(communities.createdAt));
    } else {
      rows = await db
        .select({ community: communities, file: files })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(and(inArray(communities.id, communityIds), eq(communities.type, type)))
        .orderBy(desc(communities.createdAt));
    }

    const result = rows.reduce<
      Record<
        number,
        {
          community: Omit<Community, 'createdAt'> & { createdAt: string | null };
          files: (Omit<File, 'createdAt'> & { createdAt: string | null })[];
        }
      >
    >((acc, row) => {
      const { community, file } = row;

      if (!acc[community.id]) {
        acc[community.id] = {
          community: {
            ...community,
            createdAt: formatDate(community.createdAt),
          },
          files: [],
        };
      }
      if (file) {
        acc[community.id].files.push({
          ...file,
          createdAt: formatDate(file.createdAt),
        });
      }
      return acc;
    }, {});

    const transformedCommunities = Object.values(result)
      .map(({ community, files }) => ({
        ...community,
        files,
      }))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return DateTime.fromISO(b.createdAt).toMillis() - DateTime.fromISO(a.createdAt).toMillis();
      });

    return {
      total,
      communities: transformedCommunities,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('[GET_COMMUNITIES_ERROR]', error);
    return error as { message: string };
  }
}

export interface ICommunitiesById {
  ids: { id: number | null }[];
  communities: (Omit<Community, 'createdAt'> & { createdAt: string | null })[];
}

export type ICommunityType = Awaited<IError> | Awaited<ICommunitiesById> | null;

export async function getCommunitiesById(id: number, type: NEWS_TAB) {
  const db: NeonHttpDatabase<Record<string, never>> | null = await getDb();

  if (!db) return null;

  try {
    const ids = await db
      .select({ id: communities.id })
      .from(communities)
      .orderBy(desc(communities.createdAt))
      .where(eq(communities.type, type));

    const rows = await db
      .select({ community: communities, file: files })
      .from(communities)
      .leftJoin(files, eq(communities.id, files.communityId))
      .where(and(inArray(communities.id, [id]), eq(communities.type, type)))
      .orderBy(desc(communities.createdAt));

    const result = rows.reduce<
      Record<
        number,
        {
          community: Omit<Community, 'createdAt'> & { createdAt: string | null };
          files: (Omit<File, 'createdAt'> & { createdAt: string | null })[];
        }
      >
    >((acc, row) => {
      const { community, file } = row;

      if (!acc[community.id]) {
        acc[community.id] = {
          community: {
            ...community,
            createdAt: formatDate(community.createdAt),
          },
          files: [],
        };
      }
      if (file) {
        acc[community.id].files.push({
          ...file,
          createdAt: formatDate(file.createdAt),
        });
      }
      return acc;
    }, {});

    return {
      ids,
      communities: Object.values(result).map(({ community, files }) => ({
        ...community,
        files,
      })),
    };
  } catch (error) {
    console.error('[GET_COMMUNITY_BY_ID_ERROR]', error);
    return error as { message: string };
  }
}
