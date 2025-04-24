import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSermonById } from '@/app/lib/db/postgres/sermons';
import { BaseItemSchema, handleApiError, ApiResponse } from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';

const SermonSchema = BaseItemSchema.extend({
  // Add any sermon-specific fields here if needed
});

export type SermonResponse = z.infer<typeof SermonSchema>;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
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
