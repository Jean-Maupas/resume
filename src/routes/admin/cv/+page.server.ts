import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getCurrentVersion, listVersions, saveNewVersion, restoreVersion, deleteVersion, labelVersion } from '$db/cv';
import { parseYaml } from '$cv/parse';

export const load: PageServerLoad = async () => {
  const [current, versions] = await Promise.all([getCurrentVersion(), listVersions()]);
  return {
    currentYaml: current?.yaml_content ?? '',
    currentId: current?.id ?? null,
    versions
  };
};

export const actions: Actions = {
  // Save edited YAML from the Monaco editor
  save: async ({ request }) => {
    const data = await request.formData();
    const yaml = data.get('yaml')?.toString() ?? '';
    const label = data.get('label')?.toString() || null;

    try {
      const parsed = parseYaml(yaml);
      const version = await saveNewVersion(yaml, parsed, label ?? undefined);
      return { success: true, versionId: version.id };
    } catch (e) {
      return fail(400, { error: (e as Error).message });
    }
  },

  // Upload a .yaml file
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File | null;
    if (!file || file.size === 0) return fail(400, { error: 'No file provided' });

    const yaml = await file.text();
    const label = data.get('label')?.toString() || `Upload: ${file.name}`;

    try {
      const parsed = parseYaml(yaml);
      const version = await saveNewVersion(yaml, parsed, label);
      return { success: true, versionId: version.id };
    } catch (e) {
      return fail(400, { error: (e as Error).message });
    }
  },

  // Restore a previous version as current
  restore: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() ?? '';
    try {
      await restoreVersion(id);
      return { success: true };
    } catch (e) {
      return fail(400, { error: (e as Error).message });
    }
  },

  // Delete a non-current version
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() ?? '';
    const result = await deleteVersion(id);
    if (!result.deleted) return fail(400, { error: 'Cannot delete the current version' });
    return { success: true };
  },

  // Label a version
  label: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() ?? '';
    const label = data.get('label')?.toString() ?? '';
    await labelVersion(id, label);
    return { success: true };
  }
};
