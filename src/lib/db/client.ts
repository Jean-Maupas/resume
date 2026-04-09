import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

// Singleton HTTP transport client — safe for serverless
let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) _sql = neon(DATABASE_URL);
  return _sql;
}

// Typed helper — wraps neon tag for cleaner call sites
export type Sql = ReturnType<typeof neon>;
