import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers these tests. */
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ClarificationQuestions } from '../../../components/site/ClarificationQuestions';
import { ClarificationActions } from '../../../components/site/ClarificationActions';
import { briefSchema, emptyBrief } from '../../../lib/studio/contract';
import {
  createClarifications,
  reviewClarifications,
  clarificationText,
  clarificationSubmission,
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

test('send is available for partial answers, acknowledges only the sent snapshot, and reopens for edits', () => {
  const brief = {
    ...emptyBrief('Notebook visualisation preferences.'),
    clarifications: createClarifications(questions),
  };
  assert.equal(clarificationSubmission(brief).canSend, false);
  brief.clarifications[0] = {
    ...brief.clarifications[0],
    answer: 'All notebooks.',
    status: 'answered',
  };
  const partial = clarificationSubmission(brief);
  assert.equal(partial.canSend, true);
  assert.equal(partial.complete, false);
  assert.equal(partial.label, 'Send answers');
  const receipt = partial.snapshot;
  assert.equal(clarificationSubmission(brief, receipt).label, 'Answers sent');
  assert.equal(clarificationSubmission(brief, receipt).canSend, false);
  brief.clarifications[0].answer = 'Only the current notebook.';
  const changed = clarificationSubmission(brief, receipt);
  assert.equal(changed.sent, false);
  assert.equal(changed.canSend, true);
  assert.equal(changed.label, 'Send updated answers');
  const complete = clarificationFixture();
  assert.equal(
    clarificationSubmission(complete).sent,
    false,
    'Completion alone is not receipt.',
  );
  const sent = clarificationSubmission(
    complete,
    clarificationSubmission(complete).snapshot,
  );
  assert.equal(sent.sent, true);
  assert.equal(sent.complete, true);
  complete.clarifications[1].status = 'assumption';
  complete.clarifications[1].answer = '';
  assert.equal(clarificationSubmission(complete).canSend, false);
});

test('send controls explain pending, sending, received and failure states at both ends of the questions', () => {
  const brief = clarificationFixture();
  const submission = clarificationSubmission(brief);
  const render = (
    props: Partial<Parameters<typeof ClarificationActions>[0]> = {},
  ) =>
    renderToStaticMarkup(
      createElement(ClarificationActions, {
        position: 'top',
        submission,
        busy: false,
        sending: false,
        onSend: () => {},
        ...props,
      }),
    );
  assert.match(render(), />Send answers<\/button>/);
  assert.match(render(), /aria-describedby="studio-send-help-top"/);
  assert.match(
    render({ position: 'bottom' }),
    /aria-describedby="studio-send-help-bottom"/,
  );
  assert.match(render({ busy: true, sending: true }), /Sending answers/);
  assert.match(render({ busy: true, sending: true }), /disabled/);
  assert(!render().includes('Continue to brief'));
  const received = clarificationSubmission(brief, submission.snapshot);
  assert.match(render({ submission: received }), /Answers received/);
  assert.match(render({ submission: received }), /Continue to brief/);
  const failure = render({
    error: 'Receipt not confirmed. Your entries remain here.',
  });
  assert.match(failure, /role="alert"/);
  assert(!failure.includes('Answers received'));
});
