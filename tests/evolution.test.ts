import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { changes } from '../data/operating.v1';
import {
  learningStages,
  learningStories,
  recoveryStages,
} from '../data/evolution.v1';
import { resolveEvolution } from '../lib/evolution';
import { byId } from '../lib/harness';
import { findFeature } from '../lib/aml';

void test('learning examples cover exactly the canonical change envelopes and all six stages', () => {
  assert.deepEqual(
    Object.keys(learningStories),
    changes.map((item) => item.id),
  );
  for (const change of changes) {
    const story = learningStories[change.id];
    assert.deepEqual(
      Object.keys(story.stages),
      learningStages.map((stage) => stage.id),
    );
    assert.ok(story.label && story.context && story.remains);
    assert.ok(story.before.detail && story.after.detail);
    for (const text of Object.values(story.stages)) assert.ok(text.length > 60);
    assert.ok(byId(change.target));
    for (const feature of change.features) assert.ok(findFeature(feature));
  }
});

void test('learning URLs retain every legacy change and stage selection', () => {
  for (const change of changes) {
    for (const stage of learningStages) {
      const result = resolveEvolution(
        new URLSearchParams({ change: change.id, stage: stage.id }),
      );
      assert.equal(result.change.id, change.id);
      assert.equal(result.stage.id, stage.id);
      assert.equal(result.story, learningStories[change.id]);
      assert.equal(result.branch, null);
    }
  }
  assert.deepEqual(
    learningStages.slice(1).map((item) => item.id),
    ['proposal', 'evaluation', 'authorization', 'rollout', 'monitoring'],
  );
});

void test('new visitors and invalid URLs start with the illustrative retrieval observation', () => {
  for (const query of [
    '',
    'change=invalid&stage=missing&branch=unknown',
    'change=__proto__&stage=toString&branch=constructor',
  ]) {
    const result = resolveEvolution(new URLSearchParams(query));
    assert.equal(result.change.id, 'retrieval');
    assert.equal(result.stage.id, 'observation');
    assert.equal(result.branch, null);
  }
});

void test('recovery branches retain the matching stage even in a conflicting deep link', () => {
  for (const [branch, stage] of Object.entries(recoveryStages)) {
    for (const change of changes) {
      const result = resolveEvolution(
        new URLSearchParams({ change: change.id, stage: 'proposal', branch }),
      );
      assert.equal(result.stage.id, stage);
      assert.equal(result.branch, branch);
      assert.equal(result.change.id, change.id);
    }
  }
});

void test('URL resolution is read-only and does not discard unrelated parameters', () => {
  const params = new URLSearchParams(
    'change=memory&stage=monitoring&utm_source=review&view=onion',
  );
  const before = params.toString();
  resolveEvolution(params);
  assert.equal(params.toString(), before);
});

void test('the selected example never changes the underlying harness identity or legacy route', () => {
  const expected = {
    retrieval: [15, '/blueprint/7'],
    memory: [16, '/blueprint/8'],
    tools: [11, '/blueprint/11'],
  };
  for (const change of changes) {
    const target = byId(change.target)!;
    assert.deepEqual([target.number, target.href], expected[change.id]);
  }
});

void test('learning narrative exposes research boundaries and does not manufacture assessment results', () => {
  const source = readFileSync(
    'components/site/EvolutionFlow.tsx',
    'utf8',
  ).replace(/\s+/g, ' ');
  assert.match(source, /Illustrative examples · not measured results/);
  assert.match(source, /After \/ intended, if validated/);
  assert.match(source, /design metaphor, not a claim/);
  assert.match(
    source,
    /not a claim that Planeon runs self-improving production agents/,
  );
  assert.match(source, /reference requirements, not passed controls/);
  assert.match(source, /outside the live task timeline/);
  assert.match(source, /not a seventeenth harness/);
  assert.match(source, /href="\/evolution\/research#metaphor"/);
  assert.match(source, /id="change-envelope"/);
  assert.match(source, /consultationHref/);
  assert.equal((source.match(/<h1[ >]/g) ?? []).length, 1);
});

void test('manual learning controls preserve a stable reading state and accessible selected states', () => {
  const source = readFileSync('components/site/EvolutionFlow.tsx', 'utf8');
  assert.doesNotMatch(
    source,
    /setInterval|setTimeout|requestAnimationFrame|autoPlay/,
  );
  assert.match(source, /aria-pressed/);
  assert.match(source, /aria-controls="learning-stage-detail"/);
  assert.match(source, /aria-live="polite"/);
  const css = readFileSync('app/evolution/evolution.css', 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width: 700px/);
  assert.match(
    readFileSync('components/site/SiteChrome.tsx', 'utf8'),
    /\['\/evolution', 'Learning & Evolution'\]/,
  );
});
