import test from 'node:test';
import assert from 'node:assert/strict';
import { harnesses } from '../lib/harness';
import { buildScenario, scenarios } from '../lib/scenarios';
import {
  advanceMotion,
  handoffRoute,
  motionTiming,
  onionGeometry,
  pointOnRoute,
  sectorFor,
  sectorPath,
} from '../lib/journey-motion';

void test('Journey keeps sixteen named, independently selectable sectors and the Runtime boundary outside', () => {
  assert.equal(new Set(harnesses.map((h) => sectorPath(h.sourceId))).size, 16);
  for (const h of harnesses) {
    const s = sectorFor(h.sourceId);
    assert.ok(s.inner >= onionGeometry.core);
    assert.equal(s.outer - s.inner, onionGeometry.ring);
    assert.equal(s.outer === 483, h.plane === 'runtime');
  }
});
void test('All 72 variants have bounded curves; no non-model handoff enters the stationary core', () => {
  let inspected = 0;
  for (const scenario of scenarios)
    for (const frame of buildScenario(scenario)) {
      const lanes = new Map<string, number>();
      for (const step of frame.steps) {
        const { from, to } = step.message,
          pair = `${from}:${to}`,
          lane = lanes.get(pair) ?? 0;
        lanes.set(pair, lane + 1);
        const route = handoffRoute(from, to, lane);
        if (!route) {
          assert.ok(
            from === 'all' || to === 'all' || from === to,
            `${from} → ${to}`,
          );
          continue;
        }
        for (let n = 0; n <= 200; n++) {
          const p = pointOnRoute(route, n / 200);
          assert.ok(
            p.x >= 0 && p.x <= 1100 && p.y >= 0 && p.y <= 1180,
            `${scenario.id}: ${from} → ${to} outside viewport`,
          );
          if (!route.core)
            assert.ok(
              Math.hypot(p.x - 550, p.y - 600) >= onionGeometry.core + 17.8,
              `${scenario.id}: ${from} → ${to} crosses core`,
            );
        }
        inspected++;
      }
    }
  assert.ok(inspected > 2500);
});
void test('Call, response and fan-out copies have distinct directed geometry', () => {
  assert.notEqual(handoffRoute(7, 6)?.d, handoffRoute(6, 7)?.d);
  assert.notEqual(handoffRoute(7, 6, 0)?.d, handoffRoute(7, 6, 1)?.d);
  assert.notEqual(handoffRoute(7, 6, 1)?.d, handoffRoute(7, 6, 2)?.d);
});
void test('Presentation timing supplies travel plus a reading hold without changing scenario durations', () => {
  for (const scenario of scenarios)
    for (const frame of buildScenario(scenario)) {
      const before = frame.duration;
      const t = motionTiming(frame);
      assert.equal(frame.duration, before);
      assert.ok(t.hold >= 1800 && t.hold <= 6200);
      assert.equal(t.total, t.travel + t.hold);
      if (frame.steps.every((s) => s.skipped || s.branchNotTaken))
        assert.equal(t.travel, 0);
      else assert.equal(t.travel, 900);
    }
});
void test('Pause freezes elapsed time; resume and speed changes continue the same beat', () => {
  const start = { elapsed: 0, started: true, manual: false };
  const first = advanceMotion(start, 400, 0.75, true, 900, 3300);
  assert.equal(first.elapsed, 300);
  const paused = advanceMotion(first, 1000, 0.75, false, 900, 3300);
  assert.deepEqual(paused, first);
  const resumed = advanceMotion(paused, 200, 1.5, true, 900, 3300);
  assert.equal(resumed.elapsed, 600);
  assert.equal(advanceMotion(resumed, 10000, 1, true, 900, 3300).elapsed, 3300);
});
void test('A manual step animates exactly one handoff then settles without auto-advancing', () => {
  let state = { elapsed: 0, started: true, manual: true };
  state = advanceMotion(state, 600, 0.75, false, 900, 3300);
  assert.equal(state.elapsed, 450);
  assert.equal(state.manual, true);
  state = advanceMotion(state, 600, 0.75, false, 900, 3300);
  assert.equal(state.elapsed, 900);
  assert.equal(state.manual, false);
  assert.deepEqual(advanceMotion(state, 5000, 0.75, false, 900, 3300), state);
});
