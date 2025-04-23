import { Storage, Bucket } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

let storage: Storage;
let bucket: Bucket | null = null;

try {
  // Vercel environment: use environment variables directly
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentials,
    });
    bucket = storage.bucket(process.env.STORAGE_BUCKET_NAME!);
  } 
  // Local environment: read from file
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const jsonPath = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const credentials = JSON.parse(jsonContent);
    
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentials,
    });
    bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET || process.env.STORAGE_BUCKET_NAME!);
  } else {
    throw new Error('No credentials provided');
  }
} catch (error) {
  console.error('[STORAGE_ERROR] Failed to initialize storage client:', {
    hasProject: !!process.env.GOOGLE_CLOUD_PROJECT,
    hasBucket: !!(process.env.GOOGLE_CLOUD_BUCKET || process.env.STORAGE_BUCKET_NAME),
    hasCredentials: !!(process.env.GOOGLE_CLOUD_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS),
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'not-set',
    bucketName: process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || 'not-set',
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}

if (!bucket) {
  throw new Error('Failed to initialize storage bucket');
}

export { bucket };
