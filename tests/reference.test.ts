import test from 'node:test';
import assert from 'node:assert/strict';
import { harnesses, bySource, ringOrder } from '../lib/harness';
import {
  features,
  featuresForHarness,
  findFeature,
  relation,
  releaseGates,
} from '../lib/aml';
import {
  scenarios,
  buildScenario,
  findScenario,
  resolveFrame,
} from '../lib/scenarios';
import {
  reviewedContext,
  appendReviewedContext,
} from '../lib/consultation-context';
import {
  releaseArtifacts,
  adaptationBoundaries,
  changes,
} from '../data/operating.v1';
import { catalogue, metrics, analogies, patterns } from '../data/research.v1';
import selectionIndex from '../data/reference/selection-index.v1.json';

void test('16 identities, display numbers and legacy routes remain bijective', () => {
  assert.equal(harnesses.length, 16);
  for (const key of ['id', 'number', 'sourceId', 'href'] as const)
    assert.equal(new Set(harnesses.map((h) => h[key])).size, 16);
  assert.deepEqual(
    harnesses.map((h) => h.number),
    Array.from({ length: 16 }, (_, i) => i + 1),
  );
  assert.equal(bySource(5)?.shortName, 'Domain');
  assert.equal(bySource(13)?.number, 5);
  assert.equal(ringOrder.at(-1), 'runtime');
  assert.equal(ringOrder[0], 'knowledge');
  for (const plane of ['runtime', 'trust', 'execution', 'knowledge'])
    assert.equal(harnesses.filter((h) => h.plane === plane).length, 4);
});
void test('57 families and all 355 relationships are valid and unique', () => {
  assert.equal(features.length, 57);
  assert.equal(new Set(features.map((f) => f.id)).size, 57);
  const edges: string[] = [];
  const ids = new Set(harnesses.map((h) => h.id as string));
  for (const f of features) {
    assert.ok(ids.has(f.primary_accountable_harness));
    edges.push(`${f.id}:${f.primary_accountable_harness}`);
    for (const c of f.contributors) {
      assert.ok(ids.has(c.harness_id));
      assert.notEqual(c.harness_id, f.primary_accountable_harness);
      edges.push(`${f.id}:${c.harness_id}`);
    }
    assert.ok(f.acceptance_evidence.length > 20);
    assert.ok(f.obligations.length);
  }
  assert.equal(edges.length, 355);
  assert.equal(new Set(edges).size, 355);
  assert.deepEqual(
    ['A', 'B', 'C', 'D', 'E', 'F'].map(
      (d) => features.filter((f) => f.aml_domain === d).length,
    ),
    [13, 9, 8, 8, 8, 11],
  );
});
void test('primary/contributor lookup never duplicates a feature or turns a relation into a score', () => {
  for (const h of harnesses) {
    const list = featuresForHarness(h.id);
    assert.equal(list.length, new Set(list.map((f) => f.id)).size);
    for (const f of list)
      assert.ok(['primary', 'contributor'].includes(relation(f, h.id)!));
  }
  assert.equal(
    findFeature('A5').primary_accountable_harness,
    'trust.security-safety',
  );
  assert.equal(
    findFeature('D7').primary_accountable_harness,
    'execution.tool-skill-sandbox',
  );
  assert.equal(
    findFeature('D8').primary_accountable_harness,
    'execution.tool-skill-sandbox',
  );
  for (const g of releaseGates)
    for (const id of g.features) assert.ok(features.some((f) => f.id === id));
});
void test('72 variants form 36 human/agent pairs in nine industries', () => {
  assert.equal(scenarios.length, 72);
  assert.equal(new Set(scenarios.map((s) => s.industry)).size, 9);
  const pairs = [...new Set(scenarios.map((s) => s.pair))];
  assert.equal(pairs.length, 36);
  for (const pair of pairs)
    assert.deepEqual(
      scenarios
        .filter((s) => s.pair === pair)
        .map((s) => s.initiated)
        .sort(),
      ['agent', 'human'],
    );
});
for (const sc of scenarios)
  void test(`scenario integrity: ${sc.id}`, () => {
    assert.equal(sc.stories.length, 43);
    const frames = buildScenario(sc),
      steps = frames.flatMap((f) => f.steps);
    assert.deepEqual(frames, buildScenario(sc));
    assert.equal(steps.length, new Set(steps.map((s) => s.id)).size);
    for (let n = 1; n <= 43; n++)
      assert.ok(steps.some((s) => s.canonicalId === `m${n}`));
    for (const frame of frames) {
      assert.equal(
        frame.duration,
        Math.max(...frame.steps.map((s) => s.duration)),
      );
      for (const step of frame.steps) {
        assert.ok(step.message.label && step.message.contract && step.story);
        assert.equal(step.start, frame.start);
        if (step.skipped || step.branchNotTaken) assert.equal(step.duration, 0);
        if (step.canonicalId === 'm38' || step.canonicalId === 'm43')
          assert.equal(step.clock, 'continuous');
        if (['m39', 'm40', 'm41', 'm42'].includes(step.canonicalId ?? ''))
          assert.equal(step.clock, 'offline');
      }
    }
    const live = frames.filter((f) => f.clock === 'task');
    for (let i = 1; i < live.length; i++)
      assert.equal(live[i].start, live[i - 1].start + live[i - 1].duration);
    if (sc.path?.clarify)
      assert.equal(
        steps.filter((s) => s.message.key?.startsWith('x')).length,
        4,
      );
    if (sc.intent)
      assert.equal(
        steps.filter((s) => s.message.key?.startsWith('i')).length,
        2,
      );
    if ((sc.path?.passes ?? 1) > 1)
      assert.ok(steps.some((s) => s.pass === 2 && s.canonicalId === 'm32'));
    for (const [n, targets] of Object.entries(sc.path?.fanout ?? {}))
      assert.equal(
        steps.filter((s) => s.pass === 1 && s.canonicalId === `m${n}`).length,
        targets.length,
      );
  });
