/**
 * Seed script — reads resume.yaml and inserts it as the first current version.
 * Run once after applying 001_init.sql:
 *
 *   DATABASE_URL=... npx tsx migrations/seed.ts
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL env var is required');

const yamlPath = join(__dirname, '..', 'resume.yaml');
const yamlContent = readFileSync(yamlPath, 'utf8');
const parsedJson = yaml.load(yamlContent);

const sql = neon(DATABASE_URL);

const existing = await sql`SELECT COUNT(*) AS n FROM cv_versions`;
if (Number((existing[0] as any).n) > 0) {
  console.log('cv_versions table already has data — skipping seed.');
  process.exit(0);
}

const rows = await sql`
  SELECT * FROM set_current_cv_version(
    ${yamlContent},
    ${JSON.stringify(parsedJson)}::jsonb,
    ${'Initial version (seeded from resume.yaml)'}
  )
`;
console.log('Seeded version:', (rows[0] as any).id);
