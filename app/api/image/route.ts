import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { storageClient } from '@/lib/fetch/storage';
import { isAdminAuthenticated, FILE_UPLOAD_CONFIG } from '@/lib/security';

// Create a new cache instance (TTL: 3600 seconds, 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

// Helper function to get local fallback image
async function getLocalFallbackImage(): Promise<Buffer> {
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'fallback.png');
    return await fs.promises.readFile(fallbackPath);
  } catch (error) {
    console.error('[FALLBACK_IMAGE_ERROR]', error);
    throw new Error('Fallback image not found');
  }
}

interface ImageOptions {
  width?: number;
}

export async function GET(req: NextRequest) {
  try {
    const imageName = req.nextUrl.searchParams.get('imageName');

    if (!imageName) {
      return NextResponse.json({ error: 'Image name not provided' }, { status: 400 });
    }

    // Check if the image buffer is already cached
    const size = req.nextUrl.searchParams.get('size');
    const cacheKey = imageName + (size || '');
    const cachedBuffer = cache.get<Buffer>(cacheKey);
    if (cachedBuffer) {
      return new Response(new Uint8Array(cachedBuffer), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Check if storage client is initialized
    if (!storageClient.isInitialized()) {
      const fallbackBuffer = await getLocalFallbackImage();
      return new Response(new Uint8Array(fallbackBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Get the file from Google Cloud Storage
    const bucket = storageClient.getBucket();
    const file = bucket.file(imageName);

    const [exists] = await file.exists();
    if (!exists) {
      const fallbackBuffer = await getLocalFallbackImage();
      return new Response(new Uint8Array(fallbackBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Get metadata for content type
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'image/jpeg';

    // Set image options based on size parameter
    const imageOptions: ImageOptions = {};
    if (size === 'thumbnail') {
      imageOptions.width = 300;
    } else if (size === 'small') {
      imageOptions.width = 500;
    } else if (size === 'medium') {
      imageOptions.width = 800;
    } else if (size === 'large') {
      imageOptions.width = 1200;
    }
    // original size will not set any width, keeping the original dimensions

    // Download the file
    const [fileContent] = await file.download();

    // Create sharp instance for all image processing
    const image = sharp(fileContent, {
      failOnError: false,
      animated: true,
    });

    // 이미지 메타데이터 확인
    const imageMetadata = await image.metadata();

    // orientation에 따른 회전 각도 설정
    let rotationAngle = 0;
    switch (imageMetadata.orientation) {
      case 3: // 180도 회전
        rotationAngle = 180;
        break;
      case 6: // 시계 방향 90도 회전 (세로)
        rotationAngle = 90;
        break;
      case 8: // 반시계 방향 90도 회전 (세로)
        rotationAngle = 270;
        break;
    }

    // Process image
    let processedBuffer: Buffer;
    if (size === 'original') {
      // original은 원본 그대로 유지
      processedBuffer = fileContent;
    } else if (imageOptions.width && contentType.startsWith('image/')) {
      processedBuffer = await image
        .rotate(rotationAngle)
        .resize({
          width: imageOptions.width,
          withoutEnlargement: true,
          fit: 'inside',
        })
        .withMetadata()
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      processedBuffer = fileContent;
    }

    // Cache the processed image
    cache.set(cacheKey, processedBuffer);

    return new Response(new Uint8Array(processedBuffer), {
      headers: {
        'Content-Type':
          size !== 'original' && contentType.startsWith('image/') ? 'image/webp' : contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[GET_IMAGE_ERROR]', error);
    try {
      const fallbackBuffer = await getLocalFallbackImage();
      return new Response(new Uint8Array(fallbackBuffer), {
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

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 'error' },
        { status: 401 }
      );
    }

    if (!storageClient.isInitialized()) {
      return NextResponse.json({ error: 'Storage client not initialized' }, { status: 500 });
    }

    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'File name and content type are required' },
        { status: 400 }
      );
    }

    // Content type 검증
    if (!FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(contentType as (typeof FILE_UPLOAD_CONFIG.ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: `Invalid content type. Allowed: ${FILE_UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Sanitize file name and create a unique path
    const cleanFileName = path.basename(fileName);
    const originalExt = path.extname(cleanFileName).toLowerCase();
    // 안전한 확장자만 허용
    const extension = FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(
      originalExt as (typeof FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS)[number]
    )
      ? originalExt
      : '.jpg';
    const uniqueFileName = `${uuidv4()}${extension}`;
    const filePath = `news/${uniqueFileName}`;

    const bucket = storageClient.getBucket();
    const file = bucket.file(filePath);

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType,
    };

    const [signedUrl] = await file.getSignedUrl(options);

    return NextResponse.json({
      signedUrl,
      filePath, // The path to be stored in the database
    });
  } catch (error) {
    console.error('[GET_SIGNED_URL_ERROR]', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to get signed URL' },
      { status: 500 }
    );
  }
}
