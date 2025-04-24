import { NextRequest, NextResponse } from 'next/server';
import { getHymnById } from '@/app/lib/db/postgres/hymns';
import { z } from 'zod';
import {
  BaseItemSchema,
  handleApiError,
  ApiResponse,
} from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';

const HymnSchema = BaseItemSchema.extend({
  // Add any hymn-specific fields here if needed
});

export type HymnResponse = z.infer<typeof HymnSchema>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          error: 'Hymn ID is required',
          status: 'error',
        },
        { status: 400 }
      );
    }

    const hymn = await getHymnById(id);
    
    if (!hymn) {
      return NextResponse.json(
        {
          error: 'Hymn not found',
          status: 'error',
        },
        { status: 404 }
      );
    }

    // Validate response data
    const validatedData = HymnSchema.parse(hymn);

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

export type HymnGetResponse = ApiResponse<HymnResponse>; 