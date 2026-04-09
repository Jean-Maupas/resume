import type { PageServerLoad } from './$types';
import { listVersions } from '$db/cv';
import { listSubmissions } from '$db/submissions';

export const load: PageServerLoad = async () => {
  const [versions, submissions] = await Promise.all([
    listVersions(),
    listSubmissions()
  ]);

  const statusCounts = submissions.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return { versions, submissions: submissions.slice(0, 5), statusCounts };
};
