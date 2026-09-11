'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useEffect, useRef, useState } from 'react';
import { useUrlState } from '@/lib/url-state';
import {
  briefFields,
  emptyBrief,
  recipeChanges,
  conversationTurn,
  briefSchema,
  type JourneyBrief,
  type AssistantTurn,
} from '@/lib/studio/contract';
import type { SignedRecipe } from '@/lib/studio/account';
import { studioFetch } from '@/lib/studio/client';
import { scenarios } from '@/lib/scenarios';
import { byId } from '@/lib/harness';
import { features } from '@/lib/aml';
import { RecipeCanvas } from './RecipeCanvas';
import { RecipeQualifications } from './RecipeQualifications';
import { StudioPackRequest } from './StudioPackRequest';
import { StudioReferenceSearch } from './StudioReferenceSearch';
import { ClarificationQuestions } from './ClarificationQuestions';
import { ClarificationActions } from './ClarificationActions';
import {
  createClarifications,
  clarificationSubmission,
  clarificationText,
  clarificationRound,
} from '@/lib/studio/clarification';

function briefValue(value: JourneyBrief[keyof JourneyBrief]) {
  return Array.isArray(value)
    ? value
        .map((item) =>
          typeof item === 'string' ? item : clarificationText(item),
        )
        .join('; ')
    : value || 'Not supplied';
}

