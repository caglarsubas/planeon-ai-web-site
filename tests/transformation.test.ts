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
import { GET } from '../app/transformation/route';

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
  const page = source('app/services/page.tsx').replace(/\s+/g, ' ');
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
  const page = source('app/services/page.tsx');
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

void test('services: a primary destination independent of Resources', () => {
  for (const file of [
    'app/page.tsx',
    'components/site/MaturityLevels.tsx',
    'components/site/AssessmentTool.tsx',
    'components/site/SiteChrome.tsx',
    'app/sitemap.ts',
  ]) {
    assert.ok(source(file).includes('/services'), file);
  }
  assert.equal(navigationCurrent('/services', '/services'), 'page');
  assert.equal(navigationCurrent('/services', '/resources'), undefined);
  assert.equal(navigationCurrent('/services', '/journey'), undefined);
  assert.doesNotMatch(
    source('app/resources/page.tsx'),
    /\/services|\/transformation/,
  );
  const chrome = source('components/site/SiteChrome.tsx');
  assert.match(
    chrome,
    /const primaryLinks = \[[\s\S]*?\['\/services', 'Services'\]/,
  );
  assert.doesNotMatch(
    chrome.split('className="overlay-resources"')[1]?.split('</div>')[0] ?? '',
    /\/services|\/transformation/,
  );
  assert.match(
    source('app/services/page.tsx'),
    /Services \/ How Planeon can help/,
  );
  assert.match(source('app/layout.tsx'), /import '\.\/transformation\.css'/);
});

void test('services: old transformation URLs permanently redirect with query context intact', () => {
  for (const suffix of ['', '?ref=readiness&level=L3']) {
    const response = GET(
      new Request(`https://planeon.ai/transformation${suffix}`),
    );
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get('location'),
      `https://planeon.ai/services${suffix}`,
    );
  }
});
