import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSermonById, updateSermon, deleteSermon } from '@/lib/db/postgres/sermons';
import { BaseItemSchema, handleApiError, ApiResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const SermonSchema = BaseItemSchema.extend({
  // Add any sermon-specific fields here if needed
});

export type SermonResponse = z.infer<typeof SermonSchema>;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          error: 'Sermon ID is required',
          status: 'error',
        },
        { status: 400 }
      );
    }
    const sermon = await getSermonById(id);
    if (!sermon) {
      return NextResponse.json(
        {
          error: 'Sermon not found',
          status: 'error',
        },
        { status: 404 }
      );
    }
    // Validate response data
    const validatedData = SermonSchema.parse(sermon);
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

export type SermonGetResponse = ApiResponse<SermonResponse>;

// 날짜를 Postgres timestamp 포맷으로 변환
function toPgTimestamp(dateStr: string): string {
  return `${dateStr.trim()} 00:00:00.000000`;
}

// PUT: 설교 수정
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Sermon ID is required', status: 'error' }, { status: 400 });
    }
    const data = await req.json();
    // Zod 유효성 검사 (BaseItemSchema 활용)
    const SermonUpdateSchema = BaseItemSchema.extend({
      url: z.string().optional(),
      type: z.number().optional(),
      nameEn: z.string().nullable().optional(),
      desc: z.string().nullable().optional(),
      descEn: z.string().nullable().optional(),
      soulType: z.number().optional(),
      date: z.string().optional(),
      createdAt: z.string().optional(),
    });
    const parsed = SermonUpdateSchema.safeParse(data);
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
    const result = await updateSermon(Number(id), {
      ...cleanData,
      nameEn: cleanData.nameEn as string | undefined,
      desc: cleanData.desc as string | undefined,
      descEn: cleanData.descEn as string | undefined,
      viewCount: cleanData.viewCount as number | undefined,
      createdAt: cleanData.createdAt as string | undefined,
    });
    if ('message' in result) {
      return NextResponse.json({ error: result.message, status: 'error' }, { status: 500 });
    }
    return NextResponse.json({ payload: result, status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Internal server error', status: 'error' }, { status: 500 });
  }
}

// DELETE: 설교 단일 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Sermon ID is required', status: 'error' }, { status: 400 });
    }
    const result = await deleteSermon(Number(id));
    if ('message' in result) {
      return NextResponse.json({ error: result.message, status: 'error' }, { status: 500 });
    }
    return NextResponse.json({ payload: result, status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Internal server error', status: 'error' }, { status: 500 });
  }
}
