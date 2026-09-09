import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  FLOW_PREFERENCE_KEY,
  FLOW_FPS,
  FLOW_CYCLE_SECONDS,
  createFlowDots,
  createFlowPlayer,
  displaceFromPointer,
  flowCanvasSize,
  flowOpacity,
  flowPosition,
  readFlowPause,
  shouldAnimateFlow,
  type FlowState,
} from '../lib/ambient-flow';

const source = (file: string) => readFileSync(file, 'utf8');
const component = source('components/site/AmbientFlow.tsx');
const css = source('app/ambient-flow.css');
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

void test('ambient: all visibility, user and device gates must permit animation', () => {
  const keys: (keyof FlowState)[] = [
    'inView',
    'visible',
    'paused',
    'reducedMotion',
    'saveData',
    'printing',
  ];
  for (let mask = 0; mask < 64; mask++) {
    const state = Object.fromEntries(
      keys.map((key, i) => [key, Boolean(mask & (1 << i))]),
    ) as FlowState;
    assert.equal(shouldAnimateFlow(state), mask === 3);
  }
});

void test('ambient: pause preference is a separate, strictly allowlisted local value', () => {
  assert.equal(FLOW_PREFERENCE_KEY, 'planeon-background-motion');
  assert.equal(readFlowPause('paused'), true);
  for (const value of [null, '', 'on', 'false', 'PAUSED', 'dark', '<script>'])
    assert.equal(readFlowPause(value), false);
});

void test('ambient: deterministic, restrained density is reduced on small screens', () => {
  assert.equal(FLOW_FPS, 30);
  assert.equal(FLOW_CYCLE_SECONDS, 36);
  for (const compact of [false, true]) {
    const dots = createFlowDots(compact);
    assert.equal(dots.length, compact ? 32 : 84);
    assert.deepEqual(dots, createFlowDots(compact));
    assert.ok(dots.filter((dot) => dot.accent).length / dots.length <= 0.14);
    for (const dot of dots) {
      assert.ok(dot.x >= 0 && dot.x < 1);
      assert.ok(dot.y >= 0.05 && dot.y <= 0.95);
      assert.ok(dot.radius >= 1.2 && dot.radius <= 3.6);
      assert.ok(dot.speed >= 0.0018 && dot.speed <= 0.004);
      assert.ok(dot.opacity >= 0.55 && dot.opacity <= 1);
      assert.ok([-1, 0, 1].includes(dot.band));
    }
  }
});

void test('ambient: flowing positions remain finite and in bounds through long playback', () => {
  for (const [width, height] of [
    [1440, 800],
    [390, 1100],
  ]) {
    for (const dot of createFlowDots(width < 700)) {
      for (let seconds = 0; seconds <= 7200; seconds += 17) {
        const point = flowPosition(dot, seconds, width, height);
        assert.ok(point.x >= 0 && point.x < width);
        assert.ok(point.y > 0 && point.y < height);
      }
      assert.notDeepEqual(
        flowPosition(dot, 0, width, height),
        flowPosition(dot, 10, width, height),
      );
    }
  }
});

void test('ambient: loose composition gathers into streams and disperses over 36 seconds', () => {
  const dot = createFlowDots(false)[5];
  for (const seconds of [0, 18, 36]) {
    const point = flowPosition(dot, seconds, 1000, 1000);
    const u = (dot.x + seconds * dot.speed) % 1;
    const loose = dot.y + Math.sin(seconds * 0.12 + dot.phase) * 0.035;
    const stream =
      0.5 +
      dot.band * 0.23 +
      Math.sin(u * Math.PI * 1.6 + seconds * 0.035) * 0.16;
    close(
      point.y / 1000,
      loose + (stream - loose) * (seconds === 18 ? 0.76 : 0),
    );
  }
});

