/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import { Surface } from './VisualPrimitives';
import { lazy, Suspense } from 'react';
import { NativeSelect } from '@/components/ui/native-select';
import { SearchPicker } from './ReferenceControls';
import { ReferenceLoading } from './ReferenceLoading';
import { byId, consultationHref, harnesses, planes } from '@/lib/harness';
import {
  features,
  featuresForHarness,
  findFeature,
  mappingProvenance,
  releaseGates,
} from '@/lib/aml';
import { useUrlState } from '@/lib/url-state';
import selectionIndex from '@/data/reference/selection-index.v1.json';
const Matrix = lazy(() => import('./MaturityMatrix'));

export function MaturityAtlas() {
  const { params, update } = useUrlState();
  const harness = byId(params.get('harness') ?? '');
  const requestedFeature = params.get('feature');
  const feature = findFeature(
    features.some((f) => f.id === requestedFeature)
      ? requestedFeature
      : harness
        ? featuresForHarness(harness.id)[0]?.id
        : null,
  );
  const scenario = selectionIndex.scenarios.find(
    (s) => s.id === params.get('scenario'),
  );
  const domain = ['A', 'B', 'C', 'D', 'E', 'F'].includes(
    params.get('domain') ?? '',
  )
    ? params.get('domain')!
    : 'all';
  const showMatrix = params.get('matrix') === 'open';
  const gate =
    releaseGates.find((g) => g.id === params.get('gate'))?.id ?? 'agency';
  const owner = byId(feature.primary_accountable_harness)!;
  const list = (harness ? featuresForHarness(harness.id) : features).filter(
    (f) => domain === 'all' || f.aml_domain === domain,
  );
  const select = (id: string) =>
    update({
      feature: id,
      domain: null,
      harness:
        harness && featuresForHarness(harness.id).some((f) => f.id === id)
          ? harness.id
          : null,
    });
  return (
    <div className="atlas section-shell">
      <header className="workspace-heading">
        <p className="eyebrow">Maturity Atlas / Target reference model</p>
        <h1>
          Capability needs evidence.
          <br />
          Evidence needs an owner.
        </h1>
        <p>
          Explore 57 feature families across 16 harnesses. One primary
          accountable owner, with contributing boundaries where implementation
          and evidence meet.
        </p>
      </header>
      <p className="reference-caveat">
        This is a target mapping, not an assessment result or a claim of
        deployed capability. The 57 families form a profile-selected library,
        not a universal checklist. A relationship never means a control has
        passed.
      </p>
      <div className="atlas-selectors">
        <SearchPicker
          label="Find a feature"
          items={features.map((f) => ({
            value: f.id,
            label: `${f.id} · ${f.name}`,
          }))}
          value={feature.id}
          onChange={select}
        />
        <label>
          <span className="control-label">Reverse lookup by harness</span>
          <NativeSelect
            value={harness?.id ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              update({
                harness: id || null,
                feature: id
                  ? (featuresForHarness(id)[0]?.id ?? 'A5')
                  : feature.id,
              });
            }}
          >
            <option value="">All 16 harnesses</option>
            {harnesses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.number} · {h.shortName}
              </option>
            ))}
          </NativeSelect>
        </label>
      </div>
      <div className="atlas-layout">
        <aside className="feature-index">
          <Surface>
            <label>
              <span className="control-label">AML domain</span>
              <NativeSelect
                value={domain}
                onChange={(e) =>
                  update({
                    domain: e.target.value === 'all' ? null : e.target.value,
                  })
                }
              >
                <option value="all">All six domains</option>
                {['A', 'B', 'C', 'D', 'E', 'F'].map((d) => (
                  <option key={d} value={d}>
                    Domain {d} ·{' '}
                    {features.filter((f) => f.aml_domain === d).length} families
                  </option>
                ))}
              </NativeSelect>
            </label>
            <p className="small-copy">
              {list.length} matching features
              {harness ? ` involving ${harness.shortName}` : ''}
            </p>
            <div className="feature-list">
              {list.map((f) => (
                <button
                  key={f.id}
                  aria-pressed={f.id === feature.id}
                  onClick={() => select(f.id)}
                >
                  <b>{f.id}</b>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
            {!list.length && (
              <div className="reference-empty" aria-live="polite">
                <p>No features match this domain and harness.</p>
                <button onClick={() => update({ domain: null, harness: null })}>
                  Show all 57 features
                </button>
              </div>
            )}
          </Surface>
        </aside>
        <Surface>
          <article className="feature-detail" aria-live="polite">
            <div className="feature-heading">
              <span className="feature-id">{feature.id}</span>
              <div>
                <p className="eyebrow">
                  Domain {feature.aml_domain} / Reference requirement
                </p>
                <h2>{feature.name}</h2>
              </div>
            </div>
            <p>
              <b>Applies when:</b> {feature.applicability}
            </p>
            <div className="responsibility-map">
              <div
                className="primary-owner"
                style={{ background: planes[owner.plane].tint }}
              >
                <span className="owner-symbol" aria-hidden="true">
                  ◆
                </span>
                <div>
                  <span className="control-label">
                    Primary accountable harness
                  </span>
                  <a href={owner.href}>
                    {owner.number} · {owner.shortName} ↗
                  </a>
                  <p>{feature.primary_accountability}</p>
                </div>
              </div>
              <div className="contributor-heading">
                Contributing harnesses <span aria-hidden="true">↓</span>
              </div>
              <div className="contributor-list">
                {feature.contributors.map((c) => {
                  const h = byId(c.harness_id)!;
                  return (
                    <a
                      key={h.id}
                      href={h.href}
                      style={{ background: planes[h.plane].tint }}
                    >
                      <span aria-hidden="true">○</span>
                      <span>
                        {h.number} · {h.shortName}
                        <small>
                          {c.role.toLowerCase().replaceAll('_', ' ')}
                        </small>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
            <p>{feature.responsibility_split}</p>
            <section className="expected-evidence" id="expected-evidence">
              <p className="eyebrow">Expected evidence / not yet assessed</p>
              <h3>What would substantiate this claim?</h3>
              <p>{feature.acceptance_evidence}</p>
              <ul>
                {feature.obligations.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
            <div className="reference-links">
              <a
                href={`/journey?scenario=${scenario?.id ?? 'retail-address-human'}#step-${feature.id === 'D8' ? 32 : feature.id === 'D7' ? 23 : 19}`}
              >
                Inspect it in the workflow ↗
              </a>
              {['F5', 'F9', 'F10', 'F11', 'B9', 'C6'].includes(feature.id) && (
                <a href="/evolution">Connect to governed adaptation ↗</a>
              )}
              <a
                href={consultationHref({
                  feature: feature.id,
                  harness: harness?.id,
                  scenario: scenario?.id,
                })}
              >
                Bring this evidence question to Planeon ↗
              </a>
            </div>
            <details>
              <summary>Contribution and scoring boundaries</summary>
              <p>{feature.contributors[0]?.condition}</p>
              <p>
                One control result is reused by reference, never counted again
                because it appears under another harness. Existing canonical
                AML, profile-adjusted AML and weighted capability remain
                separate from mandatory-control satisfaction. Zero weight or
                missing evidence cannot establish that a required control is
                satisfied.
              </p>
            </details>
          </article>
        </Surface>
      </div>
      <section className="release-gates">
        <div className="section-number">
          FOUR RELEASE GATES / CURATED LENSES
        </div>
        <h2>Different questions. Distinct evidence.</h2>
        <p>
          These review lenses do not replace AML domains, architecture planes or
          scoring methods.
        </p>
        <div className="gate-buttons">
          {releaseGates.map((g) => (
            <button
              key={g.id}
              aria-pressed={gate === g.id}
              onClick={() => update({ gate: g.id })}
            >
              {g.name}
            </button>
          ))}
        </div>
        {releaseGates
          .filter((g) => g.id === gate)
          .map((g) => (
            <div key={g.id} className="gate-detail">
              <p>{g.explanation}</p>
              <div>
                {g.features.map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      select(id);
                      document
                        .querySelector('.feature-detail')
                        ?.scrollIntoView({ block: 'start' });
                    }}
                  >
                    {id} · {findFeature(id).name} ↗
                  </button>
                ))}
              </div>
            </div>
          ))}
      </section>
      <section className="matrix-section">
        <div className="section-number">COMPLETE RELATIONSHIP REGISTER</div>
        <h2>
          57 primary owners.
          <br />
          298 contributing relationships.
        </h2>
        <p>
          ◆ Primary accountability · ○ Contribution · — No mapped relationship.
          None are pass/fail indicators.
        </p>
        <button
          className="outline-button"
          aria-expanded={showMatrix}
          onClick={() => update({ matrix: showMatrix ? null : 'open' })}
        >
          {showMatrix ? 'Close full matrix' : 'Open all 355 relationships'}
        </button>
        {showMatrix && (
          <Suspense
            fallback={<ReferenceLoading label="Loading the complete matrix…" />}
          >
            <Matrix
              selected={feature.id}
              onSelect={(id) => {
                select(id);
                document
                  .querySelector('.feature-detail')
                  ?.scrollIntoView({ block: 'start' });
              }}
            />
          </Suspense>
        )}
      </section>
      <p className="reference-caveat">
        Mapping revision {mappingProvenance.version}.{' '}
        <a href={mappingProvenance.taxonomy}>Pinned harness taxonomy ↗</a> ·{' '}
        <a href="/evolution/research#sources">
          Source and interpretation boundaries ↗
        </a>
      </p>
    </div>
  );
}
