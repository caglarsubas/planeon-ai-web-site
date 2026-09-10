import type { Plugin } from 'vite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { studioProxy } from './proxy';

/** Dev-server only. No secret is serialized into browser code or production build output. */
export function studioLocalPreview(): Plugin {
  return {
    name: 'planeon-local-studio-preview',
    apply: 'serve',
    enforce: 'pre',
    configureServer(server) {
      const file = path.join(
        os.homedir(),
        'Library/Application Support/Planeon/JourneyStudio/transport.secret',
      );
      if (fs.existsSync(file)) {
        const stat = fs.lstatSync(file);
        if (stat.isFile() && !stat.isSymbolicLink() && !(stat.mode & 0o077)) {
          process.env.STUDIO_TRANSPORT_SECRET ??= fs
            .readFileSync(file, 'utf8')
            .trim();
          process.env.STUDIO_SERVICE_URL ??= 'http://127.0.0.1:4318';
        }
      }
      server.middlewares.use(async (incoming, outgoing, next) => {
        if (
          incoming.url === '/__studio-visual-qa' &&
          incoming.headers.host === 'localhost:3001'
        ) {
          const html = await server.transformIndexHtml(
            '/__studio-visual-qa',
            '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Planeon synthetic visual acceptance</title></head><body><div id="studio-qa"></div><script type="module" src="/scripts/studio-visual-preview.tsx"></script></body></html>',
          );
          outgoing.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store',
          });
          outgoing.end(html);
          return;
        }
        if (!incoming.url?.startsWith('/api/studio/')) {
          next();
          return;
        }
        if (incoming.headers.host !== 'localhost:3001') {
          outgoing.writeHead(403);
          outgoing.end();
          return;
        }
        try {
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of incoming) {
            size += chunk.length;
            if (size > 160_000) {
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
          const response = await studioProxy(
            new Request(`http://localhost:3001${incoming.url}`, {
              method: incoming.method,
              headers,
              ...(size ? { body: Buffer.concat(chunks) } : {}),
            }),
          );
          const output: Record<string, string | string[]> = Object.fromEntries(
            response.headers,
          );
          if (response.headers.getSetCookie().length)
            output['set-cookie'] = response.headers.getSetCookie();
          outgoing.writeHead(response.status, output);
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
          outgoing.writeHead(503, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          });
          outgoing.end(
            '{"message":"The local assistant service is unavailable."}',
          );
        }
      });
    },
  };
}
