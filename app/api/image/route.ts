import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { bucket } from '@/app/lib/fetch/storage';
import { Bucket } from '@google-cloud/storage';

// Bucket이 null이 아님을 보장 (storage.ts에서 null일 경우 에러를 던지므로)
const storageBucket = bucket as Bucket;

// Create a new cache instance (TTL: 3600 seconds, 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).rotate().webp({ quality: 80 }).toBuffer();
  } catch (error) {
    console.error('[COMPRESS_IMAGE_ERROR]', error);
    return buffer; // Return original buffer if compression fails
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
    console.log('[GET_IMAGE] Requested image:', imageName);

    if (!imageName) {
      console.warn('[GET_IMAGE] No image name provided');
      return NextResponse.json({ error: 'Image name not provided' }, { status: 400 });
    }

    // Check if the image buffer is already cached
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

    // Get the file from Google Cloud Storage
    console.log('[GET_IMAGE] Fetching from storage:', imageName);
    const file = storageBucket.file(imageName);

    const [exists] = await file.exists();
    if (!exists) {
      console.warn('[GET_IMAGE] Image not found:', imageName);
      const fallbackBuffer = await getLocalFallbackImage();
      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Download and process the image
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

    // Cache the processed image buffer
    cache.set(imageName, processedBuffer);
    console.log('[GET_IMAGE] Image processed and cached:', imageName);

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': contentType.startsWith('image/') ? 'image/webp' : contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[GET_IMAGE_ERROR]', error);
    try {
      const fallbackBuffer = await getLocalFallbackImage();
      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('[GET_IMAGE_ERROR]', error);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
  }
}
