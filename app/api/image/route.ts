import { NextRequest, NextResponse } from 'next/server';
// import NodeCache from 'node-cache';
import sharp from 'sharp';
import { storageClient } from '@/app/lib/fetch/storage';
// import path from 'path';
// import fs from 'fs';

// Edge Cache 비활성화
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// 캐시 설정 수정
// const cache = new NodeCache({
//   stdTTL: 3600,
//   checkperiod: 120,
//   useClones: false,
//   maxKeys: 100
// });

async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).rotate().webp({ quality: 80 }).toBuffer();
  } catch (error) {
    console.error('[COMPRESS_IMAGE_ERROR]', error);
    return buffer;
  }
}

// Helper function to convert stream to buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (error) => {
      console.error('[STREAM_TO_BUFFER_ERROR]', error);
      reject(error);
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Helper function to get local fallback image
// async function getLocalFallbackImage(): Promise<Buffer> {
//   try {
//     const fallbackPath = path.join(process.cwd(), 'public', 'images', 'fallback.jpg');
//     return await fs.promises.readFile(fallbackPath);
//   } catch (error) {
//     console.error('[FALLBACK_IMAGE_ERROR]', error);
//     throw new Error('Fallback image not found');
//   }
// }

export async function GET(req: NextRequest) {
  try {
    // Log full URL and all parameters
    console.log('[GET_IMAGE] Full URL:', req.nextUrl.toString());
    console.log('[GET_IMAGE] Search params:', Object.fromEntries(req.nextUrl.searchParams));
    console.log('[GET_IMAGE] Request headers:', Object.fromEntries(req.headers));

    const imageName = req.nextUrl.searchParams.get('imageName');
    
    if (!imageName) {
      console.warn('[GET_IMAGE] Missing image name in URL:', req.nextUrl.toString());
      return NextResponse.json(
        { 
          error: 'Image name not provided',
          url: req.nextUrl.toString(),
          params: Object.fromEntries(req.nextUrl.searchParams)
        }, 
        { status: 400 }
      );
    }

    // 캐시 체크 비활성화 (테스트용)
    /*
    const cachedBuffer = cache.get<Buffer>(imageName);
    if (cachedBuffer) {
      console.log('[GET_IMAGE] Serving cached image:', imageName);
      return new NextResponse(cachedBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    */

    if (!storageClient.isInitialized()) {
      const envStatus = {
        hasProject: !!process.env.GOOGLE_CLOUD_PROJECT,
        hasBucket: !!process.env.STORAGE_BUCKET_NAME,
        hasCredentials: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
        projectId: process.env.GOOGLE_CLOUD_PROJECT || 'not-set',
        bucketName: process.env.STORAGE_BUCKET_NAME || 'not-set'
      };
      
      console.error('[STORAGE_ERROR] Storage client not initialized:', envStatus);
      return NextResponse.json({ 
        error: 'Storage client not initialized',
        envStatus
      }, { status: 500 });
    }

    console.log('[GET_IMAGE] Fetching from storage:', imageName);
    const bucket = storageClient.getBucket();
    const file = bucket.file(imageName);

    const [exists] = await file.exists();
    console.log('[GET_IMAGE] File exists:', exists);

    if (!exists) {
      console.warn('[GET_IMAGE] Image not found:', imageName);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    console.log('[GET_IMAGE] Processing image:', imageName);
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'image/jpeg';

    const fileStream = file.createReadStream();
    const buffer = await streamToBuffer(fileStream);

    let processedBuffer: Buffer;
    if (contentType.startsWith('image/')) {
      processedBuffer = await compressImage(buffer);
    } else {
      processedBuffer = buffer;
    }

    // 캐시 저장 비활성화 (테스트용)
    // cache.set(imageName, processedBuffer);
    console.log('[GET_IMAGE] Image processed successfully:', imageName);

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': contentType.startsWith('image/') ? 'image/webp' : contentType,
        'Cache-Control': 'no-cache',
        ETag: `"${imageName}"`,
      },
    });
  } catch (error: unknown) {
    console.error('[GET_IMAGE_ERROR] Full error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
      code: error instanceof Error ? error.cause : undefined,
      storageInitialized: storageClient.isInitialized(),
    });

    return NextResponse.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
