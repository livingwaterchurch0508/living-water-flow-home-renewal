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
    
    // Determine the correct file path based on the environment
    const filePath = process.env.VERCEL
      ? '/var/task/livingwater.json'  // Vercel runtime path
      : join(__dirname, "livingwater.json"); // Local development path
    
    await writeFile(filePath, jsonString);
    console.log(`Google credentials written to ${filePath}`);
    
    // If in Vercel environment, also write to /vercel/path0/
    if (process.env.VERCEL) {
      const vercelPath = '/vercel/path0/livingwater.json';
      await writeFile(vercelPath, jsonString);
      console.log(`Google credentials also written to ${vercelPath}`);
    }
  } catch (error) {
    console.error("Failed to write credentials:", error);
    console.error("Current environment:", {
      isVercel: !!process.env.VERCEL,
      cwd: process.cwd(),
      dirname: __dirname
    });
    process.exit(1);
  }
}

generateCredentials();
