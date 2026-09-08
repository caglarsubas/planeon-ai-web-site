import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { features, relation } from '../lib/aml';
import { harnesses, byId } from '../lib/harness';
import {
  scenarios,
  industries,
  findScenario,
  buildScenario,
  resolveFrame,
} from '../lib/scenarios';
import {
  occurrenceHarnesses,
  playgroundMapping,
  playgroundAtlasHref,
} from '../lib/playground';
import { navigationCurrent } from '../lib/navigation';
import { atlasRequested } from '../lib/maturity-disclosure';
import { resourceGroups } from '../data/navigation.v1';

const source = (path: string) => readFileSync(path, 'utf8');
const frames = buildScenario(findScenario());
const step = (n: number) => {
  const frame = frames.find((f) => f.steps.some((s) => s.message.n === n))!;
  return { frame, active: frame.steps.find((s) => s.message.n === n)! };
};

void test('playground: a dedicated native page reuses the existing scenario clock and animation', () => {
  const page = source('app/playground/page.tsx');
  assert.match(page, /title: 'Playground'/);
  assert.match(page, /<ScenarioWorkbench playground/);
  assert.doesNotMatch(page, /iframe|dangerouslySetInnerHTML/);
  const workbench = source('components/site/ScenarioWorkbench.tsx');
  assert.match(workbench, /useJourneyClock/);
  assert.match(workbench, /useState\(false\)/);
  assert.match(workbench, /: 0\.75/);
  assert.match(workbench, /detailPanel=/);
  assert.match(workbench, /import\('\.\/PlaygroundMapping'\)/);
  assert.equal(scenarios.length, 72);
  assert.equal(industries.length, 9);
  assert.equal(new Set(scenarios.map((s) => s.pair)).size, 36);
});

void test('playground: every occurrence in all 72 variants resolves only declared, unique harness relationships', () => {
  for (const scenario of scenarios) {
    for (const frame of buildScenario(scenario)) {
      for (const active of frame.steps) {
        const context = playgroundMapping(frame, active);
        const ids = context.involved.map((h) => h.id);
        assert.equal(ids.length, new Set(ids).size);
        assert.ok(ids.every((id) => byId(id)));
        assert.equal(
          context.omitted,
          Boolean(active.skipped || active.branchNotTaken),
        );
        for (const row of context.rows) {
          assert.equal(row.role, relation(row.feature, context.harness!.id));
          assert.notEqual(row.role, null);
        }
        assert.equal(
          context.rows.length,
          new Set(context.rows.map((r) => r.feature.id)).size,
        );
        if (context.selected)
          assert.ok(context.rows.includes(context.selected));
      }
    }
  }
});

void test('playground: the default human request follows its receiving Interaction harness', () => {
  const { frame, active } = step(1);
  const context = playgroundMapping(frame, active);
  assert.equal(context.harness?.id, 'runtime.experience');
  assert.equal(context.pinned, false);
  assert.equal(context.onStage, true);
  assert.equal(context.omitted, false);
  assert.equal(occurrenceHarnesses(active).length, 1);
});

void test('playground: core crossings keep Model as a harness and never create a seventeenth identity', () => {
  for (const n of [16, 17]) {
    const { frame, active } = step(n);
    const context = playgroundMapping(frame, active);
    assert.equal(context.harness?.id, 'runtime.model-inference');
    assert.equal(context.endpoints.length, 1);
    assert.ok(!context.involved.some((h) => String(h.id) === 'core'));
  }
});

void test('playground: all 57 features and 355 relationships remain available without duplicating primary accountability', () => {
  let primary = 0,
    count = 0;
  const allFeatures = new Set<string>();
  for (const harness of harnesses) {
    const context = playgroundMapping(
      frames[0],
      frames[0].steps[0],
      harness.id,
    );
    assert.equal(context.harness?.id, harness.id);
    assert.ok(context.rows.length);
    count += context.rows.length;
    primary += context.rows.filter((r) => r.role === 'primary').length;
    context.rows.forEach((r) => allFeatures.add(r.feature.id));
  }
  assert.equal(count, 355);
  assert.equal(primary, 57);
  assert.equal(allFeatures.size, 57);
});

void test('playground: approval, transactional integrity and verified outcomes suggest exact existing references', () => {
  for (const [n, id] of [
    [19, 'A5'],
    [20, 'A5'],
    [23, 'D7'],
    [29, 'D7'],
    [30, 'D8'],
    [31, 'D8'],
  ] as const) {
    const { frame, active } = step(n);
    assert.equal(playgroundMapping(frame, active).selected?.feature.id, id);
  }
});

