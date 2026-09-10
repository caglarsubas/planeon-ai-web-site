import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { navigationCurrent } from '../lib/navigation';

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
    assert.match(source(`app/${String(file)}`), /SiteFrame/, String(file));
});

void test('navigation: a resource page retains its parent while exact destinations stay explicit', () => {
  for (const route of [
    '/blueprint',
    '/journey',
    '/evolution',
    '/explorer',
    '/roadmap',
    '/whitepaper',
  ]) {
    assert.equal(navigationCurrent(route, '/resources'), 'location');
    assert.equal(navigationCurrent(route, route), 'page');
  }
  assert.equal(navigationCurrent('/resources', '/resources'), 'page');
  assert.equal(navigationCurrent('/blueprint/5', '/blueprint'), 'location');
  assert.equal(
    navigationCurrent('/evolution/research', '/evolution'),
    'location',
  );
  assert.equal(
    navigationCurrent('/evolution/research', '/resources'),
    'location',
  );
  assert.equal(navigationCurrent('/journey', '/resources'), 'location');
  assert.equal(navigationCurrent('/about', '/resources'), undefined);
  assert.equal(navigationCurrent('/about', '/about'), 'page');
  assert.equal(navigationCurrent('/blueprints', '/blueprint'), undefined);
  assert.equal(navigationCurrent('/assessment', '/'), undefined);
  assert.equal(navigationCurrent('/', '/'), 'page');
});

void test('landmarks: every page skips past the header to one focusable main landmark', () => {
  const frame = source('components/site/SiteFrame.tsx');
  assert.match(frame, /<main id="page-content" tabIndex=\{-1\}/);
  assert.ok(frame.indexOf('<SiteHeader />') < frame.indexOf('<main'));
  assert.ok(frame.indexOf('</main>') < frame.indexOf('<SiteFooter />'));
  assert.match(source('app/layout.tsx'), /href="#page-content"/);
  assert.doesNotMatch(source('app/layout.tsx'), /id="page-content"/);
  const pages = readdirSync('app', { recursive: true })
    .map(String)
    .filter((p) => p.endsWith('page.tsx'));
  for (const page of [...pages, 'not-found.tsx']) {
    const content = source(`app/${page}`);
    assert.match(content, /<SiteFrame/);
    assert.doesNotMatch(content, /<main|<SiteHeader|<SiteFooter/);
  }
});

void test('reference states: optional views reserve space and empty filters have a recovery action', () => {
  const loading = source('components/site/ReferenceLoading.tsx');
  assert.match(loading, /@\/components\/ui\/skeleton/);
  assert.match(loading, /role="status"/);
  assert.match(
    source('components/site/ScenarioWorkbench.tsx'),
    /<ReferenceLoading/,
  );
  assert.match(
    source('components/site/MaturityAtlas.tsx'),
    /Show all 57 features/,
  );
  assert.match(
    source('app/premium.css'),
    /\.reference-loading \[data-slot='skeleton'\] \{\s*animation: none/,
  );
});

void test('consultation entry: About uses the existing server-side request flow', () => {
  const about = source('app/about/page.tsx');
  assert.match(about, /href="\/contact"/);
  assert.doesNotMatch(about, /href="mailto:/);
});

void test('SVG namespaces: reference onion markers are stable across server and client trees', () => {
  const onion = source('components/site/HarnessOnion.tsx');
  assert.doesNotMatch(onion, /useId/);
  assert.match(onion, /idPrefix: string/);
  assert.match(
    source('components/site/BlueprintOnion.tsx'),
    /idPrefix="blueprint-onion"/,
  );
  assert.match(
    source('components/site/ScenarioWorkbench.tsx'),
    /idPrefix="explorer-onion"/,
  );
  assert.match(onion, /id=\{marker\}/);
  assert.match(onion, /markerEnd=\{`url\(#\$\{marker\}\)`\}/);
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
  assert.match(chrome, /<DialogTitle id="planeon-navigation-title">/);
  assert.match(chrome, /id="planeon-navigation-trigger"/);
  assert.match(chrome, /id="planeon-navigation-dialog"/);
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
