import { z } from 'zod';
import { briefSchema, recipeSchema } from './contract';

// Deliberately a maintained denylist, not a claim to verify corporate ownership.
export const nonCompanyDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'gmx.com',
  'gmx.de',
  'yandex.com',
  'qq.com',
  '163.com',
  '126.com',
  'zoho.com',
  'fastmail.com',
  'hey.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'yopmail.fr',
  'getnada.com',
  'dispostable.com',
  'throwawaymail.com',
  'maildrop.cc',
  'mohmal.com',
]);
export function companyEmail(value: string) {
  return z
    .email()
    .max(254)
    .refine((email) => {
      const domain = email.split('@')[1];
      return ![...nonCompanyDomains].some(
        (d) => domain === d || domain.endsWith(`.${d}`),
      );
    }, 'Use a company email. For a legitimate exception, contact Planeon.')
    .parse(value.trim().toLowerCase());
}
export const profileSchema = z.strictObject({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().min(2).max(120),
  intendedUse: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
  confirmed: z.literal(true),
});
export type RequestProfile = z.infer<typeof profileSchema>;
export const snapshotSchema = z.strictObject({
  recipe: recipeSchema,
  brief: briefSchema,
  provenance: z.strictObject({
    catalogVersion: z.string(),
    recipeVersion: z.string(),
    model: z.string().max(200),
    generatedAt: z.iso.datetime(),
    origin: z.literal('self-hosted-inference'),
  }),
});
export const packRequestSchema = z.strictObject({
  profile: profileSchema,
  snapshot: snapshotSchema,
  signature: z.string().regex(/^[a-f0-9]{64}$/),
  idempotencyKey: z.uuid(),
});
export type PackRequestInput = z.infer<typeof packRequestSchema>;
export type SignedRecipe = {
  snapshot: z.infer<typeof snapshotSchema>;
  signature: string;
};
export const retentionMs = 90 * 24 * 60 * 60 * 1000;
export const REVIEWER_EMAIL = 'caglar.subasi@planeon.ai';