void test('playground: omitted and untaken paths do not claim active harnesses', () => {
  for (const n of [22, 24, 25]) {
    const { frame, active } = step(n);
    const context = playgroundMapping(frame, active);
    assert.equal(context.omitted, true);
    if (n === 22) {
      assert.equal(context.involved.length, 0);
      assert.equal(context.onStage, false);
    } else {
      // A skipped sandbox can share a frame with a running classical-ML call.
      // Preserve the running sibling instead of dimming the entire frame.
      const expected = new Set(
        frame.steps
          .filter((s) => !s.skipped && !s.branchNotTaken)
          .flatMap(occurrenceHarnesses)
          .map((h) => h.id),
      );
      assert.deepEqual(new Set(context.involved.map((h) => h.id)), expected);
      assert.equal(context.onStage, expected.has(context.harness!.id));
    }
    assert.ok(context.rows.length, 'reference inspection remains available');
  }
});

void test('playground: parallel work, repeated passes and separate clocks retain occurrence identity', () => {
  const seen = new Set<string>();
  for (const scenario of scenarios) {
    const timeline = buildScenario(scenario);
    for (const frame of timeline) {
      if (frame.steps.length > 1) seen.add('parallel');
      if (frame.pass > 1) seen.add('repeat');
      seen.add(frame.clock);
      for (const active of frame.steps) {
        const resolved = resolveFrame(timeline, active.id);
        assert.equal(timeline[resolved].id, frame.id);
        const context = playgroundMapping(frame, active);
        assert.ok(
          context.involved.every((h) =>
            frame.steps.some(
              (s) =>
                !s.skipped &&
                !s.branchNotTaken &&
                occurrenceHarnesses(s).some((p) => p.id === h.id),
            ),
          ),
        );
      }
    }
  }
  for (const kind of ['parallel', 'repeat', 'task', 'continuous', 'offline'])
    assert.ok(seen.has(kind));
  const continuous = step(38);
  assert.equal(
    playgroundMapping(continuous.frame, continuous.active).involved.length,
    3,
  );
  const allStep = {
    ...continuous.active,
    message: { ...continuous.active.message, from: 'all' },
  };
  assert.equal(occurrenceHarnesses(allStep).length, 16);
});

void test('playground: explicit inspection is held, invalid and unrelated selections fall back safely', () => {
  const first = frames[0];
  const held = playgroundMapping(
    first,
    first.steps[0],
    'trust.security-safety',
    'A5',
  );
  assert.equal(held.pinned, true);
  assert.equal(held.onStage, false);
  assert.equal(held.selected?.feature.id, 'A5');
  const fallback = playgroundMapping(
    first,
    first.steps[0],
    'invalid-harness',
    'invalid-feature',
  );
  assert.equal(fallback.pinned, false);
  assert.equal(fallback.harness?.id, 'runtime.experience');
  const unrelated = features.find(
    (f) => relation(f, fallback.harness!.id) === null,
  )!;
  assert.notEqual(
    playgroundMapping(first, first.steps[0], fallback.harness?.id, unrelated.id)
      .selected?.feature.id,
    unrelated.id,
  );
});

void test('playground: Atlas links preserve scenario, occurrence, feature and harness context', () => {
  const context = {
    scenario: 'retail-address-human',
    occurrence: frames[0].steps[0].id,
    feature: 'A5',
    harness: 'trust.security-safety',
  };
  const url = new URL(playgroundAtlasHref(context), 'https://planeon.ai');
  assert.equal(url.pathname, '/maturity');
  for (const [key, value] of Object.entries(context))
    assert.equal(url.searchParams.get(key), value);
  assert.equal(url.hash, '#expected-evidence');
  assert.equal(atlasRequested(url.searchParams, url.hash), true);
});

void test('playground: resource navigation preserves the four primary destinations and existing technical routes', () => {
  assert.equal(
    resourceGroups.reduce(
      (count, group) =>
        count + group.links.filter(([url]) => url === '/playground').length,
      0,
    ),
    1,
  );
  assert.equal(navigationCurrent('/playground', '/resources'), 'location');
  assert.equal(navigationCurrent('/playground', '/playground'), 'page');
  assert.match(
    source('components/site/SiteChrome.tsx'),
    /\['\/playground', 'Playground'\]/,
  );
  assert.match(source('app/sitemap.ts'), /'\/playground'/);
});

void test('playground: reading is pausable and accessible without hover or a maturity score', () => {
  const panel = source('components/site/PlaygroundMapping.tsx');
  assert.match(
    panel,
    /not assessed capabilities or passed controls|not assessed|not inferred as/,
  );
  assert.match(panel, /reference responsibilities/);
  assert.match(panel, /onFocusCapture={onPause}/);
  assert.match(panel, /if \(event.currentTarget.open\) onPause\(\)/);
  assert.match(panel, /feature.acceptance_evidence/);
  assert.doesNotMatch(
    panel,
    /aml_implementation_for_this_analysis|ASSUMED_COMPLETE|<progress|role="progressbar"/,
  );
  assert.match(
    source('app/playground/playground.css'),
    /prefers-reduced-motion: reduce/,
  );
  assert.match(source('components/site/JourneyStage.tsx'), /media.matches/);
});
