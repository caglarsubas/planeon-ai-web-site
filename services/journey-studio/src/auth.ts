import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { getMigrations } from 'better-auth/db/migration';
import { randomUUID } from 'node:crypto';
import { companyEmail } from '../../../lib/studio/account';
import type { StudioConfig } from './config';
import type { Store } from './store';
import type { Mailer } from './mail';

export async function createAuth(
  config: StudioConfig,
  db: Store,
  mailer: Mailer,
) {
  // The library also honors ambient environment overrides; this local service never opts into telemetry.
  process.env.BETTER_AUTH_TELEMETRY = 'false';
  process.env.BETTER_AUTH_TELEMETRY_DEBUG = 'false';
  delete process.env.BETTER_AUTH_TELEMETRY_ENDPOINT;
  const options = {
    appName: 'Planeon Journey Studio',
    database: db,
    baseURL: config.websiteOrigin,
    basePath: '/api/studio/auth',
    secret: config.secret,
    trustedOrigins: [config.websiteOrigin],
    emailAndPassword: { enabled: false },
    session: {
      expiresIn: 60 * 60 * 12,
      updateAge: 60 * 60,
      cookieCache: { enabled: false },
    },
    advanced: {
      cookiePrefix: 'planeon-studio',
      useSecureCookies: config.websiteOrigin.startsWith('https:'),
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/api/studio',
      },
      ipAddress: { ipAddressHeaders: ['x-studio-client'] },
    },
    logger: { disabled: true },
    telemetry: { enabled: false, debug: false },
    // The authenticated bridge supplies a pseudonymous client key, not a raw IP.
    // app.ts applies durable per-client and per-mailbox limits before Better Auth.
    rateLimit: { enabled: false },
    plugins: [
      emailOTP({
        storeOTP: 'hashed',
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        resendStrategy: 'rotate',
        changeEmail: { enabled: false },
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== 'sign-in')
            throw new Error('Unsupported authentication flow');
          const to = companyEmail(email);
          await mailer.send(
            {
              to,
              subject: 'Your Planeon sign-in code',
              text: `Your Planeon verification code is ${otp}. It expires in five minutes and can be used once. If you did not request it, ignore this email. Planeon will never ask you to share this code.`,
            },
            `studio-otp-${randomUUID()}`,
          );
        },
      }),
    ],
  };
  const migrations = await getMigrations(options);
  if (migrations.schemaProblems.length || migrations.unsafeChanges.length)
    throw new Error('Studio authentication migration needs review.');
  await migrations.runMigrations();
  return betterAuth(options);
}