void test('a repeated pass does not implicitly confer unattended authority', () => {
  const base = findScenario('retail-address-human');
  const frames = buildScenario({
    ...base,
    path: { ...base.path, passes: 2 },
    pass2: undefined,
  });
  const second = frames
    .flatMap((f) => f.steps)
    .find((s) => s.pass === 2 && s.canonicalId === 'm22')!;
  assert.ok(second.branchNotTaken);
  assert.equal(second.duration, 0);
});
void test('legacy anchors, occurrence links and invalid selections resolve deterministically', () => {
  const frames = buildScenario(findScenario(null));
  assert.equal(findScenario('unknown').id, 'retail-address-human');
  assert.equal(findFeature('unknown').id, 'A5');
  for (let n = 1; n <= 43; n++)
    assert.ok(
      frames[resolveFrame(frames, null, `#step-${n}`)].steps.some(
        (s) => s.canonicalId === `m${n}`,
      ),
    );
  for (let i = 0; i < frames.length; i++)
    assert.equal(resolveFrame(frames, frames[i].steps[0].id), i);
  assert.equal(resolveFrame(frames, 'missing', '#step-999'), 0);
});
void test('release and adaptation links point to declared identities and features', () => {
  for (const h of harnesses) assert.ok(adaptationBoundaries[h.id]);
  assert.equal(releaseArtifacts.length, 9);
  for (const a of releaseArtifacts)
    assert.ok(harnesses.some((h) => h.id === a.owner));
  for (const c of changes) {
    assert.ok(releaseArtifacts.some((a) => a.id === c.artifact));
    for (const id of c.features) assert.ok(features.some((f) => f.id === id));
  }
});
void test('consultation context is allowlisted, reviewed, additive and bounded', () => {
  assert.deepEqual(
    reviewedContext(
      new URLSearchParams('scenario=invalid&harness=invalid&feature=invalid'),
    ),
    [],
  );
  const context = reviewedContext(
    new URLSearchParams(
      'scenario=retail-address-human&harness=trust.security-safety&feature=A5',
    ),
  );
  assert.equal(context.length, 3);
  const brief = appendReviewedContext('My workflow', context)!;
  assert.ok(brief.startsWith('My workflow'));
  assert.equal(appendReviewedContext(brief, context), brief);
  assert.equal(appendReviewedContext('x'.repeat(1200), context), null);
});
void test('small consultation index matches the complete source modules', () => {
  assert.deepEqual(
    selectionIndex.scenarios,
    scenarios.map(({ id, title, initiated }) => ({ id, title, initiated })),
  );
  assert.deepEqual(
    selectionIndex.features,
    features.map(({ id, name }) => ({ id, name })),
  );
});
void test('curated research remains a linked reference, not a hosted paper corpus', () => {
  assert.equal(catalogue.length, 35);
  assert.equal(new Set(catalogue.map((entry) => entry[2])).size, 35);
  assert.ok(catalogue.every((entry) => entry[2].startsWith('https://')));
  assert.equal(metrics.length, 14);
  assert.equal(analogies.length, 8);
  assert.equal(patterns.length, 11);
});