export function JourneyDesigner() {
  const { params } = useUrlState();
  const [brief, setBrief] = useState<JourneyBrief>(emptyBrief());
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [turn, setTurn] = useState<
    | (AssistantTurn & { receivedAnswers?: string; sendingAnswers?: boolean })
    | null
  >(null);
  const [proposed, setProposed] = useState<SignedRecipe | null>(null);
  const [applied, setApplied] = useState<SignedRecipe | null>(null);
  const [history, setHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [whatIf, setWhatIf] = useState('');
  const briefRevision = useRef(0);
  const context = {
    harness: byId(params.get('harness') || '')?.id || '',
    feature: features.find((f) => f.id === params.get('feature'))?.id || '',
    scenario: scenarios.find((s) => s.id === params.get('scenario'))?.id || '',
  };
  const example = scenarios.find((s) => s.id === context.scenario);
  useEffect(() => {
    void studioFetch<{ assistant: boolean }>('/health')
      .then((s) => setAvailability(s.assistant))
      .catch(() => setAvailability(false));
  }, []);
  const edit = (next: JourneyBrief) => {
    if (JSON.stringify(next) === JSON.stringify(brief)) return;
    briefRevision.current += 1;
    setBrief(next);
    setConfirmed(false);
    setProposed(null);
    // An older proposed brief must not overwrite answers edited after its review.
    setTurn((current) =>
      current?.brief ? { ...current, brief: null } : current,
    );
  };
  async function ask(intent: 'clarify' | 'design' | 'revise') {
    if (busy) return;
    const sendingAnswers =
      intent === 'clarify' && Boolean(brief.clarifications?.length);
    const submission = clarificationSubmission(
      brief,
      turn?.clarification ? turn.receivedAnswers : undefined,
    );
    if (sendingAnswers && !submission.canSend) return;
    const requestedRevision = briefRevision.current;
    setBusy(true);
    setMessage('');
    if (sendingAnswers)
      setTurn((current) =>
        current ? { ...current, sendingAnswers: true } : current,
      );
    const input =
      intent === 'revise'
        ? whatIf
        : intent === 'clarify'
          ? sendingAnswers
            ? 'Review the matched question–answer pairs in my brief.'
            : brief.workflow
          : 'Propose a solution recipe based on this confirmed brief.';
    try {
      const result = await studioFetch<
        AssistantTurn & { signedRecipe: SignedRecipe | null }
      >('/assistant', {
        intent,
        message: input,
        brief,
        confirmed,
        recipe: applied?.snapshot.recipe || null,
        history,
        context,
      });
      if (requestedRevision !== briefRevision.current) {
        setMessage(
          'Your brief changed while the assistant was working. The older response was not applied. Review your brief and ask again.',
        );
        return;
      }
      let reviewedBrief = brief;
      if (intent === 'clarify') {
        const clarifications =
          result.clarification?.ledger ||
          brief.clarifications ||
          createClarifications(result.questions);
        if (clarifications.length) reviewedBrief = { ...brief, clarifications };
        edit(reviewedBrief);
        if (result.brief && clarifications.length)
          result.brief = { ...result.brief, clarifications };
      }
      setTurn({
        ...result,
        clarification: result.clarification || turn?.clarification,
        receivedAnswers:
          intent === 'clarify'
            ? clarificationSubmission(reviewedBrief).snapshot
            : turn?.receivedAnswers,
      });
      setProposed(result.signedRecipe);
      setAvailability(true);
      setHistory((current) =>
        [
          ...current,
          { role: 'user' as const, content: input },
          {
            role: 'assistant' as const,
            content: conversationTurn(result.reply, result.questions),
          },
        ].slice(-12),
      );
      setWhatIf('');
      if (intent === 'clarify') setConfirmed(false);
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'The assistant is unavailable.';
      setMessage(
        sendingAnswers
          ? `The assistant could not review your answers. ${reason} Your entries and round number are unchanged; you can retry.`
          : reason,
      );
    } finally {
      setBusy(false);
      setTurn((current) =>
        current?.sendingAnswers
          ? { ...current, sendingAnswers: false }
          : current,
      );
    }
  }
  const diff =
    applied && proposed
      ? recipeChanges(applied.snapshot.recipe, proposed.snapshot.recipe)
      : null;
  const parsedBrief = briefSchema.safeParse(brief);
  const packCurrent =
    confirmed &&
    applied &&
    parsedBrief.success &&
    JSON.stringify(applied.snapshot.brief) === JSON.stringify(parsedBrief.data);
  const questions = brief.clarifications || [];
  const answered = questions.filter(
    (q) =>
      q.status !== 'unanswered' && (q.status === 'deferred' || q.answer.trim()),
  ).length;
  const validBrief = brief.workflow.trim().length >= 10 && parsedBrief.success;
  const clarificationReady = Boolean(
    turn?.clarification && turn.clarification.status !== 'questions',
  );
  const round = turn?.clarification?.round || clarificationRound(brief) || 1;
  const submission = clarificationSubmission(
    brief,
    turn?.clarification ? turn.receivedAnswers : undefined,
    clarificationReady,
  );
  const answersNeedSending = questions.length > 0 && !submission.sent;
  const needsReview =
    Boolean(turn?.brief) || (questions.length > 0 && !clarificationReady);
  const currentQuestions = questions.filter(
    (q) =>
      !clarificationReady &&
      ((q.round || 1) === round || q.status === 'unanswered'),
  );
  const earlierQuestions = questions.filter(
    (q) => !currentQuestions.includes(q),
  );
  const updateQuestions = (changed: typeof questions) =>
    edit({
      ...brief,
      clarifications: questions.map(
        (q) => changed.find((item) => item.id === q.id) || q,
      ),
    });
  const answerActions = (position: 'top' | 'bottom') => (
    <ClarificationActions
      position={position}
      submission={submission}
      busy={busy}
      sending={Boolean(turn?.sendingAnswers)}
      error={message}
      onSend={() => {
        void ask('clarify');
      }}
    />
  );
  return (
    <div className="section-shell studio-designer">
      <div className="studio-status">
        <output aria-live="polite">
          {busy
            ? 'Planeon Assistant is working. Your current design stays unchanged. '
            : ''}
          {availability === null
            ? 'Checking local assistant…'
            : availability
              ? 'Local assistant configured'
              : 'Assistant offline or not configured'}
        </output>
        <a href="/journey/requests">My requests →</a>
      </div>
      {availability === false && (
        <p className="studio-notice">
          You can prepare your brief here. Generation, account access and
          private downloads need Planeon’s laptop-backed service. The full
          example library and reference pages stay open.
        </p>
      )}
      <div className="studio-workspace">
        <section>
          <span className="eyebrow">01 / Describe and clarify</span>
          <h2>What should happen differently?</h2>
          {example && (
            <div className="studio-context">
              <p>Selected example: {example.title}</p>
              <button
                onClick={() => edit({ ...brief, workflow: example.intro })}
              >
                Use this example as my starting brief
              </button>
            </div>
          )}
          {(context.harness || context.feature) && (
            <p className="studio-fine">
              Reference context:{' '}
              {[byId(context.harness)?.shortName, context.feature]
                .filter(Boolean)
                .join(' / ')}
              . This guides the conversation; it does not prove applicability.
            </p>
          )}
          <label htmlFor="studio-workflow">Your priority workflow</label>
          <textarea
            id="studio-workflow"
            rows={5}
            maxLength={2000}
            value={brief.workflow}
            onChange={(e) => edit({ ...brief, workflow: e.target.value })}
            placeholder="For example: let our service team change a delivery address after payment, with identity verification and approval for high-value orders."
          />
          <p className="studio-fine">
            Text only. Do not include credentials, personal records or
            confidential customer data. Public drafts are not retained on the
            server and disappear when this page is reloaded.
          </p>
          <details>
            <summary>Add the constraints you already know</summary>
            <div className="studio-field-grid">
              {briefFields.map((field) => (
                <label key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  <textarea
                    rows={2}
                    maxLength={1200}
                    value={brief[field]}
                    onChange={(e) =>
                      edit({ ...brief, [field]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
          </details>
          {!questions.length && !clarificationReady && (
            <div className="studio-actions">
              <button
                disabled={busy || brief.workflow.trim().length < 10}
                onClick={() => {
                  void ask('clarify');
                }}
              >
                {busy
                  ? 'Working on your proposal…'
                  : 'Clarify with Planeon Assistant'}
              </button>
            </div>
          )}
          {turn && (
            <section
              className="studio-assistant-response"
              aria-label="Planeon Assistant response"
            >
              <h3>Planeon Assistant</h3>
              <output className="studio-fine">
                {turn.clarification
                  ? `Round ${round} of 5 · ${turn.clarification.status === 'limit' ? 'Limit reached — draft with assumptions' : clarificationReady ? 'Ready for brief review' : 'Follow-up questions'}`
                  : 'Assistant response ready for review.'}
              </output>
              <p>{turn.reply.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
              {turn.brief && (
                <div>
                  <details>
                    <summary>Review proposed brief changes</summary>
                    {Object.entries(turn.brief)
                      .filter(
                        ([key, value]) =>
                          key !== 'clarifications' &&
                          JSON.stringify(value) !==
                            JSON.stringify(brief[key as keyof JourneyBrief]),
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <h4>{key}</h4>
                          <p>
                            Current:{' '}
                            {briefValue(brief[key as keyof JourneyBrief])}
                          </p>
                          <p>Proposed: {briefValue(value)}</p>
                        </div>
                      ))}
                  </details>
                  <button
                    onClick={() => {
                      const accepted = {
                        ...turn.brief!,
                        ...(brief.clarifications
                          ? { clarifications: brief.clarifications }
                          : {}),
                      };
                      edit(accepted);
                      setTurn({
                        ...turn,
                        brief: null,
                        receivedAnswers:
                          clarificationSubmission(accepted).snapshot,
                      });
                    }}
                  >
                    Apply this proposed brief for my review
                  </button>
                </div>
              )}
            </section>
          )}
          {questions.length > 0 && (
            <div className="studio-clarification-round">
              {answerActions('top')}
              {currentQuestions.length > 0 && (
                <ClarificationQuestions
                  questions={currentQuestions}
                  onChange={updateQuestions}
                />
              )}
              {earlierQuestions.length > 0 && (
                <details className="studio-conversation">
                  <summary>
                    Review earlier answers and open decisions ·{' '}
                    {earlierQuestions.length}
                  </summary>
                  <ClarificationQuestions
                    id={
                      currentQuestions.length
                        ? 'studio-earlier-questions'
                        : 'studio-questions'
                    }
                    questions={earlierQuestions}
                    onChange={updateQuestions}
                  />
                </details>
              )}
              {answerActions('bottom')}
              <p className="studio-fine">
                Up to five question rounds. After each send, the assistant
                reviews all your answers and asks only about remaining gaps. It
                can finish earlier. At the limit, it proposes rough assumptions
                for review; access rights, approvals and regulatory gaps remain
                open.
              </p>
            </div>
          )}
          {history.length > 0 && (
            <details className="studio-conversation">
              <summary>
                Conversation so far · {history.length / 2} turns
              </summary>
              {history.map((item, i) => (
                <div key={i}>
                  <strong>
                    {item.role === 'user' ? 'You' : 'Planeon Assistant'}
                  </strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{item.content}</p>
                </div>
              ))}
              <p className="studio-fine">
                The latest six assistant exchanges are shown here. Your matched
                question–answer pairs remain in the brief separately; they are
                not lost when older exchanges leave this history.
              </p>
            </details>
          )}
          {message && (
            <p role="alert" className="studio-notice">
              {message}
            </p>
          )}
        </section>
        <section className="studio-brief-review">
          <span className="eyebrow">02 / Confirm</span>
          <h2 id="studio-brief-heading" tabIndex={-1}>
            Make the starting point explicit.
          </h2>
          <p>
            Review the workflow and constraints on the left. Keep supplied facts
            separate from assumptions and missing information.
          </p>
          {questions.length > 0 && (
            <p className="studio-fine">
              <a href="#studio-questions">
                Review your {questions.length} matched question–answer pairs
              </a>
              . They are included in this brief, the next proposal request and
              any submitted engineering pack. Supplied answers are not
              independently verified facts. Assumptions and undecided items stay
              qualified.
            </p>
          )}
          {(['facts', 'assumptions', 'unknowns'] as const).map((key) => (
            <label key={key}>
              {key === 'facts'
                ? 'Supplied facts'
                : key === 'assumptions'
                  ? 'Assumptions to validate'
                  : 'Missing information'}
              <span className="studio-fine">One item per line</span>
              <textarea
                rows={3}
                maxLength={10000}
                value={brief[key].join('\n')}
                onBlur={() =>
                  edit({
                    ...brief,
                    [key]: brief[key].map((x) => x.trim()).filter(Boolean),
                  })
                }
                onChange={(e) =>
                  edit({
                    ...brief,
                    [key]: e.target.value.split('\n').slice(0, 20),
                  })
                }
              />
            </label>
          ))}
          <label className="studio-check">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={
                !validBrief ||
                answered < questions.length ||
                answersNeedSending ||
                needsReview ||
                busy
              }
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I have reviewed this brief, including its assumptions and missing
              information.
            </span>
          </label>
          {answersNeedSending && (
            <p className="studio-fine">
              Send your answers before confirming this brief. You can send a
              partial set and finish the remaining questions afterwards.
            </p>
          )}
          {needsReview && (
            <p className="studio-fine">
              {turn?.brief
                ? 'Review and apply the proposed brief above before confirming. You can edit it afterwards.'
                : 'Send your answers to continue clarification. The assistant will signal when the brief is ready for review.'}
            </p>
          )}
          <button
            className="studio-primary"
            disabled={
              !confirmed ||
              !validBrief ||
              answered < questions.length ||
              answersNeedSending ||
              needsReview ||
              busy
            }
            onClick={() => {
              void ask('design');
            }}
          >
            Propose a solution recipe
          </button>
          <p className="studio-fine">
            A recipe is a proposal—not an assessment result, verified
            performance or regulatory certification.
          </p>
        </section>
      </div>
      {proposed && (
        <section
          className="studio-revision"
          aria-label="Proposed design revision"
        >
          <span className="eyebrow">03 / Review before applying</span>
          <h2>
            {applied
              ? 'A proposed revision is ready.'
              : 'Your first proposal is ready.'}
          </h2>
          <p>{proposed.snapshot.recipe.objective}</p>
          {turn?.changeSummary.length ? (
            <div>
              <p className="studio-fine">
                Assistant’s change summary — inspect the actual fields below;
                this summary is not verification.
              </p>
              <ul>
                {turn.changeSummary.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {diff && (
            <div className="studio-diff">
              {(['added', 'removed', 'changed'] as const).map((key) => (
                <div key={key}>
                  <h3>{key} steps</h3>
                  <ul>
                    {diff[key].length ? (
                      diff[key].map((x) => <li key={x}>{x}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
              ))}
              <p>
                Other changes:{' '}
                {Object.entries(diff)
                  .filter(([k, v]) => k.endsWith('Changed') && v)
                  .map(([k]) => k.replace('Changed', ''))
                  .join(', ') || 'none'}
                .
              </p>
            </div>
          )}
          <details>
            <summary>Inspect proposed steps before applying</summary>
            <ol>
              {proposed.snapshot.recipe.steps.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong> — {s.description}
                  <p>
                    Inputs: {s.inputs} Outputs: {s.outputs}
                  </p>
                  <p>Authorization: {s.authorization}</p>
                  <p>Recovery: {s.recovery}</p>
                  <p className="studio-fine">
                    {s.clock} timeline · Prerequisites:{' '}
                    {s.dependsOn.join(', ') || 'none'}
                  </p>
                </li>
              ))}
            </ol>
            <p>
              Harnesses:{' '}
              {proposed.snapshot.recipe.harnesses
                .map((id) => byId(id)!.shortName)
                .join(', ')}
              .
            </p>
            <p>
              Evidence references:{' '}
              {[
                ...new Set(
                  proposed.snapshot.recipe.evidence.map((e) => e.featureId),
                ),
              ].join(', ')}
              .
            </p>
          </details>
          <RecipeQualifications recipe={proposed.snapshot.recipe} />
          <div className="studio-actions">
            <button
              className="studio-primary"
              onClick={() => {
                setApplied(proposed);
                setProposed(null);
              }}
            >
              Apply this proposal to the canvas
            </button>
            <button onClick={() => setProposed(null)}>Discard proposal</button>
          </div>
          <p className="studio-fine">
            The current canvas does not change until you apply this version.
          </p>
        </section>
      )}
      {applied ? (
        <>
          <RecipeCanvas
            key={`canvas:${applied.signature}`}
            recipe={applied.snapshot.recipe}
          />
          <section className="studio-refine">
            <span className="eyebrow">04 / Refine</span>
            <h2>Explore a “what if?”</h2>
            <label>
              What would you change?
              <textarea
                rows={3}
                maxLength={2000}
                value={whatIf}
                onChange={(e) => setWhatIf(e.target.value)}
                placeholder="What if customer data must stay on-premises and every external action needs an approval?"
              />
            </label>
            <button
              disabled={busy || !whatIf.trim() || !confirmed}
              onClick={() => {
                void ask('revise');
              }}
            >
              {busy ? 'Preparing proposed changes…' : 'Propose changes'}
            </button>
          </section>
          {packCurrent ? (
            <StudioPackRequest
              key={`pack:${applied.signature}`}
              signed={applied}
            />
          ) : (
            <p className="studio-notice">
              The brief has changed. Confirm it, generate a new recipe and apply
              it before requesting the pack.
            </p>
          )}
        </>
      ) : (
        <section className="studio-empty-canvas">
          <span className="eyebrow">Your visual recipe</span>
          <h2>One proposal. Several ways to inspect it.</h2>
          <p>
            The applied design appears here as an onion walkthrough, sequence
            and waterfall, with harness responsibilities and expected AML
            evidence alongside each stage.
          </p>
          <a href="/blueprint">Read the architecture behind the canvas →</a>
        </section>
      )}
      <StudioReferenceSearch />
    </div>
  );
}
