/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import { Surface } from './VisualPrimitives';
import { changes } from '@/data/operating.v1';
import { byId, consultationHref } from '@/lib/harness';
import { useUrlState } from '@/lib/url-state';
const stages = [
  {
    id: 'proposal',
    name: 'Proposal',
    owner: 'Proposer · human or optimizer',
    detail:
      'Create an isolated candidate with a parent version and declared change envelope. A proposed improvement is not evidence of improvement.',
  },
  {
    id: 'evaluation',
    name: 'Independent evaluation',
    owner: 'Evaluation + Security',
    detail:
      'Run held-out, retained-task and adversarial checks. Check the protected boundaries. The proposer cannot approve its own results.',
  },
  {
    id: 'authorization',
    name: 'Authorization',
    owner: 'Governance',
    detail:
      'An authorized reviewer or pre-authorized policy approves this exact candidate, scope and evidence record. Missing or failed evidence means hold.',
  },
  {
    id: 'rollout',
    name: 'Controlled rollout',
    owner: 'Target owner + Compute',
    detail:
      'Promote the approved artifact through shadow or bounded canary exposure, with the prior compatible version available.',
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    owner: 'Observability + Evaluation',
    detail:
      'Compare verified outcomes and protected controls. Withdraw a regressing candidate; new signals may seed a new proposal, never bypass approval.',
  },
];
export function EvolutionFlow() {
  const { params, update } = useUrlState();
  const change =
    changes.find((c) => c.id === params.get('change')) ?? changes[0];
  const stage = stages.find((s) => s.id === params.get('stage')) ?? stages[0];
  const branch = ['reject', 'withdraw', 'recover'].includes(
    params.get('branch') ?? '',
  )
    ? params.get('branch')
    : null;
  const target = byId(change.target)!;
  return (
    <div className="evolution-workspace section-shell">
      <header className="workspace-heading">
        <p className="eyebrow">Evolution / Governed adaptation</p>
        <h1>
          Improve the system.
          <br />
          Keep control of the change.
        </h1>
        <p>
          A useful adaptation loop separates the candidate, the evidence and the
          authority to release it. This is a reference architecture—not a claim
          that Planeon runs self-improving production agents.
        </p>
      </header>
      <div className="change-picker" aria-label="Example change">
        {changes.map((c) => (
          <button
            key={c.id}
            aria-pressed={c.id === change.id}
            onClick={() =>
              update({ change: c.id, stage: 'proposal', branch: null })
            }
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="change-proposal">{change.proposal}</p>
      <div
        className="governed-flow"
        aria-label="Proposal passes through independent evaluation and governance before reaching its target"
      >
        <div className="flow-lane-labels">
          <span>Propose</span>
          <span>Independent assurance & authority</span>
          <span>Approved target & feedback</span>
        </div>
        <ol>
          {stages.map((s, i) => (
            <li key={s.id}>
              <button
                aria-pressed={stage.id === s.id && !branch}
                onClick={() => update({ stage: s.id, branch: null })}
              >
                <span className="flow-step-number">0{i + 1}</span>
                <strong>{s.name}</strong>
                <small>{s.owner}</small>
              </button>
              {i < 4 && (
                <span className="flow-next" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="flow-branches">
          <button
            aria-pressed={branch === 'reject'}
            onClick={() => update({ stage: 'evaluation', branch: 'reject' })}
          >
            ↓ Reject / revise candidate
          </button>
          <button
            aria-pressed={branch === 'withdraw'}
            onClick={() => update({ stage: 'rollout', branch: 'withdraw' })}
          >
            ↓ Withdraw canary
          </button>
          <button
            aria-pressed={branch === 'recover'}
            onClick={() => update({ stage: 'monitoring', branch: 'recover' })}
          >
            ↶ Recover approved state
          </button>
        </div>
        <div className="flow-feedback">
          Monitoring → evidence for the next proposal. Every new candidate goes
          through the gates again.
        </div>
      </div>
      <Surface className="evolution-evidence-surface">
        <div className="evolution-detail" aria-live="polite">
          <div>
            <p className="eyebrow">
              {branch ? 'Recovery / rejection path' : stage.owner}
            </p>
            <h2>
              {branch === 'reject'
                ? 'A failed candidate stays isolated.'
                : branch === 'withdraw'
                  ? 'Stop exposing the canary.'
                  : branch === 'recover'
                    ? 'Restore state deliberately.'
                    : stage.name}
            </h2>
            <p>
              {branch === 'reject'
                ? 'Preserve the evaluation record and reasons. Revise the candidate or stop; a better average score cannot compensate for a failed protected control.'
                : branch === 'withdraw'
                  ? 'Stop new canary work and route eligible tasks to the last approved version. Inspect in-flight tasks and any effects already committed.'
                  : branch === 'recover'
                    ? change.recovery
                    : stage.detail}
            </p>
          </div>
          <aside>
            <p className="control-label">
              Harness receiving the approved version
            </p>
            <a href={target.href}>
              {target.number} · {target.shortName} ↗
            </a>
            <p>
              Governance owns promotion authority. Evaluation supplies evidence.
              Security constrains permitted changes.
            </p>
          </aside>
        </div>
      </Surface>
      <section className="change-envelope" id="change-envelope">
        <div className="section-number">
          CHANGE ENVELOPE / {change.name.toUpperCase()}
        </div>
        <h2>What is allowed to change?</h2>
        <dl>
          <div>
            <dt>Mutable surface</dt>
            <dd>{change.mutable}</dd>
          </div>
          <div>
            <dt>Protected boundaries</dt>
            <dd>{change.protected}</dd>
          </div>
          <div>
            <dt>Required validation</dt>
            <dd>{change.validation}</dd>
          </div>
          <div>
            <dt>Approval authority</dt>
            <dd>{change.authority}</dd>
          </div>
          <div>
            <dt>Resource limits</dt>
            <dd>{change.budget}</dd>
          </div>
          <div>
            <dt>Monitoring and recovery</dt>
            <dd>{change.recovery}</dd>
          </div>
        </dl>
        <p className="reference-caveat">
          An architectural template, not automatic regulatory compliance.
          Adaptation permission, AML maturity, implementation readiness and
          research maturity are different concepts. Evolution crosses the
          existing planes; it is not a seventeenth harness.
        </p>
      </section>
      <div className="evolution-connections">
        <section>
          <h3>Evidence required for this change</h3>
          <div className="reference-links">
            {change.features.map((id) => (
              <a key={id} href={`/maturity?feature=${id}`}>
                {id} · Inspect the requirement ↗
              </a>
            ))}
          </div>
        </section>
        <section>
          <h3>Version, operate and assess</h3>
          <div className="reference-links">
            <a href={`/blueprint?artifact=${change.artifact}#release-bundle`}>
              Related release artifact ↗
            </a>
            <a href="/evolution/research">
              Research, analogy and open questions ↗
            </a>
            <a
              href={consultationHref({ harness: change.target, feature: 'F5' })}
            >
              Review the change boundary with Planeon ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
