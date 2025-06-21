import { NextResponse } from 'next/server';
import { desc, ilike, or, eq } from 'drizzle-orm';

import { db } from '@/lib/db/postgres/dbConnection';
import { sermons, hymns, communities, files } from '@/lib/db/postgres/schema';
import { YOUTUBE_URL } from '@/variables/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Query parameter is required',
        },
        { status: 400 }
      );
    }

    const [sermonsResults, hymnsResults, communitiesResults] = await Promise.all([
      // Search in sermons
      db
        .select({
          id: sermons.id,
          name: sermons.name,
          nameEn: sermons.nameEn,
          desc: sermons.desc,
          descEn: sermons.descEn,
          type: sermons.type,
          url: sermons.url,
          createdAt: sermons.createdAt,
        })
        .from(sermons)
        .where(
          or(
            ilike(sermons.name, `%${query}%`),
            ilike(sermons.desc, `%${query}%`),
            ilike(sermons.nameEn, `%${query}%`),
            ilike(sermons.descEn, `%${query}%`)
          )
        )
        .orderBy(desc(sermons.createdAt))
        .limit(5),

      // Search in hymns
      db
        .select({
          id: hymns.id,
          name: hymns.name,
          nameEn: hymns.nameEn,
          desc: hymns.desc,
          descEn: hymns.descEn,
          url: hymns.url,
          type: hymns.type,
          createdAt: hymns.createdAt,
        })
        .from(hymns)
        .where(
          or(
            ilike(hymns.name, `%${query}%`),
            ilike(hymns.desc, `%${query}%`),
            ilike(hymns.nameEn, `%${query}%`),
            ilike(hymns.descEn, `%${query}%`)
          )
        )
        .orderBy(desc(hymns.createdAt))
        .limit(5),

      // Search in communities with files
      db
        .select({
          id: communities.id,
          name: communities.name,
          nameEn: communities.nameEn,
          desc: communities.desc,
          descEn: communities.descEn,
          createdAt: communities.createdAt,
          fileUrl: files.url,
          fileCaption: files.caption,
        })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(
          or(
            ilike(communities.name, `%${query}%`),
            ilike(communities.desc, `%${query}%`),
            ilike(communities.nameEn, `%${query}%`),
            ilike(communities.descEn, `%${query}%`)
          )
        )
        .orderBy(desc(communities.createdAt))
        .limit(5),
    ]);

    // YouTube 썸네일 URL 변환
    const processedSermonsResults = sermonsResults.map((sermon) => ({
      ...sermon,
      thumbnailUrl: sermon.url
        ? `${YOUTUBE_URL.THUMB_NAIL}${sermon.url.split('v=')[1]}/mqdefault.jpg`
        : null,
    }));

    const processedHymnsResults = hymnsResults.map((hymn) => ({
      ...hymn,
      thumbnailUrl: hymn.url
        ? `${YOUTUBE_URL.THUMB_NAIL}${hymn.url.split('v=')[1]}/mqdefault.jpg`
        : null,
    }));

    // Process communities results to match the expected format
    const processedCommunitiesResults = communitiesResults.map((community) => ({
      ...community,
      files: community.fileUrl ? [{ url: community.fileUrl, caption: community.fileCaption }] : [],
    }));

    return NextResponse.json({
      status: 'success',
      payload: {
        sermons: processedSermonsResults,
        hymns: processedHymnsResults,
        communities: processedCommunitiesResults,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
