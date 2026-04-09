import { getDb } from './client';

export type SubmissionStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'
];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  applied:    'Applied',
  screening:  'Screening',
  interview:  'Interview',
  offer:      'Offer',
  rejected:   'Rejected',
  withdrawn:  'Withdrawn'
};

export const STATUS_COLOR: Record<SubmissionStatus, string> = {
  applied:    'blue',
  screening:  'amber',
  interview:  'purple',
  offer:      'green',
  rejected:   'red',
  withdrawn:  'gray'
};

export interface Submission {
  id: string;
  cv_version_id: string | null;
  company: string;
  position: string;
  job_url: string | null;
  profile_used: string;
  status: SubmissionStatus;
  date_applied: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined from cv_versions
  cv_label?: string | null;
  cv_created_at?: string | null;
}

export async function listSubmissions(): Promise<Submission[]> {
  const sql = getDb();
  return (await sql`
    SELECT  s.*,
            v.label      AS cv_label,
            v.created_at AS cv_created_at
    FROM    submissions s
    LEFT JOIN cv_versions v ON v.id = s.cv_version_id
    ORDER   BY s.date_applied DESC NULLS LAST, s.created_at DESC
  `) as Submission[];
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT  s.*,
            v.label      AS cv_label,
            v.created_at AS cv_created_at
    FROM    submissions s
    LEFT JOIN cv_versions v ON v.id = s.cv_version_id
    WHERE   s.id = ${id}
    LIMIT   1
  `;
  return (rows[0] as Submission) ?? null;
}

export async function createSubmission(data: {
  company: string;
  position: string;
  job_url?: string;
  profile_used: string;
  status?: SubmissionStatus;
  date_applied?: string;
  notes?: string;
  cv_version_id?: string;
}): Promise<Submission> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO submissions
      (company, position, job_url, profile_used, status, date_applied, notes, cv_version_id)
    VALUES
      (${data.company}, ${data.position}, ${data.job_url ?? null},
       ${data.profile_used}, ${data.status ?? 'applied'},
       ${data.date_applied ?? null}, ${data.notes ?? null},
       ${data.cv_version_id ?? null})
    RETURNING *
  `;
  return rows[0] as Submission;
}

export async function updateSubmission(
  id: string,
  data: Partial<Pick<Submission, 'company' | 'position' | 'job_url' | 'profile_used' | 'status' | 'date_applied' | 'notes' | 'cv_version_id'>>
): Promise<Submission | null> {
  const sql = getDb();
  // Build dynamic update — only update provided fields
  const allowed = ['company', 'position', 'job_url', 'profile_used', 'status', 'date_applied', 'notes', 'cv_version_id'] as const;
  const fields = (Object.keys(data) as string[]).filter(k => allowed.includes(k as typeof allowed[number]));
  if (fields.length === 0) return getSubmission(id);

  // Neon HTTP doesn't support fully dynamic parameterized queries, so we
  // handle common update patterns explicitly:
  const rows = await sql`
    UPDATE submissions SET
      company        = COALESCE(${data.company        ?? null}, company),
      position       = COALESCE(${data.position       ?? null}, position),
      job_url        = COALESCE(${data.job_url        ?? null}, job_url),
      profile_used   = COALESCE(${data.profile_used   ?? null}, profile_used),
      status         = COALESCE(${data.status         ?? null}, status),
      date_applied   = COALESCE(${data.date_applied   ?? null}, date_applied),
      notes          = COALESCE(${data.notes          ?? null}, notes),
      cv_version_id  = COALESCE(${data.cv_version_id  ?? null}, cv_version_id),
      updated_at     = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as Submission) ?? null;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`DELETE FROM submissions WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
