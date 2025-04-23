import { Storage } from '@google-cloud/storage';

import path from 'path';
import fs from 'fs';

const jsonPath = path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || '');
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const credentials = JSON.parse(jsonContent);

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET!);

export { bucket };
