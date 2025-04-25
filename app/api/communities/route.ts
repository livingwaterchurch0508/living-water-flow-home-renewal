import { NextRequest, NextResponse } from 'next/server';
import { getCommunities } from '@/app/lib/db/postgres/communities';
import { z } from 'zod';
import {
  QuerySchema,
  BaseItemSchema,
  createResponseSchema,
  handleApiError,
  createEmptyResponse,
  ApiResponse,
} from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';

const FileSchema = z.object({
  id: z.number(),
  communityId: z.number(),
  url: z.string(),
  caption: z.string().nullable(),
  downloadCount: z.number().nullable(),
  createdAt: z.string().nullable(),
  captionEn: z.string().nullable(),
});

const CommunitySchema = BaseItemSchema.extend({
  files: z.array(FileSchema).optional(),
});

const ResponseSchema = createResponseSchema(CommunitySchema);
export type CommunitiesResponse = z.infer<typeof ResponseSchema>;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate query parameters
    const query = QuerySchema.parse({
      page: req.nextUrl.searchParams.get('page'),
      limit: req.nextUrl.searchParams.get('limit'),
      type: req.nextUrl.searchParams.get('type'),
    });

    const offset = (query.page - 1) * query.limit;
    const result = await getCommunities({ limit: query.limit, offset, type: query.type });

    if (!result) {
      return createEmptyResponse();
    }

    if ('message' in result) {
      return NextResponse.json(
        {
          error: result.message,
          status: 'error',
        },
        { status: 500 }
      );
    }

    if (!('communities' in result)) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          status: 'error',
        },
        { status: 500 }
      );
    }

    const validatedData = ResponseSchema.parse({
      items: result.communities,
      total: result.total,
      totalPages: result.totalPages,
    });

    return NextResponse.json(
      {
        payload: validatedData,
        status: 'success',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
export type CommunitiesGetResponse = ApiResponse<CommunitiesResponse>;
