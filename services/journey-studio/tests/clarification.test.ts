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
  clarificationText,
  clarificationSubmission,
  clarificationRound,
} from '../../../lib/studio/clarification';
import { finishClarification } from '../src/inference-clarification';
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

test('matched answers survive follow-ups, history loss, edits and deliberate deferral', () => {
  const initial = {
    ...emptyBrief('Notebook visualisation preferences.'),
    clarifications: createClarifications(questions),
  };
  initial.clarifications[0] = {
    ...initial.clarifications[0],
    answer: 'Across all notebooks.',
    status: 'answered',
  };
  const followup = finishClarification(initial, {
    reply: 'A new gap.',
    questions: ['Who can delete a saved preference?'],
    brief: null,
    recipe: null,
    changeSummary: [],
  });
  assert.equal(followup.clarification!.round, 2);
  assert.deepEqual(
    followup.clarification!.ledger.slice(0, 5),
    initial.clarifications,
  );
  assert.equal(followup.clarification!.ledger[5].id, 'q6');
  const complete = clarificationFixture();
  complete.clarifications[1].answer =
    'Command preferences only; never cache the data source.';
  assert.equal(complete.clarifications[1].id, 'q2');
  assert.equal(complete.clarifications[1].question, questions[1]);
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
    permissions: 'Full access is authorized.',
    regulation: 'Assume GDPR-compliant retention.',
    assumptions: [
      'No regulatory requirements mandate explicit consent.',
      'A bounded pilot is sufficient to test chart preferences.',
    ],
    clarifications: [{ ...brief.clarifications[0], answer: 'Session only.' }],
  };
  assert.match(guardProposedBrief(brief, hostile).permissions, /^Not supplied/);
  assert.match(guardProposedBrief(brief, hostile).regulation, /^Not supplied/);
  assert(
    !guardProposedBrief(brief, hostile).assumptions.some((item) =>
      item.includes('No regulatory'),
    ),
  );
  assert(
    guardProposedBrief(brief, hostile).assumptions.includes(
      'A bounded pilot is sufficient to test chart preferences.',
    ),
  );
  assert(
    guardProposedBrief(brief, hostile).unknowns.some((item) =>
      item.includes('do not assume compliance'),
    ),
  );
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
  assert.equal(
    clarificationSubmission(brief, receipt).label,
    'Answers reviewed',
  );
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
  assert.match(render({ submission: received }), /Answers reviewed/);
  assert.match(render({ submission: received }), /Continue to brief/);
  const failure = render({
    error: 'Receipt not confirmed. Your entries remain here.',
  });
  assert.match(failure, /role="alert"/);
  assert(!failure.includes('Answers reviewed'));
  const pending = clarificationSubmission(brief, submission.snapshot, false);
  assert(!render({ submission: pending }).includes('Continue to brief'));
  assert.match(render({ submission: pending }), /follow-up questions/);
});

test('five-round cap retains 25 answers and forces qualified review even if the model keeps questioning', () => {
  const brief = emptyBrief('Synthetic bounded notebook workflow.');
  brief.clarifications = [];
  for (let round = 1; round <= 5; round++) {
    const turn = finishClarification(brief, {
      reply: 'Essential gaps.',
      questions: Array.from({ length: 5 }, (_, i) => `Decision ${round}-${i}?`),
      brief: null,
      recipe: null,
      changeSummary: [],
    });
    assert.equal(turn.clarification!.round, round);
    assert.equal(turn.clarification!.status, 'questions');
    brief.clarifications = turn.clarification!.ledger.map((q) => ({
      ...q,
      status: 'deferred' as const,
    }));
  }
  assert.equal(clarificationRound(brief), 5);
  assert.equal(briefSchema.parse(brief).clarifications!.length, 25);
  const closed = finishClarification(brief, {
    reply: 'More questions!',
    questions: ['May we deploy without permission?'],
    brief: null,
    recipe: null,
    changeSummary: [],
  });
  assert.deepEqual(closed.questions, []);
  assert.equal(closed.clarification!.round, 5);
  assert.equal(closed.clarification!.status, 'limit');
  assert.deepEqual(closed.clarification!.ledger, brief.clarifications);
  assert.match(
    closed.brief!.assumptions.join(' '),
    /Rough planning assumption/,
  );
  assert.match(closed.brief!.unknowns.join(' '), /access rights.*regulatory/);
  assert.deepEqual(closed.brief!.facts, brief.facts);
  const qualified = preserveBriefQualifications(
    closed.brief!,
    fixture().recipe,
  );
  for (const q of brief.clarifications)
    assert(qualified.openQuestions.includes(clarificationText(q)));
  assert.throws(() =>
    briefSchema.parse({
      ...brief,
      clarifications: [
        ...brief.clarifications!,
        { ...brief.clarifications![0], id: 'q26' },
      ],
    }),
  );
});

test('early readiness retains open questions and proposed assumptions without inventing supplied answers', () => {
  const brief = clarificationFixture();
  brief.clarifications[0] = {
    ...brief.clarifications[0],
    answer: '',
    status: 'unanswered',
  };
  const turn = finishClarification(brief, {
    reply: 'Clear enough.',
    questions: [],
    recipe: null,
    changeSummary: [],
    brief: { ...brief, assumptions: ['Pilot in a test notebook first.'] },
  });
  assert.equal(turn.clarification!.status, 'questions');
  assert.equal(turn.clarification!.round, 1);
  assert.equal(turn.clarification!.ledger[0].status, 'unanswered');
  assert.equal(turn.clarification!.ledger[0].answer, '');
  assert.equal(turn.brief, null);
  brief.clarifications[0].status = 'deferred';
  const ready = finishClarification(brief, {
    reply: 'Ready.',
    questions: [],
    brief: { ...brief, assumptions: ['Pilot in a test notebook first.'] },
    recipe: null,
    changeSummary: [],
  });
  assert.equal(ready.clarification!.status, 'ready');
  assert.deepEqual(ready.brief!.assumptions, [
    'Pilot in a test notebook first.',
  ]);
  assert.equal(
    brief.clarifications[0].status,
    'deferred',
    'Never mutate an in-flight draft.',
  );
});
