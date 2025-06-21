import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommunityById } from '@/app/lib/db/postgres/communities';
import { BaseItemSchema, handleApiError, ApiResponse } from '@/app/lib/api-utils';
import { db } from '@/app/lib/db/postgres/dbConnection';
import { communities, files as filesTable } from '@/app/lib/db/postgres/schema';
import { storageClient } from '@/app/lib/fetch/storage';
import { eq } from 'drizzle-orm';
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const communityId = parseInt(id, 10);
    const formData = await req.formData();
    const newFiles = formData.getAll('files').filter((f): f is File => f instanceof File);
    const deletedFilesStr = formData.get('deletedFiles') as string | null;
    const deletedFiles: string[] = deletedFilesStr ? JSON.parse(deletedFilesStr) : [];

    // 1. Update text data in 'communities' table
    const textData = {
      name: formData.get('name') as string,
      nameEn: formData.get('nameEn') as string,
      desc: formData.get('desc') as string,
      descEn: formData.get('descEn') as string,
      type: Number(formData.get('type')),
    };
    await db.update(communities).set(textData).where(eq(communities.id, communityId));

    // 2. Handle file operations
    if (storageClient.isInitialized()) {
      const bucket = storageClient.getBucket();
      const fileInfo = await db.query.files.findFirst({
        where: eq(filesTable.communityId, communityId),
      });
      const directoryPath = fileInfo?.url;

      if (directoryPath) {
        // 2a. Delete marked files from GCS
        const deletePromises = deletedFiles.map(fileName => {
          return bucket.file(`${directoryPath}${fileName}`).delete().catch(console.error);
        });
        await Promise.all(deletePromises);

        // 2b. Upload new files
        const [existingGCSFiles] = await bucket.getFiles({ prefix: directoryPath });
        let maxIndex = 0;
        existingGCSFiles.forEach(file => {
          const name = path.basename(file.name);
          const index = parseInt(name.split('.')[0], 10);
          if (!isNaN(index) && index > maxIndex) maxIndex = index;
        });

        const uploadPromises = newFiles.map(async (file, i) => {
          const ext = path.extname(file.name) || '.jpg';
          const newPath = `${directoryPath}${maxIndex + 1 + i}${ext}`;
          const buffer = Buffer.from(await file.arrayBuffer());
          return bucket.file(newPath).save(buffer, { contentType: file.type });
        });
        await Promise.all(uploadPromises);

        // 2c. Consolidate and rename files to be sequential
        const [finalGCSFiles] = await bucket.getFiles({ prefix: directoryPath });
        const renamePromises = finalGCSFiles.map(async (file, index) => {
          const ext = path.extname(file.name);
          const newName = `${directoryPath}${index + 1}${ext}`;
          if (file.name !== newName) {
            await file.move(newName);
          }
        });
        await Promise.all(renamePromises);

        // 2d. Update file count in 'files' table
        await db.update(filesTable).set({ caption: String(finalGCSFiles.length) }).where(eq(filesTable.id, fileInfo.id));
      }
    }

    return NextResponse.json({ message: 'Community updated successfully' }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const communityId = parseInt(id, 10);

    // 1. Fetch and delete files from GCS
    if (storageClient.isInitialized()) {
      const fileInfo = await db.query.files.findFirst({
        where: eq(filesTable.communityId, communityId),
      });
      if (fileInfo?.url) {
        await storageClient.getBucket().deleteFiles({ prefix: fileInfo.url });
      }
    }

    // 2. Delete from 'files' and 'communities' tables
    await db.delete(filesTable).where(eq(filesTable.communityId, communityId));
    await db.delete(communities).where(eq(communities.id, communityId));

    return NextResponse.json({ message: 'Community deleted successfully' }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
