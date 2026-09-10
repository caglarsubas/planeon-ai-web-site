import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createAuth } from './auth';
import { openStore, rateLimit } from './store';
import { RequestService, type Identity } from './requests';
import { engineInference, InferenceLane, type Inference } from './inference';
import { resendMailer, type Mailer } from './mail';
import { boundedJson, sameSecret, sign, StudioError } from './security';
import type { StudioConfig } from './config';
import {
  assistantInputSchema,
  validateRecipe,
} from '../../../lib/studio/contract';
import { companyEmail } from '../../../lib/studio/account';

export async function createStudio(
  config: StudioConfig,
  injected: { mailer?: Mailer; inference?: Inference } = {},
) {
  const db = openStore(config.directory);
  const mailer = injected.mailer || resendMailer(config, db);
  const inference = injected.inference || engineInference(config);
  const auth = await createAuth(config, db, mailer);
  const lane = new InferenceLane();
  const packs = new RequestService(db, config, inference, lane, mailer);
  const json = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    });
  async function identity(request: Request): Promise<Identity> {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user.emailVerified)
      throw new StudioError(
        'SIGN_IN_REQUIRED',
        401,
        'Verify your company email to continue.',
      );
    return session.user;
  }
  async function handler(request: Request): Promise<Response> {
    try {
      if (
        !sameSecret(
          request.headers.get('x-studio-transport') || '',
          config.transportSecret,
        )
      )
        return json({ code: 'NOT_FOUND' }, 404);
      const origin = request.headers.get('origin');
      if (request.method !== 'GET' && origin !== config.websiteOrigin)
        throw new StudioError('ORIGIN_NOT_ALLOWED', 403);
      if (request.headers.get('sec-fetch-site') === 'cross-site')
        throw new StudioError('ORIGIN_NOT_ALLOWED', 403);
      const url = new URL(request.url);
      const route = url.pathname.replace(/^\/api\/studio/, '');
      const client = request.headers.get('x-studio-client') || 'local';
      if (client.length > 128) throw new StudioError('INVALID_CLIENT');
      rateLimit(db, `ip:${client}`, 120);
      if (route === '/health' && request.method === 'GET')
        return json({
          available: true,
          assistant: inference.available(),
          email: mailer.available(),
          laptopBacked: true,
        });
      if (route === '/assistant' && request.method === 'POST') {
        rateLimit(db, `assistant-client:${client}`, 24, 3600_000);
        const session = await auth.api.getSession({ headers: request.headers });
        const token = (request.headers.get('cookie') || '')
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('planeon-studio.draft='))
          ?.split('=')[1];
        const [draft, signature] = (token || '').split('.');
        const existing =
          /^[a-f0-9-]{36}$/.test(draft || '') &&
          sameSecret(signature || '', sign(config.secret, draft));
        const draftId = existing ? draft : randomUUID();
        rateLimit(
          db,
          `assistant-session:${sign(config.secret, session?.user.id || draftId)}`,
          8,
          3600_000,
        );
        const input = assistantInputSchema.parse(await boundedJson(request));
        if (input.intent !== 'clarify' && !input.confirmed)
          throw new StudioError('CONFIRM_BRIEF_FIRST');
        if (input.recipe) validateRecipe(input.recipe);
        const result = await lane.use(() => inference.turn(input));
        const recipe = result.turn.recipe
          ? validateRecipe(result.turn.recipe)
          : null;
        const snapshot = recipe
          ? { recipe, brief: input.brief, provenance: result.provenance }
          : null;
        if ((input.intent === 'clarify') === Boolean(recipe))
          throw new StudioError('INVALID_MODEL_RESPONSE', 502);
        const response = json({
          ...result.turn,
          signedRecipe: snapshot
            ? { snapshot, signature: sign(config.secret, snapshot) }
            : null,
        });
        if (!existing)
          response.headers.append(
            'Set-Cookie',
            `planeon-studio.draft=${draftId}.${sign(config.secret, draftId)}; Path=/api/studio; HttpOnly; SameSite=Lax${config.websiteOrigin.startsWith('https:') ? '; Secure' : ''}`,
          );
        return response;
      }
      if (route.startsWith('/auth/')) {
        rateLimit(db, `auth-client:${client}`, 12, 600_000);
        const authRoute = route.slice('/auth/'.length);
        if (
          request.method !== 'POST' ||
          ![
            'email-otp/send-verification-otp',
            'sign-in/email-otp',
            'sign-out',
          ].includes(authRoute)
        )
          throw new StudioError('NOT_FOUND', 404);
        const body = z
          .record(z.string(), z.unknown())
          .parse(await boundedJson(request, 4096));
        let clean: object = {};
        if (authRoute !== 'sign-out') {
          const email = companyEmail(z.string().max(254).parse(body.email));
          rateLimit(
            db,
            `auth:${authRoute}:${sign(config.secret, email)}`,
            authRoute === 'email-otp/send-verification-otp' ? 3 : 8,
            600_000,
          );
          clean =
            authRoute === 'email-otp/send-verification-otp'
              ? { email, type: 'sign-in' }
              : {
                  email,
                  otp: z
                    .string()
                    .regex(/^\d{6}$/)
                    .parse(body.otp),
                  name: email.split('@')[0],
                };
          if (
            authRoute === 'email-otp/send-verification-otp' &&
            !mailer.available()
          )
            throw new StudioError(
              'MAIL_UNAVAILABLE',
              503,
              'Verification email is unavailable. No account access has been unlocked.',
            );
        }
        const headers = new Headers(request.headers);
        headers.delete('x-studio-transport');
        const response = await auth.handler(
          new Request(`${config.websiteOrigin}/api/studio/auth/${authRoute}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(clean),
          }),
        );
        response.headers.set('Cache-Control', 'no-store');
        return response;
      }
      if (route === '/session' && request.method === 'GET') {
        const session = await auth.api.getSession({ headers: request.headers });
        return json(
          session?.user.emailVerified
            ? {
                user: {
                  email: session.user.email,
                  reviewer: packs.reviewer(session.user),
                },
              }
            : { user: null },
        );
      }
      const user = await identity(request);
      if (route === '/requests' && request.method === 'POST')
        return json(packs.submit(user, await boundedJson(request)), 202);
      if (route === '/requests' && request.method === 'GET')
        return json({ requests: packs.list(user) });
      if (route === '/review' && request.method === 'GET')
        return json({ requests: packs.list(user, true) });
      const match = route.match(
        /^\/(requests|review)\/([a-f0-9-]{36})(?:\/(decision|files))?$/,
      );
      if (!match) throw new StudioError('NOT_FOUND', 404);
      const [, scope, id, action] = match;
      if (!action && request.method === 'GET')
        return json(packs.details(user, id, scope === 'review'));
      if (!action && request.method === 'DELETE' && scope === 'requests') {
        const body = (await boundedJson(request, 1024)) as {
          confirm?: boolean;
        };
        if (body.confirm !== true) throw new StudioError('CONFIRM_DELETION');
        await packs.remove(user, id);
        return json({ deleted: true });
      }
      if (
        action === 'decision' &&
        scope === 'review' &&
        request.method === 'POST'
      ) {
        const input = z
          .strictObject({
            version: z.number().int().positive(),
            hash: z.string().regex(/^[a-f0-9]{64}$/),
            decision: z.enum(['approve', 'revise', 'reject']),
            notes: z.string().max(2000),
            confirm: z.literal(true),
          })
          .parse(await boundedJson(request, 5000));
        return json(await packs.decide(user, id, input));
      }
      if (action === 'files' && request.method === 'GET') {
        const result = await packs.artifact(
          user,
          id,
          Number(url.searchParams.get('version')),
          url.searchParams.get('name') || '',
          scope === 'review',
        );
        // Revoked sessions are checked again after local I/O, not just at route entry.
        await identity(request);
        return new Response(new Uint8Array(result.data), {
          headers: {
            'Content-Type': result.type,
            'Content-Length': String(result.bytes),
            'Content-Disposition': `attachment; filename="${result.name}"`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer',
          },
        });
      }
      throw new StudioError('NOT_FOUND', 404);
    } catch (error) {
      if (error instanceof StudioError)
        return json({ code: error.code, message: error.message }, error.status);
      if (error instanceof z.ZodError)
        return json(
          {
            code: 'INVALID_INPUT',
            message: 'Check the required fields and reference IDs.',
          },
          400,
        );
      // No request bodies, model output, email, credentials or stack traces in logs/responses.
      return json(
        {
          code: 'REQUEST_FAILED',
          message:
            'This operation could not be completed. Your existing design and approval state have not been replaced.',
        },
        500,
      );
    }
  }
  return {
    handler,
    packs,
    db,
    auth,
    close: () => db.close(),
    instanceId: randomUUID(),
  };
}
