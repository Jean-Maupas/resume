export type ProfileId =
  | 'clinical_research'
  | 'data_science'
  | 'software_engineering'
  | 'information_systems';

export interface ProfileMeta {
  id: ProfileId;
  label: string;
}

export interface Summary {
  tags: ProfileId[];
  text: string;
}

export interface SocialProfile {
  network: string;
  username: string;
  url: string;
  note?: string;
}

export interface Location {
  city: string;
  region: string;
  countryCode: string;
}

export interface Basics {
  name: string;
  suffix?: string;
  email: string;
  phone: string;
  url?: string;
  location: Location;
  profiles: SocialProfile[];
  summaries: Summary[];
}

export interface TaggedText {
  text: string;
  tags: ProfileId[];
}

export interface CompetencyArea {
  area: string;
  tags: ProfileId[];
  highlights: TaggedText[];
}

export interface WorkEntry {
  name: string;
  url?: string | null;
  position: string;
  startDate: string;
  endDate: string;
  highlights: TaggedText[];
}

export interface Education {
  institution: string;
  url?: string;
  area: string;
  studyType: string;
  location?: string;
  note?: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  url?: string;
  date?: string;
  tags: ProfileId[];
}

export interface Publication {
  name: string;
  url?: string;
  note?: string;
  tags: ProfileId[];
}

export interface Skill {
  name: string;
  tags: ProfileId[];
  keywords: string[];
}

export interface Language {
  language: string;
  fluency: string;
}

export interface ResumeSchema {
  meta: {
    schemaVersion: string;
    lastUpdated: string;
    profiles: ProfileMeta[];
  };
  basics: Basics;
  competencies: CompetencyArea[];
  work: WorkEntry[];
  education: Education[];
  certificates: Certificate[];
  publications: Publication[];
  skills: Skill[];
  languages: Language[];
  citizenships: string[];
}
