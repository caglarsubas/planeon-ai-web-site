'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useEffect, useRef, useState } from 'react';
import { useUrlState } from '@/lib/url-state';
import {
  briefFields,
  emptyBrief,
  recipeChanges,
  type JourneyBrief,
  type AssistantTurn,
} from '@/lib/studio/contract';
import type { SignedRecipe } from '@/lib/studio/account';
import { studioFetch } from '@/lib/studio/client';
import { scenarios } from '@/lib/scenarios';
import { byId } from '@/lib/harness';
import { features } from '@/lib/aml';
import { RecipeCanvas } from './RecipeCanvas';
import { StudioPackRequest } from './StudioPackRequest';
import { StudioReferenceSearch } from './StudioReferenceSearch';

export function JourneyDesigner() {
  const { params } = useUrlState();
  const [brief, setBrief] = useState<JourneyBrief>(emptyBrief());
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [turn, setTurn] = useState<AssistantTurn | null>(null);
  const [proposed, setProposed] = useState<SignedRecipe | null>(null);
  const [applied, setApplied] = useState<SignedRecipe | null>(null);
  const [history, setHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [reply, setReply] = useState('');
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
    briefRevision.current += 1;
    setBrief(next);
    setConfirmed(false);
    setProposed(null);
  };
  async function ask(intent: 'clarify' | 'design' | 'revise') {
    const requestedRevision = briefRevision.current;
    setBusy(true);
    setMessage('');
    const input =
      intent === 'revise'
        ? whatIf
        : intent === 'clarify'
          ? reply || brief.workflow
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
      setTurn(result);
      setProposed(result.signedRecipe);
      setAvailability(true);
      setHistory((current) =>
        [
          ...current,
          { role: 'user' as const, content: input },
          { role: 'assistant' as const, content: result.reply },
        ].slice(-12),
      );
      setReply('');
      setWhatIf('');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'The assistant is unavailable.',
      );
    } finally {
      setBusy(false);
    }
  }
  const diff =
    applied && proposed
      ? recipeChanges(applied.snapshot.recipe, proposed.snapshot.recipe)
      : null;
  const packCurrent =
    confirmed &&
    applied &&
    JSON.stringify(applied.snapshot.brief) === JSON.stringify(brief);
  return (
    <div className="section-shell studio-designer">
      <div className="studio-status">
        <span>
          {availability === null
            ? 'Checking local assistant…'
            : availability
              ? 'Local assistant configured'
              : 'Assistant offline or not configured'}
        </span>
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
          {turn && (
            <section
              className="studio-assistant-response"
              aria-label="Planeon Assistant response"
            >
              <h3>Planeon Assistant</h3>
              <p>{turn.reply}</p>
              {turn.questions.length > 0 && (
                <ul>
                  {turn.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              )}
              {turn.brief && (
                <button
                  onClick={() => {
                    edit(turn.brief!);
                    setTurn(null);
                  }}
                >
                  Apply this proposed brief for my review
                </button>
              )}
              <label>
                Your answer
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
              </label>
              <button
                disabled={busy || !reply.trim()}
                onClick={() => {
                  void ask('clarify');
                }}
              >
                Continue clarification
              </button>
            </section>
          )}
          {message && (
            <p role="alert" className="studio-notice">
              {message}
            </p>
          )}
        </section>
        <section className="studio-brief-review">
          <span className="eyebrow">02 / Confirm</span>
          <h2>Make the starting point explicit.</h2>
          <p>
            Review the workflow and constraints on the left. Keep supplied facts
            separate from assumptions and missing information.
          </p>
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
              disabled={brief.workflow.trim().length < 10 || busy}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I have reviewed this brief, including its assumptions and missing
              information.
            </span>
          </label>
          <button
            className="studio-primary"
            disabled={!confirmed || busy}
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
            <ul>
              {turn.changeSummary.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
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
            key={applied.signature}
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
              Propose changes
            </button>
          </section>
          {packCurrent ? (
            <StudioPackRequest key={applied.signature} signed={applied} />
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
