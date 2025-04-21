import { NextRequest, NextResponse } from 'next/server';
import { getHymns } from '@/app/lib/db/postgres/hymns';
import { z } from 'zod';
import {
  QuerySchema as BaseQuerySchema,
  BaseItemSchema,
  createResponseSchema,
  handleApiError,
  ApiResponse,
} from '@/app/lib/api-utils';
import { IError, IHymn } from '@/app/variables/interfaces';

export const dynamic = 'force-dynamic';

const HymnSchema = BaseItemSchema.extend({
  // Add any hymn-specific fields here if needed
});

const ResponseSchema = createResponseSchema(HymnSchema);
export type HymnsResponse = z.infer<typeof ResponseSchema>;

// Extend the base query schema with search
const QuerySchema = BaseQuerySchema.extend({
  search: z.string().optional(),
});

// Type guard for IHymns
function isHymnsResponse(
  result: IError | { total: number; totalPages: number; items: IHymn[] }
): result is { total: number; totalPages: number; items: IHymn[] } {
  return result && 'total' in result && 'totalPages' in result && 'items' in result;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParam = req.nextUrl.searchParams.get('search');

    // Validate query parameters
    const query = QuerySchema.parse({
      page: req.nextUrl.searchParams.get('page'),
      limit: req.nextUrl.searchParams.get('limit'),
      type: req.nextUrl.searchParams.get('type'),
      search: searchParam || undefined,
    });

    const offset = (query.page - 1) * query.limit;
    const result = await getHymns({
      limit: query.limit,
      offset,
      type: query.type,
      search: searchParam || undefined,
    });

    if (!result) {
      return NextResponse.json({
        payload: {
          items: [],
          total: 0,
          totalPages: 0,
        },
        status: 'success',
      });
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

    if (!isHymnsResponse(result)) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          status: 'error',
        },
        { status: 500 }
      );
    }

    // At this point, result is guaranteed to have the correct shape
    const validatedData = ResponseSchema.parse({
      total: result.total,
      totalPages: result.totalPages,
      items: result.items,
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

export type HymnsGetResponse = ApiResponse<HymnsResponse>;
