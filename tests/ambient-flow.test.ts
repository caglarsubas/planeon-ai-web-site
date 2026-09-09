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
  easeFlowOffset,
  flowCanvasSize,
  flowOpacity,
  flowPosition,
  flowWaveOffset,
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
  assert.equal(FLOW_CYCLE_SECONDS, 20);
  for (const compact of [false, true]) {
    const dots = createFlowDots(compact);
    assert.equal(dots.length, compact ? 48 : 168);
    assert.deepEqual(dots, createFlowDots(compact));
    assert.ok(dots.filter((dot) => dot.accent).length / dots.length <= 0.14);
    for (const dot of dots) {
      assert.ok(dot.x >= 0 && dot.x < 1);
      assert.ok(dot.y >= 0.05 && dot.y <= 0.95);
      assert.ok(dot.radius >= 1.2 && dot.radius <= 3.6);
      assert.ok(dot.speed >= 0.0018 && dot.speed <= 0.004);
      assert.ok(dot.opacity >= 0.55 && dot.opacity <= 1);
      assert.ok([0, 1, 2, 3, 4, 5].includes(dot.band));
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

void test('ambient: the wave and its secondary ripple propagate left to right over 20 seconds', () => {
  for (let band = 0; band < 6; band++) {
    for (const u of [0.1, 0.3, 0.6, 0.9]) {
      const initial = flowWaveOffset(u, 0, band);
      close(flowWaveOffset(u + 0.1, 2, band), initial);
      close(flowWaveOffset(u, FLOW_CYCLE_SECONDS, band), initial);
    }
  }
});

void test('ambient: six loose ribbons retain balanced density and non-grid variation', () => {
  for (const compact of [false, true]) {
    const dots = createFlowDots(compact);
    for (let band = 0; band < 6; band++) {
      const ribbon = dots.filter((dot) => dot.band === band);
      assert.equal(ribbon.length, compact ? 8 : 28);
      const baseline = (band + 0.5) / 6;
      assert.ok(ribbon.every((dot) => Math.abs(dot.y - baseline) <= 0.013));
      assert.ok(new Set(ribbon.map((dot) => dot.y)).size > 1);
      assert.ok(ribbon[0].x < 0.13 && ribbon.at(-1)!.x > 0.87);
    }
  }
});

void test('ambient: particles drift right more slowly than the passing wave', () => {
  for (const dot of createFlowDots(false)) {
    assert.ok(dot.speed > 0 && dot.speed < 1 / FLOW_CYCLE_SECONDS);
    const before = flowPosition(dot, 1, 1400, 800);
    const after = flowPosition(dot, 1.1, 1400, 800);
    if (after.x >= before.x) close(after.x - before.x, dot.speed * 140);
  }
});

void test('ambient: wave displacement stays shallow, and cycle boundaries are continuous', () => {
  for (const height of [200, 650, 1100]) {
    for (const dot of createFlowDots(false)) {
      for (let seconds = 0; seconds <= 40; seconds += 0.5) {
        const point = flowPosition(dot, seconds, 1400, height);
        assert.ok(Math.abs(point.y - dot.y * height) <= 32 * 1.26 + 1e-9);
      }
      for (const boundary of [20, 40, 60]) {
        const before = flowPosition(dot, boundary - 0.001, 1400, height);
        const after = flowPosition(dot, boundary + 0.001, 1400, height);
        assert.ok(Math.abs(after.y - before.y) < 0.1);
      }
    }
  }
});

void test('ambient: hover enters gently, holds a local opening and settles without snapping', () => {
  const origin = { x: 0, y: 0 };
  const target = { x: 16, y: 0 };
  let offset = easeFlowOffset(origin, target, 1 / 30);
  assert.ok(offset.x > 0 && offset.x < 6);
  for (let i = 0; i < 14; i++) offset = easeFlowOffset(offset, target, 1 / 30);
  assert.ok(offset.x > 15.8 && offset.x < 16);
  const held = offset.x;
  offset = easeFlowOffset(offset, origin, 1 / 30);
  assert.ok(offset.x > 0 && offset.x < held);
  for (let i = 0; i < 14; i++) offset = easeFlowOffset(offset, origin, 1 / 30);
  assert.ok(offset.x < 0.11);
  assert.equal(offset.y, 0);
});

void test('ambient: pointer settling is time based, monotonic and independent of refresh rate', () => {
  const target = { x: 0, y: 0 };
  const results = [30, 60, 120].map((fps) => {
    let offset = { x: 12, y: -8 };
    for (let i = 0; i < fps / 2; i++) {
      const previous = Math.hypot(offset.x, offset.y);
      offset = easeFlowOffset(offset, target, 1 / fps);
      assert.ok(offset.x >= 0 && offset.y <= 0);
      assert.ok(Math.hypot(offset.x, offset.y) < previous);
    }
    return offset;
  });
  for (const offset of results) {
    close(offset.x, 12 * Math.exp(-5));
    close(offset.y, -8 * Math.exp(-5));
  }
  const held = { x: 12, y: -8 };
  assert.deepEqual(easeFlowOffset(held, target, 0), held);
  assert.deepEqual(easeFlowOffset(held, target, -1), held);
  assert.deepEqual(
    easeFlowOffset(held, target, 100),
    easeFlowOffset(held, target, 0.1),
  );
});

void test('ambient: moving or removing the pointer keeps every offset inside the 16px limit', () => {
  const dot = createFlowDots(false)[10];
  let offset = { x: 0, y: 0 };
  for (let i = 0; i < 600; i++) {
    const base = flowPosition(dot, i / 30, 1400, 800);
    const pointer =
      i < 300
        ? { x: base.x + Math.cos(i) * 4, y: base.y + Math.sin(i) * 4 }
        : null;
    const target = displaceFromPointer(base, pointer);
    offset = easeFlowOffset(
      offset,
      { x: target.x - base.x, y: target.y - base.y },
      1 / 30,
    );
    assert.ok(Math.hypot(offset.x, offset.y) <= 16);
  }
  assert.ok(Math.hypot(offset.x, offset.y) < 0.001);
});

void test('ambient: pointer departure retains offsets; static redraws cannot advance hover motion', () => {
  const paint = component.slice(
    component.indexOf('const paint ='),
    component.indexOf('const player ='),
  );
  assert.match(
    paint,
    /const delta = Math\.max\(0, seconds - lastPaintSeconds\)/,
  );
  assert.match(paint, /if \(moving\) \{[\s\S]*easeFlowOffset/);
  const leave = component.slice(
    component.indexOf('const pointerLeft ='),
    component.indexOf('const storageChanged ='),
  );
  assert.match(leave, /pointerTarget = null/);
  assert.doesNotMatch(leave, /offsets\s*=|resetPointer\(/);
  const measure = component.slice(
    component.indexOf('const measure ='),
    component.indexOf('const paletteChanged ='),
  );
  assert.match(measure, /if \(resized\) resetPointer\(\)/);
  assert.match(
    component,
    /event\.pointerType !== 'mouse'[\s\S]*pointerTarget = null/,
  );
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
