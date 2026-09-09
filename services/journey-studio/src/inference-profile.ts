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
  const field = (name: string) => {
    const row = document
      .split(/\r?\n/)
      .find((line) => line.startsWith(`| **${name}** |`));
    return row?.split('|')[2]?.trim().replace(/^`|`$/g, '') ?? '';
  };
  const parsed = profileSchema.safeParse({
    version: 1,
    url: field('Inference API base URL'),
    key: field('API key'),
    model: field('Approved model'),
    tenant: field('Tenant'),
    organization: field('Organisation'),
    keyId: field('Key ID'),
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