void test('ambient: copy, film and controls have a clear padded exclusion zone', () => {
  const rect = { left: 200, top: 150, right: 500, bottom: 450 };
  for (const radius of [1.2, 2.4, 3.6]) {
    for (const point of [
      { x: 350, y: 250 },
      { x: 200, y: 150 },
      { x: 510, y: 250 },
      { x: 300, y: 140 },
      { x: 190, y: 140 },
    ])
      assert.equal(flowOpacity(point, radius, 1000, 700, [rect]), 0);
    assert.equal(flowOpacity({ x: 650, y: 300 }, radius, 1000, 700, [rect]), 1);
    const fading = flowOpacity({ x: 534, y: 300 }, radius, 1000, 700, [rect]);
    assert.ok(fading > 0 && fading < 1);
  }
  assert.equal(
    flowOpacity({ x: 650, y: 300 }, 2, 1000, 700, [
      rect,
      { left: 600, top: 250, right: 800, bottom: 400 },
    ]),
    0,
  );
});

void test('ambient: edge fading hides wrapping and opacity never exceeds its range', () => {
  for (const point of [
    { x: 0, y: 350 },
    { x: 1000, y: 350 },
    { x: 500, y: 0 },
    { x: 500, y: 700 },
    { x: -5, y: 50 },
  ])
    assert.equal(flowOpacity(point, 2, 1000, 700, []), 0);
  close(flowOpacity({ x: 21, y: 350 }, 2, 1000, 700, []), 0.5);
  for (let x = -20; x <= 1020; x += 4) {
    const alpha = flowOpacity({ x, y: 200 }, 3.6, 1000, 700, []);
    assert.ok(alpha >= 0 && alpha <= 1);
  }
});

void test('ambient: pointer interaction is a bounded, local repulsion, not a force explosion', () => {
  const pointer = { x: 300, y: 300 };
  assert.deepEqual(displaceFromPointer(pointer, pointer), pointer);
  const distant = { x: 410, y: 300 };
  assert.deepEqual(displaceFromPointer(distant, pointer), distant);
  assert.deepEqual(displaceFromPointer(distant, null), distant);
  for (let offset = 0.01; offset < 110; offset += 0.5) {
    const original = { x: 300 + offset, y: 300 };
    const displaced = displaceFromPointer(original, pointer);
    assert.ok(displaced.x > original.x);
    assert.ok(
      Math.hypot(displaced.x - original.x, displaced.y - original.y) <= 16,
    );
    assert.equal(displaced.y, original.y);
  }
});

void test('ambient: high-DPI canvas is bounded by pixel ratio and a two-megapixel budget', () => {
  for (const [width, height] of [
    [0, 0],
    [390, 1100],
    [1440, 800],
    [7680, 4320],
  ]) {
    for (const dpr of [0, 1, 1.5, 2, 3, 4]) {
      const size = flowCanvasSize(width, height, dpr);
      assert.ok(size.width >= 1 && size.height >= 1);
      assert.ok(size.width * size.height <= 2_000_000);
      assert.ok(size.scale > 0 && size.scale <= 2);
    }
  }
});

function fakeFrames() {
  let id = 0;
  const pending = new Map<number, (now: number) => void>();
  const paints: number[] = [];
  const player = createFlowPlayer(
    (seconds) => paints.push(seconds),
    (callback) => {
      pending.set(++id, callback);
      return id;
    },
    (key) => {
      pending.delete(key);
    },
  );
  return {
    player,
    pending,
    paints,
    tick(this: void, now: number) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(now));
    },
  };
}

void test('ambient: one frame loop caps paints without accumulating duplicate callbacks', () => {
  const env = fakeFrames();
  assert.equal(env.pending.size, 0);
  env.player.setActive(true);
  env.player.setActive(true);
  assert.equal(env.pending.size, 1);
  for (const ms of [0, 16, 34, 50, 68]) {
    env.tick(ms);
    assert.equal(env.pending.size, 1);
  }
  assert.equal(env.paints.length, 3);
  env.paints.forEach((value, i) => close(value, [0, 0.034, 0.068][i]));
  env.player.dispose();
  assert.equal(env.pending.size, 0);
});

void test('ambient: pause and visibility resume from held time without a jump', () => {
  const { player, tick, paints, pending } = fakeFrames();
  player.setActive(true);
  tick(0);
  tick(40);
  player.setActive(false);
  assert.equal(pending.size, 0);
  tick(50_000);
  player.redraw();
  close(paints.at(-1)!, 0.04);
  player.setActive(true);
  tick(100_000);
  close(paints.at(-1)!, 0.04);
  tick(100_040);
  close(paints.at(-1)!, 0.08);
  player.dispose();
});

