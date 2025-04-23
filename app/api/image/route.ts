import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import sharp from 'sharp';
import { storageClient } from '@/app/lib/fetch/storage';
import path from 'path';
import fs from 'fs';

// Edge Cache 비활성화
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// 캐시 설정 수정
const cache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 120,
  useClones: false,
  maxKeys: 100
});

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
async function getLocalFallbackImage(): Promise<Buffer> {
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'images', 'fallback.jpg');
    return await fs.promises.readFile(fallbackPath);
  } catch (error) {
    console.error('[FALLBACK_IMAGE_ERROR]', error);
    throw new Error('Fallback image not found');
  }
}

export async function GET(req: NextRequest) {
  try {
    const imageName = req.nextUrl.searchParams.get('imageName');
    console.log('[GET_IMAGE] Request headers:', Object.fromEntries(req.headers));
    console.log('[GET_IMAGE] Requested image:', imageName);
    console.log('[ENV_CHECK]', {
      hasProject: !!process.env.GOOGLE_CLOUD_PROJECT,
      hasCredentials: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
      hasBucket: !!process.env.STORAGE_BUCKET_NAME
    });

    if (!imageName) {
      console.warn('[GET_IMAGE] No image name provided');
      return NextResponse.json({ error: 'Image name not provided' }, { status: 400 });
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
      console.error('[STORAGE_ERROR] Storage client not initialized:', {
        hasProject: !!process.env.GOOGLE_CLOUD_PROJECT,
        hasBucket: !!process.env.STORAGE_BUCKET_NAME,
        hasCredentials: !!process.env.GOOGLE_CLOUD_CREDENTIALS
      });
      return NextResponse.json(
        { error: 'Storage client not initialized' },
        { status: 500 }
      );
    }

    console.log('[GET_IMAGE] Fetching from storage:', imageName);
    const bucket = storageClient.getBucket();
    const file = bucket.file(imageName);

    const [exists] = await file.exists();
    console.log('[GET_IMAGE] File exists:', exists);
    
    if (!exists) {
      console.warn('[GET_IMAGE] Image not found:', imageName);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
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
        'ETag': `"${imageName}"`,
      },
    });
  } catch (error: any) {
    console.error('[GET_IMAGE_ERROR] Full error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      storageInitialized: storageClient.isInitialized()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
