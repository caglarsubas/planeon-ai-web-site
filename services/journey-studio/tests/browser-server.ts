/** Explicit local browser acceptance harness. Never imported by the app or production entrypoint.
 * Real pinned inference + real auth/SQLite/worker/files; delivery stays in a synthetic inbox.
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { readConfig } from '../src/config';
import { createStudio } from '../src/app';
import { engineInference } from '../src/inference';
import type { Mail } from '../src/mail';
import { REVIEWER_EMAIL } from '../../../lib/studio/account';

if (process.argv[2] !== '--local-e2e' || process.env.NODE_ENV === 'production')
  throw new Error('Run explicitly with --local-e2e, never in production.');
process.umask(0o077);
const original = readConfig();
if (original.websiteOrigin !== 'http://localhost:3001')
  throw new Error('Local preview only.');
const directory = fs.realpathSync(
  fs.mkdtempSync(path.join(os.tmpdir(), 'planeon-browser-e2e-')),
);
const config = {
  ...original,
  directory,
  port: 4319,
  secret: randomBytes(48).toString('hex'),
  mailEnabled: false,
  mailKey: '',
};
const messages: Mail[] = [];
const turns: unknown[] = [];
const diagnostics: unknown[] = [];
const engine = engineInference(config, fetch, (event) => {
  diagnostics.push(event);
  fs.writeFileSync(
    path.join(directory, 'diagnostics.json'),
    JSON.stringify(diagnostics, null, 2),
  );
  console.info(JSON.stringify(event));
});
const studio = await createStudio(config, {
  inference: {
    available: () => engine.available(),
    async turn(input) {
      const result = await engine.turn(input);
      turns.push({ input, ...result });
      fs.writeFileSync(
        path.join(directory, 'turns.json'),
        JSON.stringify(turns, null, 2),
      );
      return result;
    },
  },
  mailer: {
    available: () => true,
    async send(mail) {
      if (
        mail.to !== REVIEWER_EMAIL &&
        !/^[a-z0-9.-]+@studio-test\.example$/.test(mail.to)
      )
        throw new Error('Only isolated test identities are accepted.');
      messages.unshift(mail);
      return `synthetic-${randomUUID()}`;
    },
  },
});
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const server = http.createServer(async (req, res) => {
  if (!['127.0.0.1:4319', 'localhost:4319'].includes(req.headers.host || '')) {
    res.writeHead(403).end();
    return;
  }
  if (req.method === 'GET' && req.url === '/__test-inbox') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Frame-Options': 'DENY',
    });
    res.end(
      `<!doctype html><html lang="en"><meta charset="UTF-8"><title>Planeon isolated test inbox</title><h1>Isolated test inbox — no real email sent</h1><p>Codes authenticate only this disposable test database. Reload to see new messages.</p>${messages.map((m) => `<article data-recipient="${escape(m.to)}"><h2>${escape(m.subject)}</h2><p>${escape(m.to)}</p><pre>${escape(m.text)}</pre><p>${m.attachments?.length || 0} prepared attachments captured</p></article>`).join('')}</html>`,
    );
    return;
  }
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 160000) {
        res.writeHead(413).end();
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers))
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    const response = await studio.handler(
      new Request(`${config.websiteOrigin}${req.url}`, {
        method: req.method,
        headers,
        ...(size ? { body: Buffer.concat(chunks) } : {}),
      }),
    );
    const outgoing: Record<string, string | string[]> = Object.fromEntries(
      response.headers,
    );
    if (response.headers.getSetCookie().length)
      outgoing['set-cookie'] = response.headers.getSetCookie();
    res.writeHead(response.status, outgoing);
    res.end(Buffer.from(await response.arrayBuffer()));
    console.info(`${req.method} ${req.url?.split('?')[0]} ${response.status}`);
  } catch {
    res.writeHead(503).end();
  }
});
server.requestTimeout = 240000;
server.listen(4319, '127.0.0.1', () =>
  console.info(
    `Isolated E2E service: http://127.0.0.1:4319; test evidence: ${directory}`,
  ),
);
let busy = false;
const timer = setInterval(async () => {
  if (busy) return;
  busy = true;
  try {
    await studio.packs.tick();
  } catch {
    console.error('Isolated test worker tick failed; inspect request status.');
  } finally {
    busy = false;
  }
}, 1000);
process.on('SIGINT', () => {
  clearInterval(timer);
  server.close(() => {
    studio.close();
    process.exit(0);
  });
});
