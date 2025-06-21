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
import { db } from '@/app/lib/db/postgres/dbConnection';
import { communities, files as filesTable } from '@/app/lib/db/postgres/schema';
import { storageClient } from '@/app/lib/fetch/storage';
import path from 'path';

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
  files: z.array(FileSchema).optional(),
});

const ResponseSchema = createResponseSchema(CommunitySchema);
export type CommunitiesResponse = z.infer<typeof ResponseSchema>;

// Type guard for ICommunitiesResponse
function isCommunitiesResponse(
  result: unknown
): result is { communities: unknown[]; total: number; totalPages: number } {
  return (
    result !== null &&
    typeof result === 'object' &&
    'total' in result &&
    'totalPages' in result &&
    'communities' in result &&
    Array.isArray((result as { communities: unknown[] }).communities)
  );
}

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

    if (!isCommunitiesResponse(result)) {
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    const parsedData = {
      name: formData.get('name') as string,
      nameEn: formData.get('nameEn') as string,
      desc: formData.get('desc') as string,
      descEn: formData.get('descEn') as string,
      type: Number(formData.get('type')),
      date: formData.get('date') as string,
      url: (formData.get('url') as string) || null,
    };

    if (!parsedData.name || !parsedData.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. communities 테이블에 데이터 삽입 (트랜잭션 없이)
    const [newCommunity] = await db
      .insert(communities)
      .values({
        ...parsedData,
        createdAt: new Date(parsedData.date),
      })
      .returning({ id: communities.id });

    if (!newCommunity || !newCommunity.id) {
      throw new Error('Failed to create community post.');
    }

    // 2. 파일 GCS에 업로드 및 files 테이블에 정보 저장
    if (files.length > 0 && storageClient.isInitialized()) {
      const bucket = storageClient.getBucket();
      const datePath = parsedData.date.split('-').join('/');

      const uploadPromises = files.map(async (file, index) => {
        const fileExtension = path.extname(file.name) || '.jpg';
        const gcsPath = `${datePath}/${index + 1}${fileExtension}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        return bucket.file(gcsPath).save(buffer, {
          contentType: file.type,
        });
      });

      await Promise.all(uploadPromises);

      const fileRecord = {
        communityId: newCommunity.id,
        url: `${datePath}/`,
        caption: String(files.length),
        createdAt: new Date(),
      };

      await db.insert(filesTable).values(fileRecord);
    }

    return NextResponse.json(
      {
        payload: { id: newCommunity.id },
        status: 'success',
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
