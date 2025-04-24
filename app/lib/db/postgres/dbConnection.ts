import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

//neonConfig.fetchConnectionCache = true;

if (!process.env.POSTGRES_URL) {
  throw new Error('Database URL is not defined');
}

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle(sql);

export async function getDb() {
  try {
    await sql`SELECT 1`;
    return db;
  } catch (error) {
    console.error('Neon Database connection failed:', error);
    return null;
  }
}
