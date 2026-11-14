import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  if (!p) {
    throw new Error('DATABASE_URL is not set.');
  }

  const client = await p.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}
