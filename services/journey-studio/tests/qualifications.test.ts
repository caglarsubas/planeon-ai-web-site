import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers these tests. */
import assert from 'node:assert/strict';
import { fixture } from './fixture';
import {
  guardProposedBrief,
  preserveBriefQualifications,
} from '../src/inference-qualifications';

test('model cannot promote its claims to supplied facts or erase existing qualifications', () => {
  const brief = fixture().brief;
  brief.facts = ['Confirmed read-only storage.'];
  brief.assumptions = ['Simulated daily index refresh.'];
  brief.unknowns = ['Jurisdiction remains unconfirmed.'];
  const proposed = {
    ...brief,
    facts: ['Existing authentication is deployed.'],
    assumptions: [],
    unknowns: [],
  };
  const guarded = guardProposedBrief(brief, proposed);
  assert.deepEqual(guarded.facts, brief.facts);
  assert.deepEqual(guarded.assumptions, [
    ...brief.assumptions,
    ...proposed.facts,
  ]);
  assert.deepEqual(guarded.unknowns, brief.unknowns);
  assert.deepEqual(proposed.facts, ['Existing authentication is deployed.']);
  const recipe = fixture().recipe;
  recipe.assumptions = [];
  recipe.openQuestions = [];
  const retained = preserveBriefQualifications(brief, recipe);
  assert.deepEqual(retained.assumptions, brief.assumptions);
  assert.deepEqual(retained.openQuestions, brief.unknowns);
});
test('qualification overflow fails closed rather than truncating caveats', () => {
  const brief = fixture().brief;
  brief.assumptions = Array.from(
    { length: 20 },
    (_, i) => `Prior condition ${i}.`,
  );
  const proposed = { ...brief, facts: ['Extra claim.'] };
  assert.throws(() => guardProposedBrief(brief, proposed));
});
