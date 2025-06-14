import { NextRequest, NextResponse } from 'next/server';
import { getHymns, createHymn, deleteHymn } from '@/app/lib/db/postgres/hymns';
import { z } from 'zod';
import {
  QuerySchema as BaseQuerySchema,
  BaseItemSchema,
  createResponseSchema,
  handleApiError,
  ApiResponse,
  createEmptyResponse,
} from '@/app/lib/api-utils';
import { IHymnsResponse } from '@/app/variables/interfaces';

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

// Type guard for IHymnsResponse
function isHymnsResponse(result: unknown): result is IHymnsResponse {
  return (
    result !== null &&
    typeof result === 'object' &&
    'total' in result &&
    'totalPages' in result &&
    'items' in result &&
    Array.isArray((result as IHymnsResponse).items)
  );
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

// 날짜를 Postgres timestamp 포맷으로 변환
function toPgTimestamp(dateStr: string): string {
  return `${dateStr.trim()} 00:00:00.000000`;
}

// POST: 찬송가 추가
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Zod 유효성 검사 (BaseItemSchema 활용)
    const HymnCreateSchema = BaseItemSchema.extend({
      id: z.number().optional(),
      createdAt: z.string().optional(),
      url: z.string(),
      type: z.number(),
      nameEn: z.string().nullable().optional(),
      desc: z.string().nullable().optional(),
      descEn: z.string().nullable().optional(),
      soulType: z.number().optional(),
      date: z.string().optional(),
    });
    const parsed = HymnCreateSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors, status: 'error' }, { status: 400 });
    }
    const cleanData = { ...parsed.data };
    if (typeof cleanData.soulType === 'number') cleanData.viewCount = cleanData.soulType;
    delete cleanData.soulType;
    if (typeof cleanData.date === 'string' && cleanData.date) {
      cleanData.createdAt = toPgTimestamp(cleanData.date);
    }
    delete cleanData.date;
    if (cleanData.nameEn === null) cleanData.nameEn = undefined;
    if (cleanData.desc === null) cleanData.desc = undefined;
    if (cleanData.descEn === null) cleanData.descEn = undefined;
    const result = await createHymn({
      name: cleanData.name,
      nameEn: cleanData.nameEn as string | undefined,
      desc: cleanData.desc as string | undefined,
      descEn: cleanData.descEn as string | undefined,
      url: cleanData.url,
      type: cleanData.type,
      createdAt: cleanData.createdAt as string | undefined,
    });
    if ('message' in result) {
      return NextResponse.json({ error: result.message, status: 'error' }, { status: 500 });
    }
    return NextResponse.json({ payload: result, status: 'success' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Internal server error', status: 'error' }, { status: 500 });
  }
}

// DELETE: 여러 개 id 받아 일괄 삭제
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const IdsSchema = z.object({ ids: z.array(z.number()) });
    const parsed = IdsSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid ids', details: parsed.error.errors, status: 'error' }, { status: 400 });
    }
    const results = await Promise.all(parsed.data.ids.map(id => deleteHymn(id)));
    // null -> undefined 변환 (응답 타입 일치)
    const cleanResults = results.map(result => {
      if (result && typeof result === 'object') {
        const r = { ...result };
        if ('nameEn' in r && r.nameEn === null) r.nameEn = undefined;
        if ('desc' in r && r.desc === null) r.desc = undefined;
        if ('descEn' in r && r.descEn === null) r.descEn = undefined;
        return r;
      }
      return result;
    });
    const errors = cleanResults.filter(r => 'message' in r);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Some deletes failed', details: errors, status: 'error' }, { status: 500 });
    }
    return NextResponse.json({ payload: cleanResults, status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Internal server error', status: 'error' }, { status: 500 });
  }
}
