import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import content from '../data/content.json';
import {
  transformationPhases,
  transformationPartners,
  transformationScheduleNote,
} from '../data/transformation.v1';
import { navigationCurrent } from '../lib/navigation';

const source = (file: string) => readFileSync(file, 'utf8');

void test('transformation: the proposed year reuses phases 0–3 without gaps or new maturity levels', () => {
  assert.deepEqual(
    transformationPhases.map((stage) => stage.phase),
    [0, 1, 2, 3],
  );
  const months = transformationPhases.flatMap((stage) => {
    assert.ok(content.buildPhases.some((phase) => phase.id === stage.phase));
    assert.ok(stage.title && stage.work && stage.deliverable && stage.gate);
    return Array.from(
      { length: stage.endMonth - stage.startMonth + 1 },
      (_, index) => stage.startMonth + index,
    );
  });
  assert.deepEqual(
    months,
    Array.from({ length: 12 }, (_, index) => index + 1),
  );
  assert.match(
    transformationScheduleNote,
    /target programme, agreed after diagnosis/,
  );
  assert.match(transformationScheduleNote, /Evidence gates—not the calendar/);
});

void test('transformation: diagnosis, domain expertise, engineering and long-term improvement are explicit', () => {
  const page = source('app/transformation/page.tsx').replace(/\s+/g, ' ');
  assert.match(page, /five AML levels/);
  assert.match(page, /self-reported/);
  assert.match(page, /Professional diagnosis reviews evidence/);
  assert.match(page, /L5 is not the destination for every workflow/);
  assert.match(page, /always-improving/);
  assert.match(page, /Planeon Solution Blueprint/);
  assert.match(page, /never silently changes your production system/);
  assert.deepEqual(
    transformationPartners.map((partner) => partner.role),
    ['Domain experts', 'Forward-deployed engineers', 'Long-term partnership'],
  );
});

void test('transformation: native reading flow links to canonical detail and existing consultation', () => {
  const page = source('app/transformation/page.tsx');
  for (const id of ['diagnose', 'implementation', 'partnership']) {
    assert.ok(page.includes(`href="#${id}"`));
    assert.ok(page.includes(`id="${id}"`));
  }
  for (const route of [
    '/maturity',
    '/assessment',
    '/blueprint',
    '/evolution',
    '/assessment#professional-assessment',
  ]) {
    assert.ok(page.includes(`href="${route}"`));
  }
  assert.match(page, /href=\{`\/roadmap#phase-\$\{stage.phase\}`\}/);
  assert.match(source('app/roadmap/page.tsx'), /id=\{`phase-\$\{phase.id\}`\}/);
  assert.doesNotMatch(
    page,
    /mailto:|<form|fetch\(|useEffect|useState|setInterval/,
  );
  assert.match(page, /<SiteFrame/);
  assert.equal(page.match(/<h1>/g)?.length, 1);
  assert.match(page, /className="transformation-schedule-note"/);
});

void test('transformation: discoverable from the home, maturity, readiness, resources and shared navigation', () => {
  for (const file of [
    'app/page.tsx',
    'components/site/MaturityLevels.tsx',
    'components/site/AssessmentTool.tsx',
    'app/resources/page.tsx',
    'components/site/SiteChrome.tsx',
    'app/sitemap.ts',
  ]) {
    assert.ok(source(file).includes('/transformation'), file);
  }
  assert.equal(navigationCurrent('/transformation', '/transformation'), 'page');
  assert.equal(navigationCurrent('/transformation', '/resources'), 'location');
  assert.equal(navigationCurrent('/transformation', '/journey'), undefined);
  assert.match(source('app/layout.tsx'), /import '\.\/transformation\.css'/);
});
