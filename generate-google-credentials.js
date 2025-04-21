import 'dotenv/config';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateCredentials() {
  const base64 = process.env.GOOGLE_CREDENTIALS_JSON_BASE64;
  
  if (!base64) {
    console.error(
      "GOOGLE_CREDENTIALS_JSON_BASE64 environment variable is not set"
    );
    process.exit(1);
  }

  try {
    const jsonString = Buffer.from(base64, "base64").toString("utf-8");
    const filePath = join(__dirname, "livingwater.json");
    
    await writeFile(filePath, jsonString);
    console.log(`Google credentials written to ${filePath}`);
  } catch (error) {
    console.error("Failed to write credentials:", error);
    process.exit(1);
  }
}

generateCredentials();
