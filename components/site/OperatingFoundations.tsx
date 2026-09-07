/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import {
  operationalResponsibilities,
  releaseArtifacts,
} from '@/data/operating.v1';
import { byId } from '@/lib/harness';
import { useUrlState } from '@/lib/url-state';
import { Surface } from './VisualPrimitives';

export function OpsComparison({ compact = false }: { compact?: boolean }) {
  return (
    <Surface className={`ops-comparison${compact ? ' compact' : ''}`}>
      <div className="ops-rows">
        {operationalResponsibilities.map((op, i) => (
          <div key={op.name}>
            <span className="ops-index">0{i + 1}</span>
            <h3>{op.name}</h3>
            <div>
              <strong>{op.focus}</strong>
              {!compact && <p>{op.responsibilities}</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="reference-caveat">
        Responsibilities accumulate where applicable. This is a useful operating
        model, not a requirement that every agent deploy every capability from
        every era.
        {compact && (
          <>
            {' '}
            <a href="/blueprint#operating-responsibilities">
              Explore the operating foundations ↗
            </a>
          </>
        )}
      </p>
    </Surface>
  );
}
export function ReleaseBundle() {
  const { params, update } = useUrlState();
  const artifact =
    releaseArtifacts.find((a) => a.id === params.get('artifact')) ??
    releaseArtifacts[0];
  const owner = byId(artifact.owner)!;
  return (
    <section className="release-bundle section-shell" id="release-bundle">
      <div className="section-number">A REPRODUCIBLE RELEASE</div>
      <h2>
        Version the system.
        <br />
        Not just the model.
      </h2>
      <p>
        One release manifest links the artifacts, their provenance and the
        authority that approved them. Select an artifact to inspect its
        ownership and recovery implications.
      </p>
      <div className="release-layout">
        <Surface className="release-manifest">
          <header>
            <span>RELEASE MANIFEST</span>
            <small>Immutable references · compatible versions</small>
          </header>
          <div>
            {releaseArtifacts.map((a, i) => (
              <button
                key={a.id}
                aria-pressed={a.id === artifact.id}
                onClick={() => update({ artifact: a.id })}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {a.name}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </Surface>
        <Surface>
          <article className="inline-evidence" aria-live="polite">
            <p className="eyebrow">Selected artifact</p>
            <h3>{artifact.name}</h3>
            <dl>
              <dt>Accountable boundary</dt>
              <dd>
                <a href={owner.href}>
                  {owner.number} · {owner.shortName} ↗
                </a>
              </dd>
              <dt>Version and provenance</dt>
              <dd>{artifact.version}</dd>
              <dt>Evidence</dt>
              <dd>{artifact.evidence}</dd>
              <dt>Recovery</dt>
              <dd>{artifact.recovery}</dd>
            </dl>
            <a className="text-link" href="/maturity?feature=F9">
              F9 · Reproducible release evidence ↗
            </a>
          </article>
        </Surface>
      </div>
    </section>
  );
}
