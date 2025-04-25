import { NextRequest, NextResponse } from 'next/server';
import { getSermons } from '@/app/lib/db/postgres/sermons';
import { z } from 'zod';
import {
  BaseItemSchema,
  createResponseSchema,
  handleApiError,
  createEmptyResponse,
  ApiResponse,
} from '@/app/lib/api-utils';
import { ISermonsResponse } from '@/app/variables/interfaces';

export const dynamic = 'force-dynamic';

const SermonSchema = BaseItemSchema.extend({
  // Add any sermon-specific fields here if needed
});

const ResponseSchema = createResponseSchema(SermonSchema);
export type SermonsResponse = z.infer<typeof ResponseSchema>;

// Define query schema with string transformations
const QuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => parseInt(val) || 10),
  type: z.string().transform((val) => parseInt(val) || 0),
  search: z.string().nullable().optional(),
});

// Type guard to check if the result is ISermonsResponse
function isSermonsResponse(result: unknown): result is ISermonsResponse {
  return (
    result !== null &&
    typeof result === 'object' &&
    'total' in result &&
    'totalPages' in result &&
    'items' in result &&
    Array.isArray((result as ISermonsResponse).items)
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate query parameters
    const query = QuerySchema.parse({
      page: req.nextUrl.searchParams.get('page') || '1',
      limit: req.nextUrl.searchParams.get('limit') || '10',
      type: req.nextUrl.searchParams.get('type') || '0',
      search: req.nextUrl.searchParams.get('search'),
    });

    const offset = (query.page - 1) * query.limit;
    const result = await getSermons({
      limit: query.limit,
      offset,
      type: query.type,
      search: query.search || undefined,
    });

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

    if (!isSermonsResponse(result)) {
      return NextResponse.json(
        {
          error: 'Invalid response format',
          status: 'error',
        },
        { status: 500 }
      );
    }

    // Validate response data
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

export type SermonsGetResponse = ApiResponse<SermonsResponse>;
