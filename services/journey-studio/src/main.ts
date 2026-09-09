import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { readConfig } from './config';
import { createStudio } from './app';

process.umask(0o077);
const config = readConfig();
const lock = path.join(config.directory, 'service.pid');
if (fs.existsSync(lock)) {
  const previous = Number(fs.readFileSync(lock, 'utf8'));
  let live = false;
  try {
    process.kill(previous, 0);
    live = true;
  } catch {}
  if (live) throw new Error('Journey Studio is already running.');
  fs.unlinkSync(lock);
}
fs.writeFileSync(lock, String(process.pid), { flag: 'wx', mode: 0o600 });
const studio = await createStudio(config);
studio.packs.recover();
const server = http.createServer(async (incoming, outgoing) => {
  try {
    if (
      incoming.headers.host !== `127.0.0.1:${config.port}` &&
      incoming.headers.host !== `localhost:${config.port}`
    ) {
      outgoing.writeHead(403);
      outgoing.end();
      return;
    }
    const chunks: Buffer[] = [];
    let length = 0;
    for await (const chunk of incoming) {
      length += chunk.length;
      if (length > 160_000) {
        outgoing.writeHead(413);
        outgoing.end();
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(incoming.headers))
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    const request = new Request(`${config.websiteOrigin}${incoming.url}`, {
      method: incoming.method,
      headers,
      ...(length ? { body: Buffer.concat(chunks) } : {}),
    });
    const response = await studio.handler(request);
    const responseHeaders: Record<string, string | string[]> =
      Object.fromEntries(response.headers);
    if (response.headers.getSetCookie().length)
      responseHeaders['set-cookie'] = response.headers.getSetCookie();
    outgoing.writeHead(response.status, responseHeaders);
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        outgoing.write(value);
      }
    }
    outgoing.end();
  } catch {
    outgoing.writeHead(503, { 'Content-Type': 'application/json' });
    outgoing.end('{"message":"Local service unavailable."}');
  }
});
server.requestTimeout = 145_000;
server.headersTimeout = 10_000;
server.listen(config.port, '127.0.0.1', () =>
  console.info(
    `Planeon Journey Studio listening on http://127.0.0.1:${config.port}. Live email and inference require explicit configuration.`,
  ),
);
let workerTick: Promise<void> | null = null;
const timer = setInterval(() => {
  if (workerTick) return;
  workerTick = studio.packs
    .tick()
    .catch(() => {
      /* Retry on next supervised tick; never log private state. */
    })
    .finally(() => {
      workerTick = null;
    });
}, 3000);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  clearInterval(timer);
  await Promise.all([
    new Promise<void>((resolve) => server.close(() => resolve())),
    workerTick,
  ]);
  studio.close();
  fs.unlinkSync(lock);
  process.exit(0);
}
process.on('SIGTERM', () => {
  void stop();
});
process.on('SIGINT', () => {
  void stop();
});
