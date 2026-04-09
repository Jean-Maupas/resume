import { getDb } from './client';
import type { ResumeSchema } from '$cv/schema';

export interface CvVersion {
  id: string;
  yaml_content: string;
  parsed_json: ResumeSchema;
  label: string | null;
  is_current: boolean;
  created_at: string;
}

export type CvVersionMeta = Omit<CvVersion, 'yaml_content' | 'parsed_json'>;

// ── Reads ───────────────────────────────────────────────────────────────────

export async function getCurrentVersion(): Promise<CvVersion | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, yaml_content, parsed_json, label, is_current, created_at
    FROM   cv_versions
    WHERE  is_current = TRUE
    LIMIT  1
  `;
  return (rows[0] as CvVersion) ?? null;
}

export async function getVersionById(id: string): Promise<CvVersion | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, yaml_content, parsed_json, label, is_current, created_at
    FROM   cv_versions
    WHERE  id = ${id}
    LIMIT  1
  `;
  return (rows[0] as CvVersion) ?? null;
}

export async function listVersions(): Promise<CvVersionMeta[]> {
  const sql = getDb();
  return (await sql`
    SELECT id, label, is_current, created_at
    FROM   cv_versions
    ORDER  BY created_at DESC
  `) as CvVersionMeta[];
}

// ── Writes (use DB function for atomic set-current) ──────────────────────

export async function saveNewVersion(
  yamlContent: string,
  parsedJson: ResumeSchema,
  label?: string
): Promise<CvVersion> {
  const sql = getDb();
  // set_current_cv_version() is defined in migrations/001_init.sql
  // It runs UPDATE + INSERT atomically inside a PL/pgSQL block.
  const rows = await sql`
    SELECT * FROM set_current_cv_version(
      ${yamlContent},
      ${JSON.stringify(parsedJson)}::jsonb,
      ${label ?? null}
    )
  `;
  return rows[0] as CvVersion;
}

export async function restoreVersion(id: string): Promise<void> {
  const sql = getDb();
  await sql`SELECT restore_cv_version(${id})`;
}

export async function deleteVersion(id: string): Promise<{ deleted: boolean }> {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM cv_versions
    WHERE  id = ${id} AND is_current = FALSE
    RETURNING id
  `;
  return { deleted: rows.length > 0 };
}

export async function labelVersion(id: string, label: string): Promise<void> {
  const sql = getDb();
  await sql`UPDATE cv_versions SET label = ${label} WHERE id = ${id}`;
}
