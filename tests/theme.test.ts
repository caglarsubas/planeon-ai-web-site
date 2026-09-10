import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import {
  THEME_BOOTSTRAP,
  THEME_STORAGE_KEY,
  applyTheme,
  readTheme,
  resolveTheme,
  subscribeTheme,
  planePaint,
} from '../lib/theme';
import { planes } from '../lib/harness';

const source = (file: string) => readFileSync(file, 'utf8');
const css = source('app/theme.css');

function browser(stored: string | null = null, blocked = false) {
  const classes = new Set<string>();
  const writes: string[] = [];
  const root = {
    dataset: { theme: 'light' },
    classList: {
      toggle(name: string, on: boolean) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
    },
  };
  return {
    document: { documentElement: root },
    window: new EventTarget(),
    localStorage: {
      getItem(key: string) {
        assert.equal(key, THEME_STORAGE_KEY);
        if (blocked) throw new Error('Storage blocked');
        return stored;
      },
      setItem(key: string, value: string) {
        assert.equal(key, THEME_STORAGE_KEY);
        if (blocked) throw new Error('Storage blocked');
        writes.push(value);
      },
    },
    classes,
    writes,
  };
}

function withBrowser(
  run: (env: ReturnType<typeof browser>) => void,
  blocked = false,
) {
  const env = browser(null, blocked);
  const keys = ['document', 'window', 'localStorage'] as const;
  const originals = keys.map((key) =>
    Object.getOwnPropertyDescriptor(globalThis, key),
  );
  keys.forEach((key) =>
    Object.defineProperty(globalThis, key, {
      value: env[key],
      configurable: true,
    }),
  );
  try {
    run(env);
  } finally {
    keys.forEach((key, i) => {
      const original = originals[i];
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
}

void test('theme: light is the default; only an explicit dark preference is accepted', () => {
  for (const value of [null, undefined, '', 'system', 'DARK', '<script>'])
    assert.equal(resolveTheme(value), 'light');
  assert.equal(resolveTheme('dark'), 'dark');
  assert.equal(resolveTheme('light'), 'light');
  assert.equal(readTheme(), 'light');
});

void test('theme: pre-paint bootstrap restores only the allowlisted preference', () => {
  for (const value of [null, 'light', 'dark', 'unexpected']) {
    const env = browser(value);
    runInNewContext(THEME_BOOTSTRAP, env);
    assert.equal(
      env.document.documentElement.dataset.theme,
      resolveTheme(value),
    );
    assert.equal(env.classes.has('dark'), value === 'dark');
    assert.equal(env.writes.length, 0);
  }
  assert.doesNotThrow(() =>
    runInNewContext(THEME_BOOTSTRAP, browser('dark', true)),
  );
});

void test('theme: controls synchronize and persist without route or playback mutation', () => {
  withBrowser((env) => {
    let notified = 0;
    const unsubscribe = subscribeTheme(() => notified++);
    applyTheme('dark');
    assert.equal(readTheme(), 'dark');
    assert.ok(env.classes.has('dark'));
    applyTheme('light');
    assert.equal(readTheme(), 'light');
    assert.ok(!env.classes.has('dark'));
    assert.deepEqual(env.writes, ['dark', 'light']);
    assert.equal(notified, 2);
    unsubscribe();
    applyTheme('dark');
    assert.equal(notified, 2);
  });
});

void test('theme: blocked persistence does not disable the control', () => {
  withBrowser((env) => {
    applyTheme('dark');
    assert.equal(readTheme(), 'dark');
    assert.ok(env.classes.has('dark'));
    assert.deepEqual(env.writes, []);
  }, true);
});

void test('theme: cross-tab changes and clearing storage synchronize; unrelated storage is ignored', () => {
  withBrowser((env) => {
    const unsubscribe = subscribeTheme(() => {});
    const change = (
      key: string | null,
      newValue: string | null,
      storageArea: unknown = env.localStorage,
    ) =>
      env.window.dispatchEvent(
        Object.assign(new Event('storage'), { key, newValue, storageArea }),
      );
    change(THEME_STORAGE_KEY, 'dark');
    assert.equal(readTheme(), 'dark');
    change('unrelated', 'light');
    change(THEME_STORAGE_KEY, 'light', {});
    assert.equal(readTheme(), 'dark');
    change(null, null);
    assert.equal(readTheme(), 'light');
    assert.deepEqual(env.writes, []);
    unsubscribe();
    change(THEME_STORAGE_KEY, 'dark');
    assert.equal(readTheme(), 'light');
  });
});

void test('theme: every page inherits the bootstrap and accessible desktop/mobile controls', () => {
  const layout = source('app/layout.tsx');
  assert.match(layout, /import '\.\/theme\.css'/);
  assert.ok(
    layout.indexOf('__html: THEME_BOOTSTRAP') < layout.indexOf('<body>'),
  );
  assert.match(
    layout,
    /<html lang="en" data-theme="light" suppressHydrationWarning>/,
  );
  const toggle = source('components/site/ThemeToggle.tsx');
  assert.match(toggle, /@\/components\/ui\/toggle/);
  assert.match(toggle, /aria-label="Dark mode"/);
  assert.match(toggle, /pressed=\{theme === 'dark'\}/);
  assert.match(
    source('components/site/SiteChrome.tsx'),
    /<ThemeToggle labeled \/>/,
  );
  assert.match(css, /min-width: 44px/);
  assert.match(css, /height: 44px/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(
    source('lib/theme.ts'),
    /fetch\(|document\.cookie|history\.|location\.|setInterval\(/,
  );
});

void test('theme: all four plane paints adapt without changing documentary registry values', () => {
  assert.deepEqual(
    Object.values(planes).map((p) => p.color),
    ['#3E5F70', '#7B3F63', '#C6712A', '#2F7F6E'],
  );
  for (const plane of Object.keys(planes) as (keyof typeof planes)[]) {
    assert.deepEqual(planePaint(plane), {
      color: `var(--${plane})`,
      tint: `var(--${plane}-tint)`,
    });
  }
  for (const component of [
    'HarnessOnion',
    'JourneyStage',
    'JourneyMapping',
    'MaturityAtlas',
    'EvolutionFlow',
  ]) {
    const content = source(`components/site/${component}.tsx`);
    assert.match(content, /planePaint/);
    assert.doesNotMatch(content, /planes\[[^\]]+\]\.(?:color|tint)/);
  }
});

// Evaluate the actual CSS palette, including perceptual OKLCH neutral surfaces.
type RGB = [number, number, number];
const rootValues = Object.fromEntries(
  [
    ...css
      .slice(0, css.indexOf('.site-header'))
      .matchAll(/(--[\w-]+):\s*([^;]+);/g),
  ].map((m) => [m[1], m[2]]),
);
const linear = (n: number) =>
  n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
const gamma = (n: number) =>
  n <= 0.0031308 ? n * 12.92 : 1.055 * n ** (1 / 2.4) - 0.055;
function rgb(value: string): RGB {
  if (value.startsWith('var(')) return rgb(rootValues[value.slice(4, -1)]);
  if (value.startsWith('#'))
    return [1, 3, 5].map(
      (i) => parseInt(value.slice(i, i + 2), 16) / 255,
    ) as RGB;
  const match = value.match(/oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)/);
  assert.ok(match, value);
  const L = Number(match[1]) / 100,
    C = Number(match[2]),
    h = (Number(match[3]) * Math.PI) / 180;
  const a = C * Math.cos(h),
    b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(gamma) as RGB;
}
const luminance = (value: string) =>
  rgb(value)
    .map(linear)
    .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
function contrast(fg: string, bg: string) {
  const a = luminance(rootValues[fg]),
    b = luminance(rootValues[bg]);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

void test('theme: dark text, links and plane labels meet 4.5:1 on reading surfaces', () => {
  for (const fg of [
    '--ink',
    '--ink-soft',
    '--muted',
    '--faint',
    '--brand',
    '--error',
    '--runtime',
    '--trust',
    '--execution',
    '--knowledge',
  ]) {
    for (const bg of ['--paper', '--surface', '--night-raised']) {
      assert.ok(
        contrast(fg, bg) >= 4.5,
        `${fg} on ${bg}: ${contrast(fg, bg).toFixed(2)}`,
      );
    }
  }
  for (const plane of Object.keys(planes)) {
    assert.ok(contrast(`--${plane}`, `--${plane}-tint`) >= 4.5, plane);
    assert.ok(
      contrast('--ink', `--${plane}-tint`) >= 4.5,
      `${plane} detail text`,
    );
  }
  assert.ok(contrast('--on-ink', '--ink') >= 4.5);
  assert.ok(contrast('--on-ink', '--brand') >= 4.5);
});

void test('theme: focus and input boundaries meet 3:1 on dark control surfaces', () => {
  for (const bg of ['--paper', '--surface', '--night-raised']) {
    assert.ok(
      contrast('--line', bg) >= 3,
      `${bg}: ${contrast('--line', bg).toFixed(2)}`,
    );
    assert.ok(contrast('--brand', bg) >= 3);
  }
});

void test('theme: film pixels are never filtered and print restores the light palette', () => {
  assert.doesNotMatch(css, /(?:filter|backdrop-filter):/);
  assert.match(css, /\.home-film\s*\{\s*--paper: #f5f7fb/);
  const print = css.slice(css.indexOf('@media print'));
  for (const token of [
    'paper',
    'ink',
    'muted',
    'faint',
    'runtime',
    'trust',
    'execution',
    'knowledge',
  ])
    assert.match(print, new RegExp(`--${token}: #[0-9a-f]{6}`));
  assert.match(print, /color-scheme: light/);
});

void test('theme: the local-only preference is explained without changing consultation behavior', () => {
  const privacy = source('app/privacy/page.tsx');
  assert.match(privacy, /local storage/);
  assert.match(privacy, /not sent\s+to Planeon or used for tracking/);
  assert.match(privacy, /clearing this site/);
});
