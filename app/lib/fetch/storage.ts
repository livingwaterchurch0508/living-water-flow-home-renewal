import { Storage, Bucket, StorageOptions } from '@google-cloud/storage';
import fs from 'fs';

interface Credentials {
  project_id: string;
  private_key: string;
  client_email: string;
  [key: string]: unknown;
}

class StorageClient {
  private storage: Storage | null = null;
  private bucket: Bucket | null = null;
  private initialized = false;

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    try {
      // Try to initialize with base64 encoded credentials first
      if (process.env.GOOGLE_CREDENTIALS_JSON_BASE64) {
        const credentialsJson = Buffer.from(
          process.env.GOOGLE_CREDENTIALS_JSON_BASE64,
          'base64'
        ).toString('utf-8');
        const credentials: Credentials = JSON.parse(credentialsJson);
        
        const options: StorageOptions = {
          projectId: process.env.GOOGLE_CLOUD_PROJECT || credentials.project_id,
          credentials,
        };

        this.storage = new Storage(options);
        this.bucket = this.storage.bucket(
          process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || ''
        );
        this.initialized = true;
        console.log('[STORAGE] Initialized with base64 credentials');
      }
      // Try to read from Vercel paths
      else if (process.env.VERCEL) {
        let credentials: Credentials | null = null;
        const paths = ['/var/task/livingwater.json', '/vercel/path0/livingwater.json'];
        
        for (const path of paths) {
          try {
            if (fs.existsSync(path)) {
              const jsonContent = fs.readFileSync(path, 'utf8');
              credentials = JSON.parse(jsonContent);
              console.log('[STORAGE] Found credentials at:', path);
              break;
            }
          } catch (error: unknown) {
            console.warn('[STORAGE] Failed to read from:', path, error instanceof Error ? error.message : 'Unknown error');
          }
        }

        if (credentials) {
          const options: StorageOptions = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT || credentials.project_id,
            credentials,
          };

          this.storage = new Storage(options);
          this.bucket = this.storage.bucket(
            process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || ''
          );
          this.initialized = true;
          console.log('[STORAGE] Initialized with file credentials in Vercel');
        }
      }
      // Fallback to application default credentials (for local development)
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.storage = new Storage();
        this.bucket = this.storage.bucket(
          process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || ''
        );
        this.initialized = true;
        console.log('[STORAGE] Initialized with application default credentials');
      } else {
        console.warn('[STORAGE] No credentials provided');
      }
    } catch (error: unknown) {
      console.error('[STORAGE_ERROR] Failed to initialize storage client:', {
        hasProject: !!process.env.GOOGLE_CLOUD_PROJECT,
        hasBucket: !!(process.env.GOOGLE_CLOUD_BUCKET || process.env.STORAGE_BUCKET_NAME),
        hasCredentials: !!(
          process.env.GOOGLE_CREDENTIALS_JSON_BASE64 || process.env.GOOGLE_APPLICATION_CREDENTIALS
        ),
        isVercel: !!process.env.VERCEL,
        projectId: process.env.GOOGLE_CLOUD_PROJECT || 'not-set',
        bucketName: process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || 'not-set',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getBucket(): Bucket {
    if (!this.bucket || !this.initialized) {
      throw new Error('Storage client not initialized');
    }
    return this.bucket;
  }
}

export const storageClient = new StorageClient();
