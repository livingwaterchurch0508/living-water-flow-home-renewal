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
      }
      // Try to read from Vercel paths
      else if (process.env.VERCEL) {
        let credentials: Credentials | null = null;
        const paths = ['/var/task/livingwater.json', '/vercel/path0/livingwater.json'];

        for (const credPath of paths) {
          try {
            if (fs.existsSync(credPath)) {
              const jsonContent = fs.readFileSync(credPath, 'utf8');
              credentials = JSON.parse(jsonContent);
              break;
            }
          } catch {
            // 파일 읽기 실패 시 다음 경로 시도
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
        }
      }
      // Fallback to application default credentials (for local development)
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.storage = new Storage();
        this.bucket = this.storage.bucket(
          process.env.STORAGE_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET || ''
        );
        this.initialized = true;
      }
      // 환경 변수가 없으면 초기화하지 않음 (로컬 개발 환경 등)
    } catch (error: unknown) {
      // 초기화 실패 - 민감 정보 없이 에러만 로깅
      console.error(
        '[STORAGE_ERROR] Failed to initialize storage client:',
        error instanceof Error ? error.message : 'Unknown error'
      );
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
