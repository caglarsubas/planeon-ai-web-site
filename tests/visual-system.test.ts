import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const source = (file: string) => readFileSync(path.resolve(file), 'utf8');

void test('visual contract: self-hosted typography and shared theme cover every page', () => {
  assert.match(source('app/layout.tsx'), /import '\.\/premium\.css'/);
  const styles = [
    'app/globals.css',
    'app/reference.css',
    'app/journey.css',
    'app/premium.css',
  ]
    .map(source)
    .join('\n');
  assert.doesNotMatch(
    styles,
    /font(?:-family)?:[^;{}]*\b(?:Inter|Arial|Roboto|Helvetica|Open Sans)\b/,
  );
  assert.match(styles, /url\('\/fonts\/geist-variable\.woff2'\)/);
  assert.equal(
    readFileSync('public/fonts/geist-variable.woff2').subarray(0, 4).toString(),
    'wOF2',
  );
  assert.match(source('public/fonts/geist-OFL.txt'), /SIL OPEN FONT LICENSE/);
  const pages = readdirSync('app', { recursive: true }).filter((p) =>
    String(p).endsWith('page.tsx'),
  );
  for (const file of pages)
    assert.match(source(`app/${String(file)}`), /SiteHeader/, String(file));
});

void test('visual contract: navigation uses the existing accessible dialog and retained destinations', () => {
  const chrome = source('components/site/SiteChrome.tsx');
  assert.match(chrome, /@\/components\/ui\/dialog/);
  for (const route of [
    'blueprint',
    'journey',
    'maturity',
    'evolution',
    'resources',
    'assessment',
  ])
    assert.ok(chrome.includes(`/${route}`));
  assert.match(chrome, /aria-label="Open navigation"/);
  assert.match(chrome, /aria-label="Close navigation"/);
  assert.match(chrome, /<DialogTitle>/);
  assert.match(
    source('components/site/VisualPrimitives.tsx'),
    /className="surface-core"/,
  );
  assert.match(
    source('components/site/VisualPrimitives.tsx'),
    /className="arrow-island" aria-hidden="true"/,
  );
});

void test('visual contract: reveals are progressive, reduced-motion aware and exclude live workbenches', () => {
  const motion = source('components/site/PageMotion.tsx');
  assert.match(motion, /IntersectionObserver/);
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(motion, /not\(\.scenario-workbench\)/);
  assert.match(motion, /removeAttribute\('data-reveal'\)/);
  assert.doesNotMatch(motion, /addEventListener\(['"]scroll['"]/);
  assert.doesNotMatch(source('app/layout.tsx'), /data-reveal=['"]pending/);
  const css = source('app/premium.css');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media print/);
  assert.match(css, /:focus-within/);
});
