import { NextResponse } from 'next/server';
import { desc, ilike, or, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db/postgres/dbConnection';
import { sermons, hymns, communities, files } from '@/app/lib/db/postgres/schema';

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
          type: sermons.type,
          url: sermons.url,
          createdAt: sermons.createdAt,
        })
        .from(sermons)
        .where(or(ilike(sermons.name, `%${query}%`), ilike(sermons.desc, `%${query}%`)))
        .orderBy(desc(sermons.createdAt))
        .limit(5),

      // Search in hymns
      db
        .select({
          id: hymns.id,
          name: hymns.name,
          url: hymns.url,
          createdAt: hymns.createdAt,
        })
        .from(hymns)
        .where(or(ilike(hymns.name, `%${query}%`), ilike(hymns.desc, `%${query}%`)))
        .orderBy(desc(hymns.createdAt))
        .limit(5),

      // Search in communities with files
      db
        .select({
          id: communities.id,
          name: communities.name,
          createdAt: communities.createdAt,
          fileUrl: files.url,
        })
        .from(communities)
        .leftJoin(files, eq(communities.id, files.communityId))
        .where(or(ilike(communities.name, `%${query}%`), ilike(communities.desc, `%${query}%`)))
        .orderBy(desc(communities.createdAt))
        .limit(5),
    ]);

    // YouTube 썸네일 URL 변환
    const processedSermonsResults = sermonsResults.map((sermon) => ({
      ...sermon,
      thumbnailUrl: sermon.url
        ? `https://img.youtube.com/vi/${sermon.url.split('v=')[1]}/mqdefault.jpg`
        : null,
    }));

    const processedHymnsResults = hymnsResults.map((hymn) => ({
      ...hymn,
      thumbnailUrl: hymn.url
        ? `https://img.youtube.com/vi/${hymn.url.split('v=')[1]}/mqdefault.jpg`
        : null,
    }));

    // Process communities results to match the expected format
    const processedCommunitiesResults = communitiesResults.map((community) => ({
      ...community,
      files: community.fileUrl ? [{ url: community.fileUrl }] : [],
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
