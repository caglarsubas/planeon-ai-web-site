import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers these top-level test promises with its runner. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import asyncFs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { createStudio } from '../src/app';
import type { StudioConfig } from '../src/config';
import { privateDirectory } from '../src/config';
import { sign, StudioError } from '../src/security';
import { fixture } from './fixture';
import type { Mail, Mailer } from '../src/mail';
import { resendMailer } from '../src/mail';
import { companyEmail, REVIEWER_EMAIL } from '../../../lib/studio/account';
import {
  validateRecipe,
  recipeChanges,
  recipeProvenance,
  conversationTurn,
  type AssistantInput,
} from '../../../lib/studio/contract';
import { recipeFrames } from '../../../lib/studio/frames';
import { InferenceLane, engineInference } from '../src/inference';
import { openStore } from '../src/store';
import { hashBytes } from '../src/documents';

class Inbox implements Mailer {
  messages: { mail: Mail; key: string }[] = [];
  enabled = true;
  failAttachments = false;
  failAll = false;
  available() {
    return this.enabled;
  }
  async send(mail: Mail, key: string) {
    if (!this.enabled || this.failAll)
      throw new StudioError('MAIL_UNAVAILABLE', 503);
    if (this.failAttachments && mail.attachments)
      throw new StudioError('ATTACHMENTS_REJECTED', 422);
    this.messages.push({ mail, key });
    return randomUUID();
  }
}
function config(directory: string): StudioConfig {
  return {
    directory,
    websiteOrigin: 'http://localhost:3001',
    port: 4318,
    secret: randomBytes(48).toString('hex'),
    transportSecret: randomBytes(48).toString('hex'),
    inferenceUrl: '',
    inferenceKey: '',
    inferenceModel: '',
    inferenceIdentity: '',
    modelApproval: '',
    mailEnabled: false,
    mailKey: '',
    mailFrom: 'Planeon <studio@notifications.planeon.ai>',
    mailBudgetDay: '',
    mailDailyBudget: 0,
    mailMonthlyBudget: 0,
    attachmentLimit: 5_000_000,
  };
}
const profile = {
  fullName: 'Example Visitor',
  company: 'Example Company',
  role: 'Architect',
  intendedUse: 'Discuss a controlled internal pilot.',
  consent: true as const,
  confirmed: true as const,
};

