import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

class StorageClient {
  private storage: Storage | null = null;
  private bucket: string = '';
  private initialized: boolean = false;

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    if (this.initialized) return;

    try {
      const jsonPath = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || '');

      if (!fs.existsSync(jsonPath)) {
        console.warn('[STORAGE] Credentials file not found at:', jsonPath);
        return;
      }

      if (!process.env.GOOGLE_CLOUD_BUCKET) {
        console.warn('[STORAGE] GOOGLE_CLOUD_BUCKET environment variable is not set');
        return;
      }

      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const credentials = JSON.parse(jsonContent);

      this.storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        credentials,
      });

      this.bucket = process.env.GOOGLE_CLOUD_BUCKET;
      this.initialized = true;
      console.log('[STORAGE] Successfully initialized Google Cloud Storage client');
    } catch (error) {
      console.error('[STORAGE] Failed to initialize storage client:', error);
      this.storage = null;
      this.bucket = '';
    }
  }

  getBucket() {
    if (!this.initialized) {
      this.initializeStorage();
    }

    if (!this.storage || !this.bucket) {
      throw new Error('Storage client not properly initialized');
    }

    return this.storage.bucket(this.bucket);
  }

  async uploadFile(filePath: string, destination: string) {
    try {
      const bucket = this.getBucket();
      const [file] = await bucket.upload(filePath, {
        destination,
      });
      return file;
    } catch (error) {
      console.error('[STORAGE] Failed to upload file:', error);
      throw error;
    }
  }

  async downloadFile(fileName: string, destinationPath: string) {
    try {
      const bucket = this.getBucket();
      await bucket.file(fileName).download({
        destination: destinationPath,
      });
    } catch (error) {
      console.error('[STORAGE] Failed to download file:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string) {
    try {
      const bucket = this.getBucket();
      await bucket.file(fileName).delete();
    } catch (error) {
      console.error('[STORAGE] Failed to delete file:', error);
      throw error;
    }
  }

  async getSignedUrl(fileName: string, expiresIn = 3600) {
    try {
      const bucket = this.getBucket();
      const [url] = await bucket.file(fileName).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      return url;
    } catch (error) {
      console.error('[STORAGE] Failed to get signed URL:', error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
export const storageClient = new StorageClient();
