import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers these tests. */
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ClarificationQuestions } from '../../../components/site/ClarificationQuestions';
import { briefSchema, emptyBrief } from '../../../lib/studio/contract';
import {
  createClarifications,
  reviewClarifications,
  clarificationText,
} from '../../../lib/studio/clarification';
import {
  guardProposedBrief,
  preserveBriefQualifications,
} from '../src/inference-qualifications';
import { packSections } from '../src/documents';
import { fixture } from './fixture';

const questions = [
  'Should preferences persist across all notebooks?',
  'Should the preference store the command syntax or the data source?',
  'What happens when an in-session choice conflicts with the saved preference?',
  'What is the fallback if a visitor declines to save a preference?',
  'How is the fallback triggered?',
];
export function clarificationFixture() {
  const clarifications = createClarifications(questions);
  const answers = [
    'Across all notebooks, with per-notebook customisation allowed.',
    'Preferences only, not the data source.',
    'Use the in-session choice, then ask whether to update the global preference.',
    'An LLM-generated template is the fallback.',
  ];
  answers.forEach((answer, i) =>
    Object.assign(clarifications[i], { answer, status: 'answered' }),
  );
  clarifications[4].status = 'deferred';
  return {
    ...emptyBrief(
      'Save visualisation preferences when a visitor requests a chart in a notebook.',
    ),
    clarifications,
  };
}

test('matched answers survive partial submissions, history loss, edits and deliberate deferral', () => {
  const initial = {
    ...emptyBrief('Notebook visualisation preferences.'),
    clarifications: createClarifications(questions),
  };
  assert.equal(reviewClarifications(initial).questions.length, 5);
  initial.clarifications[0] = {
    ...initial.clarifications[0],
    answer: 'Across all notebooks.',
    status: 'answered',
  };
  assert.deepEqual(reviewClarifications(initial).questions, questions.slice(1));
  const complete = clarificationFixture();
  for (let i = 0; i < 4; i++) {
    const turn = reviewClarifications(complete);
    assert.deepEqual(turn.questions, []);
    assert.equal(turn.recipe, null);
    assert.equal(turn.brief, null);
  }
  complete.clarifications[1].answer =
    'Command preferences only; never cache the data source.';
  assert.equal(complete.clarifications[1].id, 'q2');
  assert.equal(complete.clarifications[1].question, questions[1]);
  assert.deepEqual(reviewClarifications(complete).questions, []);
  assert.match(
    JSON.stringify(briefSchema.parse(complete)),
    /Command preferences only/,
  );
});

test('question identities and limits validate, and old briefs remain byte-compatible', () => {
  const oldBrief = emptyBrief('Old signed brief.');
  assert.deepEqual(briefSchema.parse(oldBrief), oldBrief);
  const brief = clarificationFixture();
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [...brief.clarifications, brief.clarifications[0]],
    }),
  );
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [brief.clarifications[0], brief.clarifications[0]],
    }),
  );
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [{ ...brief.clarifications[0], answer: '' }],
    }),
  );
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [
        { ...brief.clarifications[0], answer: 'x'.repeat(1201) },
      ],
    }),
  );
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [{ ...brief.clarifications[0], status: 'unanswered' }],
    }),
  );
  assert.equal(
    createClarifications(['**Who approves?**', 'Who approves?']).length,
    1,
  );
});

test('model brief rewrites cannot invent or replace visitor answers; qualification and pack text preserve them', () => {
  const brief = clarificationFixture();
  brief.clarifications[3].status = 'assumption';
  const hostile = {
    ...brief,
    clarifications: [{ ...brief.clarifications[0], answer: 'Session only.' }],
  };
  assert.deepEqual(
    guardProposedBrief(brief, hostile).clarifications,
    brief.clarifications,
  );
  assert.equal(
    guardProposedBrief(emptyBrief('No answers yet.'), hostile).clarifications,
    undefined,
  );
  const snapshot = { ...fixture(), brief };
  snapshot.recipe = preserveBriefQualifications(brief, snapshot.recipe);
  assert(
    snapshot.recipe.assumptions.includes(
      clarificationText(brief.clarifications[3]),
    ),
  );
  assert(
    snapshot.recipe.openQuestions.includes(
      clarificationText(brief.clarifications[4]),
    ),
  );
  const sections = packSections(snapshot, {
    fullName: 'QA Visitor',
    company: 'Test Only',
    role: 'Tester',
    intendedUse: 'Synthetic test.',
    consent: true,
    confirmed: true,
  });
  for (const q of brief.clarifications)
    assert(
      sections.some((section) =>
        section.paragraphs.includes(clarificationText(q)),
      ),
    );
});

test('each original question has one labelled answer control, stable IDs and an explicit unknown choice', () => {
  const markup = renderToStaticMarkup(
    createElement(ClarificationQuestions, {
      questions: clarificationFixture().clarifications,
      onChange: () => {},
    }),
  );
  assert.equal((markup.match(/<fieldset/g) || []).length, 5);
  assert.equal((markup.match(/<textarea/g) || []).length, 5);
  for (let i = 1; i <= 5; i++) {
    assert(markup.includes(`for="studio-q${i}-answer"`));
    assert(markup.includes(`id="studio-q${i}-answer"`));
    assert(markup.includes(`aria-describedby="studio-q${i}-status"`));
  }
  assert(markup.includes('Not decided yet'));
  assert(!markup.includes('Continue clarification'));
});
