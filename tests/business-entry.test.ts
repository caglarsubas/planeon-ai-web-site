import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { atlasRequested } from '../lib/maturity-disclosure';
import { enquiryCategories } from '../lib/consultation';
import { consultationHref } from '../lib/harness';
import { resourceGroups } from '../data/navigation.v1';
const source = (file: string) => readFileSync(file, 'utf8');

void test('business entrance: five sections, persistent offer and direct enquiry before the film', () => {
  const home = source('app/page.tsx').replace(/\s+/g, ' ');
  assert.equal(home.match(/<section\b/g)?.length, 5);
  assert.match(home, /Turn AI pilots into reliable business workflows\./);
  assert.match(home, /Your enterprise transformation partner/);
  assert.ok(home.indexOf('href="/contact"') < home.indexOf('<HomeFilm />'));
  assert.match(home, /Explore our services/);
  for (const id of [
    'home-introduction',
    'exchange-title',
    'engine-title',
    'reader-title',
  ]) {
    assert.ok(home.includes(`id="${id}"`));
  }
  assert.doesNotMatch(
    home,
    /<AnimatedArchitecture|<OpsComparison|className="dot-field"/,
  );
  assert.match(home, /Illustrative workflow · not a customer result/);
  assert.match(
    home,
    /not completed assessments or proof of deployed capabilities/,
  );
  assert.equal(home.match(/Example deliverable/g)?.length, 3);
  const unexpanded = home.replace(/<details>[\s\S]*?<\/details>/g, '');
  const prose = [...unexpanded.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, ' '))
    .join(' ');
  const words = prose.trim().split(/\s+/).length;
  assert.ok(
    words >= 350 && words <= 450,
    `Homepage introductory prose: ${words} words`,
  );
});

void test('navigation: four primary destinations and technical references within two actions', () => {
  const primary = source('components/site/SiteChrome.tsx')
    .split('const primaryLinks = [')[1]
    .split('] as const')[0];
  assert.deepEqual(
    [...primary.matchAll(/\['([^']+)', '([^']+)'\]/g)].map((m) => [m[1], m[2]]),
    [
      ['/services', 'Services'],
      ['/maturity', 'Maturity'],
      ['/resources', 'Resources'],
      ['/about', 'About'],
    ],
  );
  assert.deepEqual(
    resourceGroups.map((g) => g.title),
    [
      'Understand the system',
      'Inspect the implementation',
      'Read the research',
    ],
  );
  assert.deepEqual(
    resourceGroups.flatMap((g) => g.links.map(([href]) => href)),
    [
      '/blueprint',
      '/journey',
      '/evolution',
      '/explorer',
      '/roadmap',
      '/evolution/research',
      '/whitepaper',
    ],
  );
  assert.match(source('app/resources/page.tsx'), /resourceGroups\.map/);
});

void test('maturity disclosure: levels stay first; specialist deep links always reveal the Atlas', () => {
  for (const query of ['', 'level=L3', 'level=invalid', 'atlas=invalid']) {
    assert.equal(atlasRequested(new URLSearchParams(query)), false, query);
  }
  for (const query of [
    'atlas=open',
    'feature=A5',
    'feature=invalid',
    'harness=trust.security',
    'domain=D',
    'matrix=open',
    'gate=agency',
  ]) {
    assert.equal(atlasRequested(new URLSearchParams(query)), true, query);
  }
  assert.equal(atlasRequested(new URLSearchParams(), '#evidence-atlas'), true);
  assert.equal(
    atlasRequested(new URLSearchParams(), '#evidence-atlas-title'),
    true,
  );
  assert.equal(atlasRequested(new URLSearchParams(), '#unrelated'), false);
  const component = source('components/site/MaturityExperience.tsx');
  assert.match(component, /lazy\(/);
  assert.match(component, /atlasRequested\(params, hash\)/);
  assert.match(component, /id="evidence-atlas"/);
  assert.match(component, /<MaturityAtlas params=\{params\} update=\{update\}/);
});

void test('consultation: one shared form, optional timeframe, reviewed context and legacy anchor', () => {
  assert.deepEqual(
    enquiryCategories.map((c) => c.label),
    [
      'Workflow consultation',
      'Assessment and roadmap',
      'Phased implementation',
      'Continuing partnership',
    ],
  );
  const form = source('components/site/ConsultationForm.tsx');
  assert.match(form, /fetch\('\/api\/consultation'/);
  assert.match(form, /defaultValue="Exploring options"/);
  assert.match(form, /Preferred timeframe \(optional\)/);
  for (const name of ['name', 'email', 'organisation', 'brief', 'consent']) {
    assert.match(form, new RegExp(`name="${name}"[^>]*required`));
  }
  assert.match(form, /appendReviewedContext\(brief, context\)/);
  assert.match(form, /respond by email/);
  assert.doesNotMatch(form, /mailto:|localStorage|sessionStorage/);
  for (const file of [
    'app/contact/page.tsx',
    'components/site/AssessmentTool.tsx',
  ]) {
    assert.match(source(file), /<ConsultationForm/);
    assert.doesNotMatch(source(file), /fetch\(|<textarea/);
  }
  assert.match(
    source('components/site/AssessmentTool.tsx'),
    /id="professional-assessment"/,
  );
  assert.match(
    source('components/site/AssessmentTool.tsx'),
    /Optional: explore the illustrative cost calculator/,
  );
  const href = new URL(
    consultationHref({ feature: 'A5', scenario: 'retail-address-human' }),
    'https://planeon.ai',
  );
  assert.equal(href.pathname, '/contact');
  assert.equal(href.searchParams.get('feature'), 'A5');
  assert.equal(href.searchParams.get('scenario'), 'retail-address-human');
});

void test('technical depth: canonical exchanges and named animation have a reachable home', () => {
  assert.match(source('app/journey/page.tsx'), /<CanonicalExchanges/);
  assert.match(
    source('components/site/CanonicalExchanges.tsx'),
    /\/journey#step-/,
  );
  assert.match(source('app/blueprint/page.tsx'), /<AnimatedArchitecture/);
  assert.match(source('app/blueprint/page.tsx'), /<OpsComparison/);
  assert.match(
    source('components/site/EvolutionFlow.tsx'),
    /<ReferenceDisclosure\s+id="change-envelope"/,
  );
  const flow = source('components/site/EvolutionFlow.tsx');
  assert.ok(
    flow.indexOf('This is a reference design') >
      flow.indexOf('</ReferenceDisclosure>'),
    'essential qualification remains visible',
  );
  assert.match(
    source('components/site/ReferenceDisclosure.tsx'),
    /ref\.current\.open = true/,
  );
});
