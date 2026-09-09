import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';

export type StudioConfig = {
  directory: string;
  websiteOrigin: string;
  port: number;
  secret: string;
  transportSecret: string;
  inferenceUrl: string;
  inferenceKey: string;
  inferenceModel: string;
  inferenceIdentity: string;
  modelApproval: string;
  mailEnabled: boolean;
  mailKey: string;
  mailFrom: string;
  mailBudgetDay: string;
  mailDailyBudget: number;
  mailMonthlyBudget: number;
  attachmentLimit: number;
};
export function privateDirectory(directory: string) {
  const root = path.resolve(directory);
  if (
    root === path.parse(root).root ||
    root === homedir() ||
    root.split(path.sep).length < 5 ||
    /(?:CloudStorage|Mobile Documents|Dropbox|GoogleDrive|OneDrive|\/Desktop\/|\/Documents\/)/i.test(
      root,
    )
  )
    throw new Error(
      'Studio storage must be a dedicated non-synchronized private directory.',
    );
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const real = fs.realpathSync(root);
  if (real !== root || fs.lstatSync(root).isSymbolicLink())
    throw new Error('Private storage cannot be a symlink.');
  fs.chmodSync(root, 0o700);
  return root;
}
function storedSecret(directory: string, name: string) {
  const file = path.join(directory, name);
  try {
    fs.writeFileSync(file, randomBytes(48).toString('hex'), {
      flag: 'wx',
      mode: 0o600,
    });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
  }
  if (fs.lstatSync(file).isSymbolicLink() || fs.statSync(file).mode & 0o077)
    throw new Error('Studio secrets must be private regular files.');
  return fs.readFileSync(file, 'utf8').trim();
}
export function readConfig(): StudioConfig {
  const directory = privateDirectory(
    process.env.STUDIO_DATA_DIR ||
      path.join(homedir(), 'Library/Application Support/Planeon/JourneyStudio'),
  );
  const websiteOrigin =
    process.env.STUDIO_WEBSITE_ORIGIN || 'http://localhost:3001';
  if (!['http://localhost:3001', 'https://planeon.ai'].includes(websiteOrigin))
    throw new Error('Use the approved Planeon or local-preview origin.');
  return {
    directory,
    websiteOrigin,
    port: Number(process.env.STUDIO_PORT || 4318),
    secret:
      process.env.STUDIO_AUTH_SECRET || storedSecret(directory, 'auth.secret'),
    transportSecret:
      process.env.STUDIO_TRANSPORT_SECRET ||
      storedSecret(directory, 'transport.secret'),
    inferenceUrl: process.env.STUDIO_INFERENCE_URL || '',
    inferenceKey: process.env.STUDIO_INFERENCE_KEY || '',
    inferenceModel: process.env.STUDIO_INFERENCE_MODEL || '',
    inferenceIdentity: process.env.STUDIO_INFERENCE_IDENTITY || '',
    modelApproval: process.env.STUDIO_SELF_HOSTED_APPROVAL || '',
    mailEnabled:
      process.env.STUDIO_MAIL_ENABLED === 'true' &&
      process.env.STUDIO_MAIL_FREE_PLAN_VERIFIED === 'true',
    mailKey: process.env.STUDIO_RESEND_API_KEY || '',
    mailFrom: 'Planeon Journey Studio <studio@notifications.planeon.ai>',
    mailBudgetDay: process.env.STUDIO_MAIL_BUDGET_DAY || '',
    mailDailyBudget: Number(process.env.STUDIO_MAIL_DAILY_BUDGET || 0),
    mailMonthlyBudget: Number(process.env.STUDIO_MAIL_MONTHLY_BUDGET || 0),
    attachmentLimit: Math.min(
      8_000_000,
      Number(process.env.STUDIO_ATTACHMENT_LIMIT || 5_000_000),
    ),
  };
}
