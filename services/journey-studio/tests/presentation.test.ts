import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers these tests. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fixture } from './fixture';
import { recipeStageEvidence, recipeFrames } from '../../../lib/studio/frames';
import { handoffRoute } from '../../../lib/journey-motion';
import { studioFetch } from '../../../lib/studio/client';
import { STUDIO_LOCAL_PORT } from '../../../lib/studio/limits';

const source = (name: string) =>
  fs.readFileSync(new URL(`../../../${name}`, import.meta.url), 'utf8');

test('first proposals use the shared animated onion without applying; revisions remain opt-in previews', () => {
  const proposal = source('components/site/RecipeProposal.tsx');
  const designer = source('components/site/JourneyDesigner.tsx');
  const canvas = source('components/site/RecipeCanvas.tsx');
  assert.match(proposal, /inspectRevision &&/);
  assert.match(
    proposal,
    /: \(\s*<RecipeCanvas recipe=\{recipe\} active=\{active\}/,
  );
  assert.match(designer, /key=\{`proposal:\$\{proposed.signature\}`\}/);
  assert.match(designer, /setApplied\(proposed\)/);
  assert.match(
    designer,
    /active=\{params.get\('mode'\) === 'design' && !proposed\}/,
  );
  assert.match(canvas, /useState\('onion'\)/);
  assert.match(canvas, /useState\(0.75\)/);
  assert.match(canvas, /useState\(false\)/);
  assert.match(canvas, /<JourneyStage/);
  assert.match(canvas, /enabled: visible/);
  assert.match(canvas, /if \(!visible\) setPlaying\(false\)/);
});

test('proposal steps become directed custom onion routes, never canonical exchanges', () => {
  const frames = recipeFrames(fixture().recipe);
  assert.equal(frames.length, 4);
  assert.equal(frames[1].kind, 'wait');
  for (const frame of frames)
    for (const step of frame.steps) {
      assert.equal(step.canonicalId, null);
      assert.match(step.id, /^draft:/);
      const route = handoffRoute(step.message.from, step.message.to);
      assert.ok(route);
      assert.equal(route.core, false);
    }
});

test('evidence follows the selected step and harness, not a different parallel branch', () => {
  const recipe = fixture().recipe;
  recipe.steps[0].harnessIds = ['runtime.experience'];
  assert.deepEqual(recipeStageEvidence(recipe, 'receive'), []);
  assert.deepEqual(
    recipeStageEvidence(recipe, 'authorize').map((e) => e.featureId),
    ['A5'],
  );
  assert.deepEqual(
    recipeStageEvidence(recipe, 'verify').map((e) => e.featureId),
    ['D8'],
  );
  assert.deepEqual(
    recipeStageEvidence(recipe, 'verify', 'trust.security-safety').map(
      (e) => e.featureId,
    ),
    ['A5'],
  );
  assert.deepEqual(recipeStageEvidence(recipe, 'missing'), []);
});

test('file access guidance exposes all formats and verification, review, ownership and retention gates', () => {
  const guide = source('components/site/EngineeringPackGuide.tsx').replace(
    /\s+/g,
    ' ',
  );
  const designer = source('components/site/JourneyDesigner.tsx');
  assert.match(guide, /PDF/);
  assert.match(guide, /Markdown/);
  assert.match(guide, /JSON/);
  assert.match(guide, /Verify your company inbox/);
  assert.match(guide, /Caglar reviews the exact version/);
  assert.match(guide, /same verified email/);
  assert.match(guide, /90 days after submission/);
  assert.match(guide, /href="\/journey\/requests"/);
  assert.match(designer, /applied && packCurrent/);
  assert.match(designer, /href="#engineering-pack"/);
});

test('a non-JSON upstream failure becomes an actionable offline message without leaking proxy content', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('404 page not found', { status: 404 });
  try {
    await assert.rejects(
      studioFetch('/health'),
      /local Studio service is unavailable/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('the local service and dev bridge share a port that does not collide with OTLP', () => {
  assert.equal(STUDIO_LOCAL_PORT, 4320);
  assert.match(
    source('lib/studio/local-preview-plugin.ts'),
    /127.0.0.1:\$\{STUDIO_LOCAL_PORT\}/,
  );
  assert.match(
    source('services/journey-studio/src/config.ts'),
    /process.env.STUDIO_PORT \|\| STUDIO_LOCAL_PORT/,
  );
});
