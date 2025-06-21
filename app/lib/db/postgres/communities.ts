import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { getDb } from './dbConnection';
import { communities, files } from './schema';
import { NEWS_TYPES } from '@/variables/enums';
import { IError, IPage } from '@/variables/types/common.types';

type Community = typeof communities.$inferSelect & {
  nameEn: string | null;
  descEn: string | null;
  viewCount: number;
};
type File = typeof files.$inferSelect;

export interface ICommunities {
  total: number;
  communities: (Omit<Community, 'createdAt'> & { createdAt: string | null })[];
  totalPages: number;
}

export type ICommunitiesType = Awaited<IError> | Awaited<ICommunities> | null;

interface IGetCommunities extends Required<Pick<IPage, 'limit' | 'offset'>> {
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
}: IGetCommunities): Promise<ICommunitiesType> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[GET_COMMUNITIES_ERROR] Database connection failed');
      return { message: 'Database connection failed' };
    }

    const whereCondition = type !== NEWS_TYPES.ALL ? eq(communities.type, type) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          community: {
            ...communities,
            nameEn: communities.nameEn,
            descEn: communities.descEn,
            viewCount: communities.viewCount,
          },
          file: files,
        })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(whereCondition)
        .orderBy(desc(communities.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*) as total` })
        .from(communities)
        .where(whereCondition),
    ]);

    const total = Number(totalResult[0].total) || 0;
    const totalPages = Math.ceil(total / limit);

    // 결과를 커뮤니티와 파일 목록으로 구조화
    const communitiesMap = rows.reduce<
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

    const transformedCommunities = Object.values(communitiesMap)
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
      totalPages,
    };
  } catch (error) {
    console.error('[GET_COMMUNITIES_ERROR]', error);
    return {
      message: error instanceof Error ? error.message : 'Failed to fetch communities',
    };
  }
}

export interface ICommunitiesById {
  ids: { id: number | null }[];
  communities: (Omit<Community, 'createdAt'> & { createdAt: string | null })[];
}

export type ICommunityType = Awaited<IError> | Awaited<ICommunitiesById> | null;

export async function getCommunitiesById(id: number, type: NEWS_TYPES): Promise<ICommunityType> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[GET_COMMUNITIES_BY_ID_ERROR] Database connection failed');
      return { message: 'Database connection failed' };
    }

    const [ids, rows] = await Promise.all([
      db
        .select({ id: communities.id })
        .from(communities)
        .orderBy(desc(communities.createdAt))
        .where(eq(communities.type, type)),
      db
        .select({
          community: {
            ...communities,
            nameEn: communities.nameEn,
            descEn: communities.descEn,
            viewCount: communities.viewCount,
          },
          file: files,
        })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(and(inArray(communities.id, [id]), eq(communities.type, type)))
        .orderBy(desc(communities.createdAt)),
    ]);

    // 결과를 커뮤니티와 파일 목록으로 구조화
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
    console.error('[GET_COMMUNITIES_BY_ID_ERROR]', error);
    return {
      message: error instanceof Error ? error.message : 'Failed to fetch communities',
    };
  }
}

export async function getCommunityById(id: number) {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[GET_COMMUNITY_BY_ID_ERROR] Database connection failed');
      return null;
    }

    const rows = await db
      .select({
        community: {
          ...communities,
          nameEn: communities.nameEn,
          descEn: communities.descEn,
          viewCount: communities.viewCount,
        },
        file: files,
      })
      .from(communities)
      .leftJoin(files, eq(communities.id, files.communityId))
      .where(eq(communities.id, id));

    if (rows.length === 0) {
      return null;
    }

    // 결과를 커뮤니티와 파일 목록으로 구조화
    const result = rows.reduce<{
      community: Community;
      files: (Omit<File, 'createdAt'> & { createdAt: string | null })[];
    }>(
      (acc, row) => {
        if (!acc.community) {
          acc.community = row.community;
        }
        if (row.file) {
          acc.files.push({
            ...row.file,
            createdAt: formatDate(row.file.createdAt),
          });
        }
        return acc;
      },
      { community: rows[0].community, files: [] }
    );

    return {
      ...result.community,
      createdAt: formatDate(result.community.createdAt),
      files: result.files,
    };
  } catch (error) {
    console.error('[GET_COMMUNITY_BY_ID_ERROR]', error);
    return null;
  }
}
