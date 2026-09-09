import { STUDIO_ASSISTANT_PROXY_TIMEOUT_MS } from './limits';

const allowed =
  /^\/api\/studio\/(health|assistant|session|requests|review|auth\/(email-otp\/send-verification-otp|sign-in\/email-otp|sign-out)|(requests|review)\/[a-f0-9-]{36}(\/(files|decision))?)$/;
const offline = () =>
  Response.json(
    {
      code: 'STUDIO_OFFLINE',
      message:
        'Journey Studio is temporarily unavailable while its local service is offline. The example library and all reference pages remain available.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
export async function studioProxy(request: Request) {
  const url = new URL(request.url);
  if (!allowed.test(url.pathname)) return new Response(null, { status: 404 });
  const origin = url.origin;
  if (!['http://localhost:3001', 'https://planeon.ai'].includes(origin))
    return new Response(null, { status: 403 });
  if (request.method !== 'GET' && request.headers.get('origin') !== origin)
    return new Response(null, { status: 403 });
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return new Response(null, { status: 403 });
  const endpoint = process.env.STUDIO_SERVICE_URL;
  const secret = process.env.STUDIO_TRANSPORT_SECRET;
  if (!endpoint || !secret) return offline();
  let upstream: URL;
  try {
    upstream = new URL(endpoint);
  } catch {
    return offline();
  }
  if (
    upstream.protocol !== 'https:' &&
    !(
      origin === 'http://localhost:3001' &&
      upstream.protocol === 'http:' &&
      upstream.hostname === '127.0.0.1'
    )
  )
    return offline();
  if (
    upstream.username ||
    upstream.password ||
    upstream.search ||
    upstream.hash ||
    upstream.pathname !== '/'
  )
    return offline();
  const headers = new Headers({
    'x-studio-transport': secret,
    origin,
    'Content-Type': 'application/json',
  });
  const cookie = (request.headers.get('cookie') || '')
    .split(';')
    .filter((part) => /^\s*(?:__Secure-)?planeon-studio[.-]/.test(part))
    .join(';');
  if (cookie) headers.set('cookie', cookie);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const ip =
    origin === 'http://localhost:3001'
      ? 'local-preview'
      : request.headers.get('cf-connecting-ip') || 'unknown';
  headers.set(
    'x-studio-client',
    Array.from(
      new Uint8Array(
        await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip)),
      ),
    )
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  );
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (request.body) {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 160_000) {
          await reader.cancel();
          return new Response(null, { status: 413 });
        }
        chunks.push(value);
      }
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    const response = await fetch(new URL(url.pathname + url.search, upstream), {
      method: request.method,
      headers,
      ...(size ? { body } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(
        url.pathname.endsWith('/assistant')
          ? STUDIO_ASSISTANT_PROXY_TIMEOUT_MS
          : 20_000,
      ),
    });
    const output = new Headers({
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    for (const name of [
      'content-type',
      'content-length',
      'content-disposition',
      'retry-after',
    ]) {
      const value = response.headers.get(name);
      if (value) output.set(name, value);
    }
    for (const value of response.headers.getSetCookie())
      output.append('set-cookie', value);
    return new Response(response.body, {
      status: response.status,
      headers: output,
    });
  } catch {
    return offline();
  }
}