void test('ambient: static redraws never start playback and disposal releases the loop', () => {
  const { player, tick, paints, pending } = fakeFrames();
  player.redraw();
  player.redraw();
  assert.deepEqual(paints, [0, 0]);
  assert.equal(pending.size, 0);
  player.setActive(true);
  tick(0);
  tick(100_000);
  close(paints.at(-1)!, 0.08);
  player.dispose();
  const count = paints.length;
  player.redraw();
  player.setActive(true);
  tick(200_000);
  assert.equal(paints.length, count);
  assert.equal(pending.size, 0);
});

void test('ambient: disposal during a paint cannot schedule an orphan callback', () => {
  const callbacks: ((now: number) => void)[] = [];
  const player = createFlowPlayer(
    () => player.dispose(),
    (callback) => {
      callbacks.push(callback);
      return callbacks.length;
    },
    () => {},
  );
  player.setActive(true);
  callbacks[0](0);
  assert.equal(callbacks.length, 1);
});

void test('ambient: source contract keeps motion local to the opening and below clear content', () => {
  const page = source('app/page.tsx');
  assert.equal(page.match(/<AmbientFlow \/>/g)?.length, 1);
  assert.match(page, /className="business-proposition" data-flow-clear/);
  assert.ok(page.indexOf('<AmbientFlow />') < page.indexOf('<HomeFilm />'));
  for (const file of [
    'app/layout.tsx',
    'components/site/SiteFrame.tsx',
    'app/journey/page.tsx',
    'app/explorer/page.tsx',
  ])
    assert.doesNotMatch(source(file), /AmbientFlow/);
  assert.match(component, /\[data-flow-clear\], \.home-film/);
  assert.match(component, /controls,\s*\]/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /isolation: isolate/);
  assert.match(css, /@media print/);
  assert.doesNotMatch(
    component,
    /preventDefault|stopPropagation|fetch\(|document\.cookie|history\.|location\.|setInterval\(/,
  );
});

void test('ambient: accessible control supports static device preferences and both themes', () => {
  assert.match(component, /@\/components\/ui\/button/);
  assert.match(component, /id="home-ambient-flow"\s+aria-hidden="true"/);
  assert.match(component, /aria-controls="home-ambient-flow"/);
  assert.match(component, /disabled=\{!ui\.ready \|\| ui\.constrained\}/);
  for (const label of [
    'Pause background motion',
    'Resume background motion',
    'Background motion off',
  ])
    assert.ok(component.includes(label));
  assert.match(css, /min-height: 44px/);
  assert.match(css, /:focus-visible/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /event\.pointerType !== 'mouse'/);
  assert.match(component, /attributeFilter: \['data-theme'\]/);
  assert.ok(
    component.indexOf('localStorage.getItem') <
      component.indexOf('createFlowPlayer(\n'),
  );
  for (const file of ['app/globals.css', 'app/theme.css']) {
    const palette = source(file);
    for (const token of [
      '--ambient-dot-blue:',
      '--ambient-dot-teal:',
      '--ambient-dot-opacity:',
    ])
      assert.ok(palette.includes(token));
  }
  assert.match(source('app/privacy/page.tsx'), /background-motion preference/);
});

void test('ambient: observers and every event listener are released on unmount', () => {
  assert.match(component, /player\.dispose\(\)/);
  for (const name of ['observer?', 'resize?', 'theme'])
    assert.ok(component.includes(`${name}.disconnect()`));
  for (const [, owner, event, handler] of component.matchAll(
    /(\w+)(?:\?)?\.addEventListener\('([^']+)', (\w+)/g,
  )) {
    assert.ok(
      new RegExp(
        `${owner}\\??\\.removeEventListener\\('${event}', ${handler}\\)`,
      ).test(component),
      `${owner} must remove ${event} / ${handler}`,
    );
  }
  assert.match(component, /event\.storageArea !== localStorage/);
  assert.match(
    component,
    /event\.key !== FLOW_PREFERENCE_KEY && event\.key !== null/,
  );
  assert.match(component, /if \(!disposed\) measure\(\)/);
});
