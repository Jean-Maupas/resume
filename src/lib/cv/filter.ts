import type { ResumeSchema, ProfileId } from './schema';

export function filterByProfile(resume: ResumeSchema, profileId: ProfileId | null): ResumeSchema {
  if (!profileId) return resume;

  const has = (tags: ProfileId[]) => tags.includes(profileId);

  return {
    ...resume,
    basics: {
      ...resume.basics,
      summaries: resume.basics.summaries.filter(s => has(s.tags))
    },
    competencies: resume.competencies
      .filter(c => has(c.tags))
      .map(c => ({ ...c, highlights: c.highlights.filter(h => has(h.tags)) }))
      .filter(c => c.highlights.length > 0),
    work: resume.work
      .map(w => ({ ...w, highlights: w.highlights.filter(h => has(h.tags)) }))
      .filter(w => w.highlights.length > 0),
    skills: resume.skills.filter(s => has(s.tags)),
    certificates: resume.certificates.filter(c => has(c.tags)),
    publications: resume.publications.filter(p => has(p.tags))
  };
}

export function getProfileLabel(resume: ResumeSchema, profileId: ProfileId | null): string {
  if (!profileId) return 'Full CV';
  return resume.meta.profiles.find(p => p.id === profileId)?.label ?? profileId;
}

export function isValidProfileId(id: string, resume: ResumeSchema): id is ProfileId {
  return resume.meta.profiles.some(p => p.id === id);
}
