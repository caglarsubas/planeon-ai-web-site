import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// Operator-approved deployment contract, not a browser-selectable model catalogue.
export const APPROVED_MODEL = 'ministral-3:8b';
export const PLANEON_TENANT = 'planeon-ai-web-site';
const profileSchema = z.strictObject({
  version: z.literal(1),
  url: z.url().refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === '/v1'
    );
  }),
  key: z.string().regex(/^sk-pln-[A-Za-z0-9_-]{20,200}$/),
  model: z.literal(APPROVED_MODEL),
  tenant: z.literal(PLANEON_TENANT),
  organization: z.literal('org-planeon-website'),
  keyId: z.literal('planeon-primary'),
});
export type InferenceProfile = z.infer<typeof profileSchema>;
const filename = 'inference.private.json';

function connectionFields(document: string) {
  const lines = document.split(/\r?\n/);
  const credentialHeader = lines.findIndex((line) => {
    if (!line.trimStart().startsWith('|')) return false;
    const cells = line.split('|').slice(1, -1);
    return (
      cells[0]?.trim().toLowerCase() === 'field' &&
      cells[1]?.trim().toLowerCase() === 'value'
    );
  });
  const connectionLines = lines.slice(
    credentialHeader < 0 ? 0 : credentialHeader + 1,
  );
  const fields = new Map<string, string[]>();
  for (const line of connectionLines) {
    if (!line.trimStart().startsWith('|')) {
      if (credentialHeader >= 0 && fields.size > 0) break;
      continue;
    }
    const cells = line.split('|').slice(1, -1);
    if (cells.length < 2) continue;
    const name = cells[0]
      .trim()
      .replace(/[*_`]/g, '')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();
    if (!name || /^-+$/.test(name)) continue;
    const value = cells[1].trim().replace(/^`|`$/g, '');
    if (!value) continue;
    fields.set(name, [...(fields.get(name) || []), value]);
  }
  const one = (...names: string[]) => {
    const values = names.flatMap((name) => fields.get(name) || []);
    // Refuse ambiguous documents rather than selecting whichever credential row came first.
    if (values.length === 0) return undefined;
    return values.length === 1 ? values[0] : '';
  };
  const documentModel = one('approvedmodel', 'model');
  return {
    url: one('inferenceapibaseurl', 'baseurl'),
    key: one('apikey'),
    // Routing is an application contract. A connection-only document may omit it;
    // a supplied value must still match the one approved model exactly.
    model: documentModel === undefined ? APPROVED_MODEL : documentModel,
    tenant: one('tenant'),
    organization: one('organisation', 'organization', 'org'),
    keyId: one('keyid'),
  };
}

function assertPrivate(file: string) {
  const stat = fs.lstatSync(file);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.mode & 0o077 ||
    (process.getuid && stat.uid !== process.getuid())
  )
    throw new Error(
      'Inference configuration must be an owner-only regular file.',
    );
}
export function readInferenceProfile(
  directory: string,
): InferenceProfile | undefined {
  const file = path.join(directory, filename);
  if (!fs.existsSync(file)) return undefined;
  assertPrivate(file);
  try {
    return profileSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    // Zod/JSON parse diagnostics can contain the offending secret. Never propagate them.
    throw new Error(
      'Private inference configuration is invalid. Re-import the approved connection document.',
    );
  }
}
export function importInferenceProfile(document: string, directory: string) {
  const fields = connectionFields(document);
  const parsed = profileSchema.safeParse({
    version: 1,
    ...fields,
  });
  if (!parsed.success)
    throw new Error(
      'Connection document does not match the approved Planeon inference contract.',
    );
  const file = path.join(directory, filename);
  if (fs.existsSync(file)) assertPrivate(file);
  const temporary = path.join(directory, `.inference-${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temporary, JSON.stringify(parsed.data), {
      mode: 0o600,
      flag: 'wx',
    });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
