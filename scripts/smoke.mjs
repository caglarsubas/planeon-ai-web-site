import assert from 'node:assert/strict';

// Read-only HTTP acceptance against a running local preview. No form POSTs.
const origin = process.argv[2] ?? 'http://localhost:3002';
const parsed = new URL(origin);
assert.ok(
  ['localhost', '127.0.0.1'].includes(parsed.hostname),
  'Smoke checks are local-only.',
);
const paths = [
  '/',
  '/blueprint',
  ...Array.from({ length: 16 }, (_, i) => `/blueprint/${i + 1}`),
  '/journey',
  '/explorer',
  '/maturity',
  '/evolution',
  '/evolution/research',
  '/assessment',
  '/roadmap',
  '/resources',
  '/about',
  '/whitepaper',
  '/privacy',
  '/terms',
];
const documents = new Map();
for (let start = 0; start < paths.length; start += 4) {
  await Promise.all(
    paths.slice(start, start + 4).map(async (path) => {
      const response = await fetch(new URL(path, origin));
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.match(html, /<h1\b/, `Missing heading: ${path}`);
      assert.doesNotMatch(
        html,
        /Application error|Internal Server Error|Invalid hook call/,
        path,
      );
      documents.set(path, html);
    }),
  );
}
const links = new Set();
const assets = new Set();
for (const html of documents.values()) {
  for (const [, asset] of html.matchAll(
    /(?:src|href)="(\/_next\/static\/[^"?]+)"/g,
  ))
    assets.add(asset);
  // Drop streamed RSC scripts; inspect only rendered native anchors.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const [, raw] of markup.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    const target = new URL(raw.replaceAll('&amp;', '&'), origin);
    if (documents.has(target.pathname)) {
      // Journey/Explorer keep legacy step/harness hashes as semantic selections.
      if (target.hash && !/^\/(journey|explorer)$/.test(target.pathname)) {
        const id = decodeURIComponent(target.hash.slice(1));
        assert.ok(
          documents.get(target.pathname).includes(`id="${id}"`),
          `Missing anchor ${raw}`,
        );
      }
    } else links.add(target.pathname);
  }
}
for (const path of assets) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `Built asset: ${path}`);
  assert.ok(
    !response.headers.get('content-type')?.includes('text/html'),
    `HTML fallback for asset ${path}`,
  );
  await response.body?.cancel();
}
for (const path of links) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `Linked resource: ${path}`);
  await response.body?.cancel();
}
for (const path of ['/blueprint/999', '/not-a-page']) {
  assert.equal((await fetch(new URL(path, origin))).status, 404, path);
}
console.log(
  `PASS: ${documents.size} pages, ${assets.size} built assets, ${links.size} linked resources, native anchors and 2 invalid routes.`,
);
