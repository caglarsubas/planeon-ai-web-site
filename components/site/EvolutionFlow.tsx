/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import type { CSSProperties } from 'react';
import { Surface } from './VisualPrimitives';
import { changes } from '@/data/operating.v1';
import { learningStages, learningStories } from '@/data/evolution.v1';
import { resolveEvolution } from '@/lib/evolution';
import { byId, consultationHref, planes } from '@/lib/harness';
import { useUrlState } from '@/lib/url-state';
import { ReferenceDisclosure } from './ReferenceDisclosure';

export function EvolutionFlow() {
  const { params, update } = useUrlState();
  const { change, story, stage, branch } = resolveEvolution(params);
  const target = byId(change.target)!;
  const plane = planes[target.plane];
  const stageIndex = learningStages.findIndex((item) => item.id === stage.id);
  return (
    <div
      className="evolution-workspace learning-workspace section-shell"
      style={
        {
          '--learning-color': plane.color,
          '--learning-tint': plane.tint,
        } as CSSProperties
      }
    >
      <header className="workspace-heading learning-heading">
        <p className="eyebrow">Learning & Evolution</p>
        <h1>
          Learn from experience.
          <br />
          Keep control.
        </h1>
        <p>
          How your agentic system can get better at its work: learn from
          outcomes, improve the harness around the model, and release only
          changes that pass independent checks. We call this{' '}
          <strong>governed adaptation.</strong>
        </p>
      </header>

      <div className="learning-orientation">
        <p>
          <strong>The neuroplasticity connection.</strong> This is the practical
          interpretation of our neuroplasticity-based research: use experience
          to guide change while protecting what must stay reliable. It is a
          design metaphor, not a claim that software learns like a brain.
        </p>
        <a href="/evolution/research#metaphor">
          Explore the research & metaphor ↗
        </a>
      </div>

      <section
        className="learning-example"
        aria-labelledby="learning-example-title"
      >
        <div className="learning-section-intro">
          <p className="eyebrow">01 / What gets better?</p>
          <p className="learning-status">
            Illustrative examples · not measured results
          </p>
        </div>
        <fieldset className="change-picker" aria-label="Learning example">
          {changes.map((item) => (
            <button
              key={item.id}
              aria-pressed={item.id === change.id}
              aria-controls="learning-story"
              onClick={() =>
                update({ change: item.id, stage: 'observation', branch: null })
              }
            >
              {learningStories[item.id].label}
            </button>
          ))}
        </fieldset>
        <div id="learning-story" className="learning-story" aria-live="polite">
          <h2 id="learning-example-title">{story.title}</h2>
          <p className="learning-context">{story.context}</p>
          <div className="learning-comparison">
            <div className="learning-before">
              <p className="control-label">Before / the problem</p>
              <h3>{story.before.title}</h3>
              <p>{story.before.detail}</p>
            </div>
            <span className="learning-comparison-arrow" aria-hidden="true">
              →
            </span>
            <div className="learning-after">
              <p className="control-label">After / intended, if validated</p>
              <h3>{story.after.title}</h3>
              <p>{story.after.detail}</p>
            </div>
          </div>
          <div className="learning-constant">
            <p>
              <strong>What stays protected.</strong> {story.remains}
            </p>
            <a href={target.href}>
              The {target.shortName} harness ·{' '}
              {String(target.number).padStart(2, '0')} ↗
            </a>
          </div>
        </div>
      </section>

      <section className="learning-loop" aria-labelledby="learning-loop-title">
        <p className="eyebrow">02 / How learning becomes a safe change</p>
        <h2 id="learning-loop-title">
          Feedback is the beginning.
          <br />
          Not permission to change.
        </h2>
        <p className="learning-loop-intro">
          Review completed work, test a candidate, then decide whether to
          release it. This improvement loop sits outside the live task timeline.
          Select a step to follow the example.
        </p>
        <div
          className="governed-flow"
          aria-label="Learning loop with separate proposal, independent approval and controlled release"
        >
          <div className="flow-lane-labels" aria-hidden="true">
            <span>Observe & propose</span>
            <span>Independent checks & authority</span>
            <span>Approved harness & feedback</span>
          </div>
          <ol>
            {learningStages.map((item, index) => (
              <li key={item.id}>
                <button
                  aria-pressed={stage.id === item.id && !branch}
                  aria-controls="learning-stage-detail"
                  onClick={() => update({ stage: item.id, branch: null })}
                >
                  <span className="flow-step-number">0{index + 1}</span>
                  <strong>{item.name}</strong>
                  <small>{item.owner}</small>
                </button>
                {stage.id === item.id && !branch && (
                  <a
                    className="learning-step-jump"
                    href="#learning-stage-detail"
                  >
                    Read this step ↓
                  </a>
                )}
                {index < learningStages.length - 1 && (
                  <span className="flow-next" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="flow-feedback">
            <span>
              Results feed the next review. Every new candidate goes through the
              checks again.
            </span>
            <button
              onClick={() => update({ stage: 'observation', branch: null })}
              aria-controls="learning-stage-detail"
            >
              ↶ Back to observation
            </button>
          </div>
        </div>

        <Surface className="evolution-evidence-surface">
          <div
            className="evolution-detail"
            id="learning-stage-detail"
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
          >
            <div>
              <p className="eyebrow">
                {branch
                  ? 'When a change is not safe to keep'
                  : `0${stageIndex + 1} / ${stage.owner}`}
              </p>
              <h3>
                {branch === 'reject'
                  ? 'Keep a failed candidate out.'
                  : branch === 'withdraw'
                    ? 'Stop the limited release.'
                    : branch === 'recover'
                      ? 'Recover without hiding the effects.'
                      : stage.name}
              </h3>
              <p className="learning-stage-example">
                {branch === 'reject'
                  ? 'Preserve the test results and reasons for rejection. Revise the candidate or stop. A better average score cannot compensate for a failed protected control.'
                  : branch === 'withdraw'
                    ? 'Stop new work on the trial version and route eligible tasks to the last approved version. Inspect in-flight tasks and any external effects already committed.'
                    : branch === 'recover'
                      ? change.recovery
                      : story.stages[stage.id]}
              </p>
              <p className="learning-stage-principle">
                {branch
                  ? 'Stopping future actions, restoring a version and compensating for an external effect are separate recovery steps. A rollback cannot automatically undo a real-world action.'
                  : stage.principle}
              </p>
            </div>
            <aside>
              <p className="control-label">Where the approved change lands</p>
              <a href={target.href}>
                {target.number} · {target.shortName} harness ↗
              </a>
              <p>
                The model is not the only thing that can improve. Here, the
                versioned change belongs to the {target.shortName.toLowerCase()}{' '}
                harness.
              </p>
              <p className="learning-authority">
                Governance authorizes. Evaluation supplies evidence. Security
                sets the limits.
              </p>
            </aside>
          </div>
        </Surface>
        <div className="learning-recovery">
          <p className="control-label">
            If the evidence fails or a release regresses
          </p>
          <fieldset
            className="flow-branches"
            aria-label="Rejection and recovery paths"
          >
            <button
              aria-pressed={branch === 'reject'}
              aria-controls="learning-stage-detail"
              onClick={() => update({ stage: 'evaluation', branch: 'reject' })}
            >
              ↳ Reject or revise
            </button>
            <button
              aria-pressed={branch === 'withdraw'}
              aria-controls="learning-stage-detail"
              onClick={() => update({ stage: 'rollout', branch: 'withdraw' })}
            >
              ↳ Withdraw the trial
            </button>
            <button
              aria-pressed={branch === 'recover'}
              aria-controls="learning-stage-detail"
              onClick={() => update({ stage: 'monitoring', branch: 'recover' })}
            >
              ↶ Recover approved state
            </button>
          </fieldset>
          {branch && (
            <a className="learning-step-jump" href="#learning-stage-detail">
              Read recovery guidance ↑
            </a>
          )}
        </div>
      </section>

      <ReferenceDisclosure
        id="change-envelope"
        title="Inspect the technical change envelope"
      >
        <section className="change-envelope">
          <p className="eyebrow">03 / The limits behind the example</p>
          <h2>
            Define what may change.
            <br />
            Protect what must not.
          </h2>
          <p className="learning-envelope-intro">
            This <strong>change envelope</strong> records the permissions,
            evidence and recovery conditions for “{change.name}.” It is the
            technical contract behind the learning loop.
          </p>
          <dl>
            <div>
              <dt>What may change</dt>
              <dd>{change.mutable}</dd>
            </div>
            <div>
              <dt>What stays protected</dt>
              <dd>{change.protected}</dd>
            </div>
            <div>
              <dt>Tests required</dt>
              <dd>{change.validation}</dd>
            </div>
            <div>
              <dt>Who may approve</dt>
              <dd>{change.authority}</dd>
            </div>
            <div>
              <dt>Resource limits</dt>
              <dd>{change.budget}</dd>
            </div>
            <div>
              <dt>When to stop and recover</dt>
              <dd>{change.recovery}</dd>
            </div>
          </dl>
        </section>
      </ReferenceDisclosure>
      <p className="reference-caveat">
        This is a reference design, not a claim that Planeon runs self-improving
        production agents or that these examples passed an assessment. A change
        envelope does not establish regulatory compliance. Adaptation
        permission, AML maturity, implementation readiness and research maturity
        remain distinct. Evolution crosses the existing planes; it is not a
        seventeenth harness.
      </p>
      <div className="evolution-connections">
        <section>
          <h3>What evidence would you need?</h3>
          <p>These are reference requirements, not passed controls.</p>
          <div className="reference-links">
            {change.features.map((id) => (
              <a key={id} href={`/maturity?feature=${id}`}>
                {id} · Inspect the requirement ↗
              </a>
            ))}
          </div>
        </section>
        <section>
          <h3>Connect the next step.</h3>
          <div className="reference-links">
            <a href={`/blueprint?artifact=${change.artifact}#release-bundle`}>
              Blueprint · Version the change ↗
            </a>
            <a href="/journey">
              Journey · See a live task, not the learning loop ↗
            </a>
            <a href="/evolution/research">
              Research · Neuroplasticity, patterns & open questions ↗
            </a>
            <a
              href={consultationHref({ harness: change.target, feature: 'F5' })}
            >
              Discuss governed improvement with Planeon ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
