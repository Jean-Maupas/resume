import type { RequestHandler } from '@sveltejs/kit';
import { getVersionById, getCurrentVersion } from '$db/cv';

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('version');
  const version = id ? await getVersionById(id) : await getCurrentVersion();

  if (!version) return new Response('Not found', { status: 404 });

  const filename = `resume_${version.id.slice(0, 8)}.yaml`;
  return new Response(version.yaml_content, {
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
};
