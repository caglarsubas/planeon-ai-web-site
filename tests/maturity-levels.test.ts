import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  maturityLevels,
  maturityLevelSources,
  maturityLevelsVersion,
} from '../data/maturity-levels.v1';
import {
  findMaturityLevel,
  maturityEvidenceHref,
} from '../lib/maturity-levels';
import { features } from '../lib/aml';

void test('maturity entry: exactly five ordered, named levels from the supplied decks', () => {
  assert.deepEqual(
    maturityLevels.map(({ id, name }) => [id, name]),
    [
      ['L1', 'FAQ / Search'],
      ['L2', 'Knows Me'],
      ['L3', 'Gets Things Done'],
      ['L4', 'Journey Orchestrator'],
      ['L5', 'Proactive Co-Pilot'],
    ],
  );
  assert.ok(maturityLevelsVersion);
  assert.equal(maturityLevelSources.length, 2);
  assert.ok(
    maturityLevelSources.every((source) => source.title && source.location),
  );
});

void test('level selection: absent and invalid values safely show L1', () => {
  for (const value of [
    null,
    undefined,
    '',
    'L0',
    'L6',
    'L3.6',
    'l5',
    '<script>',
  ]) {
    assert.equal(findMaturityLevel(value).id, 'L1');
  }
  for (const level of maturityLevels)
    assert.equal(findMaturityLevel(level.id), level);
});

void test('evidence links: curated examples resolve to existing families, not additional controls', () => {
  for (const level of maturityLevels) {
    assert.ok(level.capability && level.authority && level.example);
    assert.equal(level.evidence.length, 3);
    assert.equal(new Set(level.evidence.map((item) => item.feature)).size, 3);
    for (const item of level.evidence) {
      assert.ok(
        features.some((feature) => feature.id === item.feature),
        `${level.id}: ${item.feature}`,
      );
      assert.ok(item.question.endsWith('?'));
    }
  }
  assert.deepEqual(
    findMaturityLevel('L3').evidence.map((item) => item.feature),
    ['A5', 'D7', 'D8'],
  );
  assert.equal(features.length, 57);
  assert.equal(
    features.reduce((total, f) => total + 1 + f.contributors.length, 0),
    355,
  );
});

void test('authority: read-only, confirmed writes and bounded delegation remain distinct', () => {
  for (const id of ['L1', 'L2'])
    assert.match(findMaturityLevel(id).authority, /Read-only/);
  assert.match(
    findMaturityLevel('L3').authority,
    /User confirmation before writes/,
  );
  assert.match(findMaturityLevel('L4').authority, /required approvals/);
  assert.match(findMaturityLevel('L5').authority, /revocable delegation/);
  assert.match(
    findMaturityLevel('L5').authority,
    /Preventive controls, monitoring, human interruption and audit remain active/,
  );
});

void test('evidence URLs preserve reading context and focus the intended feature', () => {
  const previous = new URLSearchParams(
    'level=L1&feature=B1&harness=knowledge.memory-state&domain=B&scenario=retail-01-human&matrix=open&gate=agency',
  );
  const url = new URL(
    maturityEvidenceHref(previous, 'L3', 'A5'),
    'https://planeon.ai',
  );
  assert.equal(url.pathname, '/maturity');
  assert.equal(url.hash, '#evidence-atlas');
  assert.equal(url.searchParams.get('feature'), 'A5');
  assert.equal(url.searchParams.get('level'), 'L3');
  assert.equal(url.searchParams.get('scenario'), 'retail-01-human');
  assert.equal(url.searchParams.get('matrix'), 'open');
  assert.equal(url.searchParams.get('gate'), 'agency');
  assert.equal(url.searchParams.has('harness'), false);
  assert.equal(url.searchParams.has('domain'), false);
  assert.equal(
    previous.get('level'),
    'L1',
    'link generation must not mutate the current selection',
  );
  assert.equal(previous.get('feature'), 'B1');
  assert.equal(previous.get('domain'), 'B');
});

void test('every curated evidence link preserves its level and destination', () => {
  for (const level of maturityLevels) {
    for (const item of level.evidence) {
      const url = new URL(
        maturityEvidenceHref(new URLSearchParams(), level.id, item.feature),
        'https://planeon.ai',
      );
      assert.equal(url.searchParams.get('level'), level.id);
      assert.equal(url.searchParams.get('feature'), item.feature);
      assert.equal(url.hash, '#evidence-atlas');
    }
  }
});

void test('presentation contract: framework precedes Atlas with one shared history owner', () => {
  const read = (file: string) => readFileSync(file, 'utf8');
  const experience = read('components/site/MaturityExperience.tsx');
  assert.ok(
    experience.indexOf('<MaturityLevels') <
      experience.indexOf('<MaturityAtlas'),
  );
  assert.equal(experience.match(/= useUrlState\(/g)?.length, 1);
  const levels = read('components/site/MaturityLevels.tsx');
  assert.match(levels, /activateOnFocus=\{false\}/);
  assert.match(levels, /id=\{`maturity-tab-\$\{level.id\}`\}/);
  assert.match(levels, /id=\{`maturity-panel-\$\{level.id\}`\}/);
  assert.match(levels, /Selecting a level does not assign a score/);
  assert.match(
    levels,
    /Curated evidence examples, not a complete level checklist/,
  );
  assert.match(levels, /Jump to your selected evidence/);
  assert.doesNotMatch(levels, /setInterval|setTimeout|useUrlState/);
  const atlas = read('components/site/MaturityAtlas.tsx');
  assert.match(experience, /id="evidence-atlas"/);
  assert.match(atlas, /id="evidence-atlas-content"/);
  assert.doesNotMatch(atlas, /<h1|useUrlState/);
});