test('recipe rejects fabricated IDs, relationships, duplicate evidence and cyclic dependencies', () => {
  assert.equal(validateRecipe(fixture().recipe).steps.length, 4);
  for (const mutate of [
    (r: ReturnType<typeof fixture>['recipe']) => {
      r.harnesses.push('invented.harness');
    },
    (r: ReturnType<typeof fixture>['recipe']) => {
      r.evidence[0].harnessId = 'runtime.infrastructure';
    },
    (r: ReturnType<typeof fixture>['recipe']) => {
      r.evidence.push(r.evidence[0]);
    },
    (r: ReturnType<typeof fixture>['recipe']) => {
      r.steps[0].dependsOn = ['verify'];
    },
    (r: ReturnType<typeof fixture>['recipe']) => {
      r.steps[1].clock = 'offline';
    },
  ]) {
    const r = fixture().recipe;
    mutate(r);
    assert.throws(() => validateRecipe(r));
  }
});
test('custom occurrences stay separate and preserve waits, omissions, repeats, parallel joins and offline clocks', () => {
  const r = fixture().recipe;
  r.steps[0].kind = 'clarification';
  r.steps.push({
    ...r.steps[3],
    id: 'repeat',
    kind: 'repeated',
    repeatOf: 'verify',
    dependsOn: ['verify'],
  });
  r.steps.push({
    ...r.steps[3],
    id: 'omitted',
    kind: 'omitted',
    dependsOn: ['repeat'],
  });
  r.steps.push({
    ...r.steps[3],
    id: 'parallel-a',
    kind: 'parallel',
    parallelGroup: 'checks',
    dependsOn: ['omitted'],
    durationMs: 120,
  });
  r.steps.push({
    ...r.steps[3],
    id: 'parallel-b',
    kind: 'parallel',
    parallelGroup: 'checks',
    dependsOn: ['omitted'],
    durationMs: 400,
  });
  r.steps.push({
    ...r.steps[3],
    id: 'join',
    dependsOn: ['parallel-a', 'parallel-b'],
  });
  r.steps.push({
    ...r.steps[3],
    id: 'monitor',
    clock: 'continuous',
    kind: 'monitoring',
    dependsOn: [],
  });
  r.steps.push({
    ...r.steps[3],
    id: 'learn',
    clock: 'offline',
    kind: 'offline',
    dependsOn: [],
  });
  const frames = recipeFrames(validateRecipe(r));
  assert(
    frames.every((f) =>
      f.steps.every((s) => s.canonicalId === null && s.id.startsWith('draft:')),
    ),
  );
  assert.equal(frames.find((f) => f.kind === 'skip')!.duration, 0);
  const par = frames.find((f) => f.kind === 'par')!;
  assert.equal(par.duration, 400);
  assert.equal(
    frames.find((f) => f.id === 'draft-frame:join')!.start,
    par.start + 400,
  );
  assert.equal(frames.find((f) => f.clock === 'offline')!.start, 0);
  assert(frames.some((f) => f.kind === 'wait'));
  assert(frames.some((f) => f.kind === 'clarification'));
  assert(frames.some((f) => f.pass === 2));
});
test('revisions expose meaningful changes without mutating the original', () => {
  const old = fixture().recipe;
  const changed = structuredClone(old);
  changed.steps[0].description = 'A changed request path.';
  changed.recovery.restoreVersion = 'Pin version two.';
  const diff = recipeChanges(old, changed);
  assert.equal(diff.changed.length, 1);
  assert(diff.recoveryChanged);
  assert.notEqual(old.steps[0].description, changed.steps[0].description);
});
test('conversation retains clarification questions and every material recipe change is disclosed', () => {
  const bounded = conversationTurn('x'.repeat(2000), [
    'Which approval policy?',
  ]);
  assert.equal(bounded.length, 2000);
  assert(bounded.endsWith('Which approval policy?'));
  assert.match(
    conversationTurn('Please clarify.', ['Who approves?', 'Which data?']),
    /Who approves\?[\s\S]*Which data\?/,
  );
  assert.ok(conversationTurn('x'.repeat(2000), ['Question']).length <= 2000);
  for (const field of [
    'title',
    'harnesses',
    'openQuestions',
    'acceptanceTests',
  ] as const) {
    const old = fixture().recipe;
    const next = structuredClone(old);
    if (field === 'title') next.title = 'A revised design';
    else next[field] = [...next[field], 'A new item'];
    assert.equal(recipeChanges(old, next)[`${field}Changed`], true);
  }
});
test('canvas and pack form have distinct revision-scoped sibling keys', () => {
  const source = fs.readFileSync(
    new URL('../../../components/site/JourneyDesigner.tsx', import.meta.url),
    'utf8',
  );
  assert(source.includes('key={`canvas:${applied.signature}`}'));
  assert(source.includes('key={`pack:${applied.signature}`}'));
  assert(!source.includes('key={applied.signature}'));
});
test('company mailbox rule blocks known personal and disposable domains, including subdomains', () => {
  for (const email of ['a@gmail.com', 'a@sub.mailinator.com', 'a@YOPMAIL.COM'])
    assert.throws(() => companyEmail(email));
  assert.equal(
    companyEmail(' Person@Example.Company '),
    'person@example.company',
  );
  assert.throws(() => companyEmail('not-an-email'));
});
test('storage rejects synchronized paths and symlink roots', () => {
  assert.throws(() =>
    privateDirectory('/Users/example/Library/CloudStorage/Planeon'),
  );
  assert.throws(() => privateDirectory(os.homedir()));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-path-'));
  const linked = `${root}-link`;
  fs.symlinkSync(root, linked);
  assert.throws(() => privateDirectory(linked));
  fs.unlinkSync(linked);
});
test('inference is fail-closed without a dedicated approved model; no provider fallback', async () => {
  const c = config('/tmp/not-used');
  let called = false;
  const provider = engineInference(c, async () => {
    called = true;
    throw new Error('Unexpected network');
  });
  assert.equal(provider.available(), false);
  await assert.rejects(() => provider.turn({} as AssistantInput));
  assert.equal(called, false);
});
test('one inference job at a time with a bounded queue', async () => {
  const lane = new InferenceLane();
  let concurrent = 0;
  let peak = 0;
  await Promise.all(
    Array.from({ length: 5 }, () =>
      lane.use(async () => {
        concurrent++;
        peak = Math.max(peak, concurrent);
        await new Promise((resolve) => setTimeout(resolve, 5));
        concurrent--;
      }),
    ),
  );
  assert.equal(peak, 1);
});
test('unverified users, cross-origin requests and untrusted bridges cannot access private routes', async () => {
  const c = config(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-security-')));
  const inbox = new Inbox();
  const app = await createStudio(c, { mailer: inbox });
  try {
    assert.equal(
      (await app.handler(new Request(`${c.websiteOrigin}/api/studio/requests`)))
        .status,
      404,
    );
    const headers = {
      'x-studio-transport': c.transportSecret,
      origin: 'https://attacker.example',
      'Content-Type': 'application/json',
    };
    assert.equal(
      (
        await app.handler(
          new Request(`${c.websiteOrigin}/api/studio/requests`, {
            method: 'POST',
            headers,
            body: '{}',
          }),
        )
      ).status,
      403,
    );
    headers.origin = c.websiteOrigin;
    assert.equal(
      (
        await app.handler(
          new Request(`${c.websiteOrigin}/api/studio/requests`, { headers }),
        )
      ).status,
      401,
    );
    assert.equal(
      (
        await app.handler(
          new Request(`${c.websiteOrigin}/api/studio/auth/get-session`, {
            headers,
          }),
        )
      ).status,
      404,
    );
  } finally {
    app.close();
  }
});
test('email failure never unlocks verification, and no-cost budget prevents additional sends', async () => {
  const c = config(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-mail-')));
  const inbox = new Inbox();
  inbox.enabled = false;
  const app = await createStudio(c, { mailer: inbox });
  const response = await app.handler(
    new Request(
      `${c.websiteOrigin}/api/studio/auth/email-otp/send-verification-otp`,
      {
        method: 'POST',
        headers: {
          'x-studio-transport': c.transportSecret,
          origin: c.websiteOrigin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'user@example.company' }),
      },
    ),
  );
  assert.equal(response.status, 503);
  assert.equal(inbox.messages.length, 0);
  app.close();
  const db = openStore(c.directory);
  c.mailEnabled = true;
  c.mailKey = 'mock-key';
  c.mailBudgetDay = new Date().toISOString().slice(0, 10);
  c.mailDailyBudget = 1;
  c.mailMonthlyBudget = 1;
  let sends = 0;
  const mailer = resendMailer(c, db, async () => {
    sends++;
    return Response.json({ id: 'mock-id' });
  });
  await mailer.send(
    { to: 'user@example.company', subject: 'test', text: 'test' },
    'one',
  );
  await assert.rejects(() =>
    mailer.send(
      { to: 'user@example.company', subject: 'test', text: 'test' },
      'two',
    ),
  );
  assert.equal(sends, 1);
  c.mailBudgetDay = '2000-01-01';
  assert.equal(mailer.available(), false);
  db.close();
});

test('verified submission -> private preparation -> versioned review -> immutable approved downloads; IDOR, revisions, retries, signout and expiry', async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'planeon-studio-acceptance-'),
  );
  const c = config(directory);
  const inbox = new Inbox();
  let revisions = 0;
  const app = await createStudio(c, {
    mailer: inbox,
    inference: {
      available: () => true,
      async turn(input) {
        const snapshot = fixture();
        snapshot.recipe.title += ` revision ${++revisions}`;
        return {
          turn: {
            reply: 'Proposed revision.',
            questions: [],
            brief: input.brief,
            recipe: snapshot.recipe,
            changeSummary: ['Updated title.'],
          },
          provenance: recipeProvenance('self-hosted-test-fixture'),
        };
      },
    },
  });
  let clientNumber = 0;
  async function call(
    route: string,
    body?: object,
    cookie = '',
    method = body ? 'POST' : 'GET',
  ) {
    return app.handler(
      new Request(`${c.websiteOrigin}/api/studio${route}`, {
        method,
        headers: {
          origin: c.websiteOrigin,
          'x-studio-transport': c.transportSecret,
          'x-studio-client': String(++clientNumber),
          'Content-Type': 'application/json',
          ...(cookie ? { cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
  }
  async function signIn(email: string) {
    assert.equal(
      (await call('/auth/email-otp/send-verification-otp', { email })).status,
      200,
    );
    const otp = inbox.messages
      .findLast((x) => x.mail.to === email)!
      .mail.text.match(/\b\d{6}\b/)![0];
    const stored = app.db.prepare('SELECT value FROM verification').all() as {
      value: string;
    }[];
    assert(stored.every((x) => !x.value.includes(otp)));
    const response = await call('/auth/sign-in/email-otp', { email, otp });
    assert.equal(response.status, 200, await response.clone().text());
    assert(
      [400, 429].includes(
        (await call('/auth/sign-in/email-otp', { email, otp })).status,
      ),
    );
    return response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
  }
  try {
    const customer = await signIn('visitor@example.company');
    const other = await signIn('other@example.company');
    let reviewer = await signIn(REVIEWER_EMAIL);
    const snapshot = fixture();
    const payload = {
      profile,
      snapshot,
      signature: sign(c.secret, snapshot),
      idempotencyKey: randomUUID(),
    };
    assert.equal(
      (
        await call(
          '/requests',
          { ...payload, profile: { ...profile, role: '' } },
          customer,
        )
      ).status,
      400,
    );
    const response = await call('/requests', payload, customer);
    assert.equal(response.status, 202, await response.clone().text());
    const { id } = (await response.json()) as { id: string };
    assert.equal(
      (
        (await (await call('/requests', payload, customer)).json()) as {
          id: string;
        }
      ).id,
      id,
    );
    assert.equal(
      (
        await call(
          '/requests',
          { ...payload, profile: { ...profile, role: 'Changed' } },
          customer,
        )
      ).status,
      409,
    );
    assert.equal((await call(`/requests/${id}`, undefined, other)).status, 404);
    assert.equal((await call('/review', undefined, customer)).status, 403);
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=1&name=recipe.json`,
          undefined,
          customer,
        )
      ).status,
      404,
    );
    app.packs.recover();
    await app.packs.tick();
    let review = (await (
      await call(`/review/${id}`, undefined, reviewer)
    ).json()) as {
      manifest: { snapshotHash: string };
      version: number;
      status: string;
    };
    assert.equal(review.status, 'review');
    const privateCustomerView = (await (
      await call(`/requests/${id}`, undefined, customer)
    ).json()) as Record<string, unknown>;
    assert(!('snapshot' in privateCustomerView));
    assert(!('manifest' in privateCustomerView));
    assert(!('history' in privateCustomerView));
    const internalPdf = await call(
      `/review/${id}/files?version=1&name=engineering-pack.pdf`,
      undefined,
      reviewer,
    );
    assert.equal(internalPdf.status, 200);
    assert.equal(
      Buffer.from(await internalPdf.arrayBuffer())
        .subarray(0, 4)
        .toString(),
      '%PDF',
    );
    assert.equal(
      (await call(`/review/${id}/decision`, undefined, reviewer)).status,
      404,
    );
    assert.equal(
      (
        await call(
          `/review/${id}/decision`,
          {
            version: 1,
            hash: review.manifest.snapshotHash,
            decision: 'approve',
            notes: '',
            confirm: false,
          },
          reviewer,
        )
      ).status,
      400,
    );
    const firstHash = review.manifest.snapshotHash;
    assert.equal(
      (
        await call(
          `/review/${id}/decision`,
          {
            version: 1,
            hash: firstHash,
            decision: 'revise',
            notes: 'Clarify the architecture title for the customer.',
            confirm: true,
          },
          reviewer,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await call(
          `/review/${id}/decision`,
          {
            version: 1,
            hash: firstHash,
            decision: 'approve',
            notes: '',
            confirm: true,
          },
          reviewer,
        )
      ).status,
      409,
    );
    await app.packs.tick();
    review = (await (
      await call(`/review/${id}`, undefined, reviewer)
    ).json()) as typeof review;
    assert.equal(review.version, 2);
    assert.match((review as unknown as { title: string }).title, /revision 1/);
    const reviewedJson = Buffer.from(
      await (
        await call(
          `/review/${id}/files?version=2&name=recipe.json`,
          undefined,
          reviewer,
        )
      ).arrayBuffer(),
    );
    const approve = {
      version: 2,
      hash: review.manifest.snapshotHash,
      decision: 'approve',
      notes: 'Internal reviewer note only.',
      confirm: true,
    };
    // Revoke the actual Better Auth session during the asynchronous integrity reads.
    const originalRead = asyncFs.readFile;
    let revoked = false;
    asyncFs.readFile = (async (
      ...args: Parameters<typeof asyncFs.readFile>
    ) => {
      const bytes = await originalRead(...args);
      if (!revoked) {
        revoked = true;
        assert.equal((await call('/auth/sign-out', {}, reviewer)).status, 200);
      }
      return bytes;
    }) as typeof asyncFs.readFile;
    try {
      assert.equal(
        (await call(`/review/${id}/decision`, approve, reviewer)).status,
        401,
      );
      assert.equal(
        (
          app.db.prepare('SELECT status FROM requests WHERE id=?').get(id) as {
            status: string;
          }
        ).status,
        'review',
      );
    } finally {
      asyncFs.readFile = originalRead;
    }
    reviewer = await signIn(REVIEWER_EMAIL);
    assert.equal(
      (await call(`/review/${id}/decision`, approve, reviewer)).status,
      200,
    );
    assert.equal(
      (await call(`/review/${id}/decision`, approve, reviewer)).status,
      409,
    );
    inbox.failAttachments = true;
    await app.packs.tick();
    await app.packs.tick();
    const downloads = await call(
      `/requests/${id}/files?version=2&name=recipe.json`,
      undefined,
      customer,
    );
    assert.equal(downloads.status, 200);
    assert.deepEqual(Buffer.from(await downloads.arrayBuffer()), reviewedJson);
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=1&name=recipe.json`,
          undefined,
          customer,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=2&name=recipe.json`,
          undefined,
          other,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=2&name=../../auth.secret`,
          undefined,
          customer,
        )
      ).status,
      404,
    );
    const delivered = inbox.messages.filter(
      (x) =>
        x.mail.to === 'visitor@example.company' &&
        x.mail.subject.includes('approved'),
    );
    assert.equal(delivered.length, 1);
    assert(!delivered[0].mail.attachments);
    assert(delivered[0].mail.text.includes('/journey/requests?request='));
    app.packs.recover();
    await app.packs.tick();
    assert.equal(
      inbox.messages.filter((x) => x.mail.subject.includes('approved')).length,
      1,
    );
    assert(
      !JSON.stringify(
        await (await call(`/requests/${id}`, undefined, customer)).json(),
      ).includes('Internal reviewer note'),
    );
    await call('/auth/sign-out', {}, customer);
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=2&name=recipe.json`,
          undefined,
          customer,
        )
      ).status,
      401,
    );
    const signedAgain = await signIn('visitor@example.company');
    app.db
      .prepare('UPDATE requests SET expires=? WHERE id=?')
      .run(Date.now() - 1, id);
    assert.equal(
      (
        await call(
          `/requests/${id}/files?version=2&name=recipe.json`,
          undefined,
          signedAgain,
        )
      ).status,
      404,
    );
    // Keep an explicitly synthetic QA copy, never a customer's private data.
    const qa = path.join(os.tmpdir(), 'planeon-studio-synthetic-qa.pdf');
    fs.copyFileSync(
      path.join(directory, 'packs', id, 'v2/engineering-pack.pdf'),
      qa,
    );
    await app.packs.cleanup();
    assert.equal(fs.existsSync(path.join(directory, 'packs', id)), false);
    console.info(`Synthetic document QA: ${qa}`);
  } finally {
    app.close();
  }
});

test('public proposals require confirmation, remain unretained, and enforce per-session limits', async () => {
  const c = config(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-draft-')));
  let turns = 0;
  const app = await createStudio(c, {
    mailer: new Inbox(),
    inference: {
      available: () => true,
      async turn() {
        turns++;
        return {
          turn: {
            reply: 'Synthetic proposal.',
            questions: [],
            brief: null,
            recipe: fixture().recipe,
            changeSummary: [],
          },
          provenance: recipeProvenance('self-hosted-test-fixture'),
        };
      },
    },
  });
  const input = {
    intent: 'design',
    message: 'Make a proposal.',
    brief: fixture().brief,
    confirmed: true,
    recipe: null,
    history: [],
    context: { harness: '', feature: '', scenario: '' },
  };
  const call = (body: object, cookie = '') =>
    app.handler(
      new Request(`${c.websiteOrigin}/api/studio/assistant`, {
        method: 'POST',
        headers: {
          origin: c.websiteOrigin,
          'x-studio-transport': c.transportSecret,
          'x-studio-client': 'test-draft-session',
          'content-type': 'application/json',
          cookie,
        },
        body: JSON.stringify(body),
      }),
    );
  try {
    assert.equal((await call({ ...input, confirmed: false })).status, 400);
    assert.equal(turns, 0);
    const first = await call(input);
    assert.equal(first.status, 200);
    const result = (await first.json()) as {
      signedRecipe: { snapshot: unknown; signature: string };
    };
    assert.equal(
      result.signedRecipe.signature,
      sign(c.secret, result.signedRecipe.snapshot),
    );
    const cookie = first.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    assert(cookie.startsWith('planeon-studio.draft='));
    for (let i = 0; i < 7; i++)
      assert.equal((await call(input, cookie)).status, 200);
    assert.equal((await call(input, cookie)).status, 429);
    for (const table of ['requests', 'versions', 'user', 'session'])
      assert.equal(
        (
          app.db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as {
            n: number;
          }
        ).n,
        0,
      );
    assert(
      !JSON.stringify(app.db.prepare('SELECT * FROM limits').all()).includes(
        input.brief.workflow,
      ),
    );
  } finally {
    app.close();
  }
});

test('restart recovery preserves exact approved bytes; failed email never removes downloads; rejected and tampered packs stay private', async () => {
  const c = config(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-recovery-')));
  const inbox = new Inbox();
  let app = await createStudio(c, { mailer: inbox });
  const owner = {
    id: 'test-owner',
    email: 'owner@example.company',
    emailVerified: true,
  };
  const reviewer = {
    id: 'test-reviewer',
    email: REVIEWER_EMAIL,
    emailVerified: true,
  };
  const submit = () => {
    const snapshot = fixture();
    return app.packs.submit(owner, {
      profile,
      snapshot,
      signature: sign(c.secret, snapshot),
      idempotencyKey: randomUUID(),
    });
  };
  try {
    const { id } = submit();
    app.db.prepare("UPDATE jobs SET state='running'").run();
    app.close();
    app = await createStudio(c, { mailer: inbox });
    app.packs.recover();
    await app.packs.tick();
    const review = app.packs.details(reviewer, id, true);
    assert.equal(review.status, 'review');
    const manifest = review.manifest!;
    const reviewEmail = inbox.messages.find((x) =>
      x.mail.subject.includes('ready for your review'),
    )!;
    assert.equal(reviewEmail.mail.attachments!.length, 3);
    for (const file of manifest.artifacts) {
      const sent = reviewEmail.mail.attachments!.find(
        (a) => a.filename === file.name,
      )!;
      assert.equal(hashBytes(Buffer.from(sent.content, 'base64')), file.sha256);
    }
    await app.packs.decide(reviewer, id, {
      version: 1,
      hash: manifest.snapshotHash,
      decision: 'approve',
      notes: '',
      confirm: true,
    });
    inbox.failAll = true;
    await app.packs.tick();
    assert.equal(app.packs.details(owner, id).status, 'approved');
    assert.equal(
      (await app.packs.artifact(owner, id, 1, 'recipe.json')).sha256,
      manifest.artifacts[0].sha256,
    );
    app.close();
    app = await createStudio(c, { mailer: inbox });
    app.packs.recover();
    inbox.failAll = false;
    app.db.prepare("UPDATE outbox SET available=0 WHERE kind='delivery'").run();
    await app.packs.tick();
    const email = inbox.messages.find((x) => x.mail.to === owner.email)!;
    for (const file of manifest.artifacts) {
      const download = await app.packs.artifact(owner, id, 1, file.name);
      const attachment = email.mail.attachments!.find(
        (a) => a.filename === file.name,
      )!;
      assert.deepEqual(
        download.data,
        Buffer.from(attachment.content, 'base64'),
      );
      assert.equal(download.sha256, file.sha256);
    }
    const json = JSON.parse(
      (await app.packs.artifact(owner, id, 1, 'recipe.json')).data.toString(),
    );
    const markdown = (
      await app.packs.artifact(owner, id, 1, 'specification.md')
    ).data.toString();
    for (const step of json.recipe.steps)
      assert(markdown.includes(step.id) && markdown.includes(step.title));
    for (const e of json.recipe.evidence)
      assert(
        markdown.includes(e.featureId) && markdown.includes(e.expectedEvidence),
      );
    await app.packs.remove(owner, id);
    assert.equal(fs.existsSync(path.join(c.directory, 'packs', id)), false);
    await assert.rejects(() => app.packs.artifact(owner, id, 1, 'recipe.json'));

    const rejected = submit().id;
    await app.packs.tick();
    const rejectView = app.packs.details(reviewer, rejected, true);
    await app.packs.decide(reviewer, rejected, {
      version: 1,
      hash: rejectView.manifest!.snapshotHash,
      decision: 'reject',
      notes: 'Not suitable for release.',
      confirm: true,
    });
    await assert.rejects(() =>
      app.packs.artifact(owner, rejected, 1, 'recipe.json'),
    );
    assert(
      !JSON.stringify(app.packs.details(owner, rejected)).includes(
        'Not suitable',
      ),
    );
    const tampered = submit().id;
    await app.packs.tick();
    const view = app.packs.details(reviewer, tampered, true);
    fs.appendFileSync(
      path.join(c.directory, 'packs', tampered, 'v1/recipe.json'),
      '\n',
    );
    await assert.rejects(
      () =>
        app.packs.decide(reviewer, tampered, {
          version: 1,
          hash: view.manifest!.snapshotHash,
          decision: 'approve',
          notes: '',
          confirm: true,
        }),
      (error: unknown) =>
        error instanceof StudioError &&
        error.code === 'ARTIFACT_INTEGRITY_FAILED',
    );
    assert.equal(app.packs.details(owner, tampered).status, 'review');
  } finally {
    app.close();
  }
});
