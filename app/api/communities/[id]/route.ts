import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommunityById } from '@/app/lib/db/postgres/communities';
import { BaseItemSchema, handleApiError, ApiResponse } from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';

const FileSchema = z.object({
  id: z.number(),
  communityId: z.number(),
  url: z.string().nullable(),
  caption: z.string().nullable(),
  downloadCount: z.number().nullable(),
  createdAt: z.string().nullable(),
  captionEn: z.string().nullable(),
});

const CommunitySchema = BaseItemSchema.extend({
  name: z.string(),
  desc: z.string().nullable(),
  type: z.number(),
  url: z.string().nullable(),
  viewCount: z.number(),
  createdAt: z.string().nullable(),
  nameEn: z.string().nullable(),
  descEn: z.string().nullable(),
  files: z.array(FileSchema).optional(),
});

export type CommunityResponse = z.infer<typeof CommunitySchema>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          error: 'Community ID is required',
          status: 'error',
        },
        { status: 400 }
      );
    }

    const community = await getCommunityById(parseInt(id));
    
    if (!community) {
      return NextResponse.json(
        {
          error: 'Community not found',
          status: 'error',
        },
        { status: 404 }
      );
    }

    // Validate response data
    const validatedData = CommunitySchema.parse(community);

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

export type CommunityGetResponse = ApiResponse<CommunityResponse>; 