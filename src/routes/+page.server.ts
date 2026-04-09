import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getCurrentVersion } from '$db/cv';
import { filterByProfile, isValidProfileId } from '$cv/filter';
import type { ProfileId } from '$cv/schema';

export const load: PageServerLoad = async ({ url }) => {
  const version = await getCurrentVersion();
  if (!version) throw error(503, 'CV not yet published');

  const resume = version.parsed_json;
  const rawProfile = url.searchParams.get('profile');
  const profileId: ProfileId | null =
    rawProfile && isValidProfileId(rawProfile, resume) ? rawProfile : null;

  return {
    resume: filterByProfile(resume, profileId),
    allProfiles: resume.meta.profiles,
    activeProfile: profileId,
    versionId: version.id,
    lastUpdated: version.created_at
  };
};
