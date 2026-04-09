import yaml from 'js-yaml';
import type { ResumeSchema } from './schema';

export function parseYaml(content: string): ResumeSchema {
  let doc: unknown;
  try {
    doc = yaml.load(content);
  } catch (e) {
    throw new Error(`YAML parse error: ${(e as Error).message}`);
  }
  validateSchema(doc);
  return doc;
}

function validateSchema(doc: unknown): asserts doc is ResumeSchema {
  if (!doc || typeof doc !== 'object') throw new Error('YAML root must be an object');
  const d = doc as Record<string, unknown>;
  if (!d.meta) throw new Error('Missing field: meta');
  if (!d.basics) throw new Error('Missing field: basics');
  if (!Array.isArray(d.work)) throw new Error('Missing field: work (must be array)');
  if (!Array.isArray((d.meta as Record<string, unknown>).profiles)) {
    throw new Error('Missing field: meta.profiles (must be array)');
  }
  const basics = d.basics as Record<string, unknown>;
  if (!basics.name) throw new Error('Missing field: basics.name');
  if (!basics.email) throw new Error('Missing field: basics.email');
}

export function dumpYaml(doc: ResumeSchema): string {
  return yaml.dump(doc, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
}
