/* oxlint-disable next/no-html-link-for-pages -- Preserve native site navigation. */
'use client';
import { planePaint } from '@/lib/theme';
import type { CSSProperties } from 'react';
import { SearchPicker } from './ReferenceControls';
import { byId, planes } from '@/lib/harness';
import { journeyAtlasHref, journeyMapping } from '@/lib/journey-mapping';
import type { Frame, Occurrence } from '@/lib/scenarios';

const contributionLabels: Record<string, string> = {
  DELIVER_CAPABILITY: 'Delivers capability',
  ENFORCE: 'Enforces the control',
  GOVERN: 'Governs the decision',
  ASSESS: 'Assesses evidence',
  OBSERVE_AND_ACCOUNT: 'Observes and accounts for activity',
  OPERATE_DEPLOYMENT: 'Operates the deployment',
};

export function JourneyMapping({
  frame,
  active,
  scenarioId,
  harnessId,
  featureId,
  onHarness,
  onFeature,
  onPause,
}: {
  frame: Frame;
  active: Occurrence;
  scenarioId: string;
  harnessId?: string;
  featureId?: string | null;
  onHarness: (id: string | null) => void;
  onFeature: (harness: string, feature: string) => void;
  onPause: () => void;
}) {
  const context = journeyMapping(frame, active, harnessId, featureId);
  const { harness, rows, selected } = context;
  const primary = rows.filter((r) => r.role === 'primary');
  const participants = [
    ...new Map(
      [...context.endpoints, ...context.involved].map((h) => [h.id, h]),
    ).values(),
  ];
  const feature = selected?.feature;
  const owner = feature ? byId(feature.primary_accountable_harness) : undefined;
  return (
    <section
      className="journey-aml-mapping"
      aria-labelledby="journey-aml-mapping-title"
    >
      <div className="journey-aml-mapping-heading">
        <p className="eyebrow">Architecture → Maturity</p>
        <span className="journey-aml-reading-state">
          {context.pinned ? 'Inspection held' : 'Following the walkthrough'}
        </span>
      </div>
      <h3 id="journey-aml-mapping-title">What makes this step dependable?</h3>
      <p className="journey-aml-map-caveat">
        AML means Agentic Maturity Level. These are reference responsibilities
        and expected evidence—not assessed capabilities or passed controls.
      </p>
      <div
        className="journey-aml-participants"
        aria-label="Inspect a harness from this frame"
      >
        {participants.map((h) => (
          <button
            key={h.id}
            aria-pressed={h.id === harness?.id}
            onClick={() => onHarness(h.id)}
            style={
              {
                '--participant-color': planePaint(h.plane).color,
              } as CSSProperties
            }
          >
            <span aria-hidden="true" />
            {h.number} · {h.shortName}
          </button>
        ))}
      </div>
      {context.omitted && (
        <p className="journey-aml-stage-notice">
          This exchange is{' '}
          {active.branchNotTaken ? 'a branch not taken' : 'omitted'}. Its
          mapping is shown for explanation; no action occurs along this path.
          Other handoffs in the frame may still be active.
        </p>
      )}
      {harness && selected && feature && owner ? (
        <>
          <div className="journey-aml-harness-heading">
            <span
              className="journey-aml-harness-number"
              style={{ color: planePaint(harness.plane).color }}
            >
              {String(harness.number).padStart(2, '0')}
            </span>
            <div>
              <p className="control-label">
                {planes[harness.plane].name} ·{' '}
                {context.onStage ? 'In this frame' : 'Reference inspection'}
              </p>
              <h4>{harness.shortName}</h4>
            </div>
          </div>
          <p>{harness.mandate}</p>
          <div className="journey-aml-map-actions">
            <a className="text-link" href={harness.href}>
              Harness responsibilities ↗
            </a>
            {context.pinned && (
              <button className="text-link" onClick={() => onHarness(null)}>
                Follow the walkthrough
              </button>
            )}
          </div>
          <div className="journey-aml-feature-picker" onFocusCapture={onPause}>
            <SearchPicker
              label="Explore this harness’s AML features"
              value={feature.id}
              items={rows.map((r) => ({
                value: r.feature.id,
                label: `${r.feature.id} · ${r.feature.name} · ${r.role === 'primary' ? 'Primary' : 'Contributor'}`,
              }))}
              onChange={(id) => onFeature(harness.id, id)}
            />
          </div>
          <p className="journey-aml-relation-counts">
            <span>◆ {primary.length} primary</span>
            <span>○ {rows.length - primary.length} contributing</span>
            <span>Conditional on the assessment profile</span>
          </p>
          <article
            className="journey-aml-feature"
            key={`${harness.id}:${feature.id}`}
          >
            <div className="journey-aml-feature-heading">
              <span className="journey-aml-feature-code">{feature.id}</span>
              <h4>{feature.name}</h4>
            </div>
            <p className="journey-aml-feature-role">
              {selected.role === 'primary'
                ? `◆ ${harness.shortName} is the primary accountable harness.`
                : `○ ${harness.shortName} contributes. ${contributionLabels[selected.contribution?.role ?? ''] ?? 'Supports this requirement'}.`}
            </p>
            <p>
              <b>Applies when:</b> {feature.applicability}
            </p>
            <details
              onToggle={(event) => {
                if (event.currentTarget.open) onPause();
              }}
            >
              <summary>Responsibilities and mapping conditions</summary>
              <p>
                {selected.role === 'primary'
                  ? feature.primary_accountability
                  : selected.contribution?.condition}
              </p>
              <ul>
                {feature.obligations.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <p>
                <b>Primary owner:</b> {owner.number} · {owner.shortName}.
              </p>
              <div
                className="journey-aml-related-harnesses"
                aria-label={`${feature.id} harness mapping`}
              >
                <button onClick={() => onFeature(owner.id, feature.id)}>
                  ◆ {owner.number} · {owner.shortName}{' '}
                  <span>Primary accountability</span>
                </button>
                {feature.contributors.map((contributor) => {
                  const h = byId(contributor.harness_id)!;
                  return (
                    <button
                      key={h.id}
                      onClick={() => onFeature(h.id, feature.id)}
                    >
                      ○ {h.number} · {h.shortName}
                      <span>
                        {contributionLabels[contributor.role] ?? 'Contributor'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </details>
            <div className="journey-aml-expected-evidence">
              <h5>Evidence to look for</h5>
              <p>{feature.acceptance_evidence}</p>
            </div>
            <a
              className="text-link"
              href={journeyAtlasHref({
                scenario: scenarioId,
                occurrence: active.id,
                harness: harness.id,
                feature: feature.id,
              })}
            >
              Open {feature.id} and its complete mapping ↗
            </a>
          </article>
        </>
      ) : (
        <p>
          This exchange has no mapped harness endpoint. Select a named onion
          slice to inspect its reference responsibilities.
        </p>
      )}
      <p className="journey-aml-map-footnote">
        Features are selected from the existing harness mapping, not inferred as
        active controls from an animation. Select a harness or feature to pause
        and read; Play resumes automatic following.
      </p>
    </section>
  );
}
