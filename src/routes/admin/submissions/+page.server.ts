import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
  listSubmissions, createSubmission, updateSubmission, deleteSubmission
} from '$db/submissions';
import { listVersions } from '$db/cv';

export const load: PageServerLoad = async () => {
  const [submissions, versions] = await Promise.all([
    listSubmissions(),
    listVersions()
  ]);
  return { submissions, versions };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const d = await request.formData();
    const company = d.get('company')?.toString() ?? '';
    const position = d.get('position')?.toString() ?? '';
    if (!company || !position) return fail(400, { error: 'Company and position are required' });

    await createSubmission({
      company,
      position,
      job_url: d.get('job_url')?.toString() || undefined,
      profile_used: d.get('profile_used')?.toString() ?? 'general',
      status: (d.get('status')?.toString() ?? 'applied') as any,
      date_applied: d.get('date_applied')?.toString() || undefined,
      notes: d.get('notes')?.toString() || undefined,
      cv_version_id: d.get('cv_version_id')?.toString() || undefined
    });
    return { success: true };
  },

  update: async ({ request }) => {
    const d = await request.formData();
    const id = d.get('id')?.toString() ?? '';
    await updateSubmission(id, {
      company: d.get('company')?.toString(),
      position: d.get('position')?.toString(),
      job_url: d.get('job_url')?.toString() || undefined,
      profile_used: d.get('profile_used')?.toString(),
      status: d.get('status')?.toString() as any,
      date_applied: d.get('date_applied')?.toString() || undefined,
      notes: d.get('notes')?.toString() || undefined,
      cv_version_id: d.get('cv_version_id')?.toString() || undefined
    });
    return { success: true };
  },

  delete: async ({ request }) => {
    const d = await request.formData();
    const id = d.get('id')?.toString() ?? '';
    await deleteSubmission(id);
    return { success: true };
  }
};
