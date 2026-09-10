/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  maturityLevels,
  maturityLevelSources,
} from '@/data/maturity-levels.v1';
import { findMaturityLevel, maturityEvidenceHref } from '@/lib/maturity-levels';
import { Surface } from './VisualPrimitives';
import type { MaturitySelection } from './MaturityExperience';

export function MaturityLevels({ params, update }: MaturitySelection) {
  const selected = findMaturityLevel(params.get('level'));
  const hasEvidenceSelection = params.has('feature') || params.has('harness');
  return (
    <section
      className="maturity-entry section-shell"
      aria-labelledby="maturity-title"
    >
      <header className="workspace-heading">
        <p className="eyebrow">Agentic Maturity Level / AML</p>
        <h1 id="maturity-title">
          Five levels of
          <br />
          agentic maturity.
        </h1>
        <p>
          Where are you today, and what should improve next? Explore what an
          agent can do at each level, the authority it needs and the evidence
          that would support it. Higher autonomy is not the goal for every
          workflow.
        </p>
      </header>
      <div className="maturity-entry-guide">
        <p>Select a level to explore its capability and boundaries.</p>
        <a href="#evidence-atlas">
          {hasEvidenceSelection
            ? 'Jump to your selected evidence'
            : 'Explore the detailed evidence requirements'}
          <span aria-hidden="true"> ↓</span>
        </a>
      </div>
      <Tabs
        className="maturity-levels"
        value={selected.id}
        onValueChange={(value) =>
          update({ level: findMaturityLevel(String(value)).id })
        }
      >
        <TabsList
          className="maturity-level-rail"
          aria-label="Five maturity levels"
          activateOnFocus={false}
        >
          {maturityLevels.map((level) => (
            <TabsTrigger
              key={level.id}
              id={`maturity-tab-${level.id}`}
              value={level.id}
              className="maturity-level-stop"
              aria-controls={`maturity-panel-${level.id}`}
            >
              <span className="maturity-level-marker">{level.id}</span>
              <span className="maturity-level-name">{level.name}</span>
              <span className="maturity-level-mode">{level.mode}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {maturityLevels.map((level) => (
          <TabsContent
            key={level.id}
            id={`maturity-panel-${level.id}`}
            value={level.id}
            aria-labelledby={`maturity-tab-${level.id}`}
          >
            <Surface className="maturity-level-detail">
              <div className="maturity-level-story">
                <p className="eyebrow">
                  {level.id} / {level.name}
                </p>
                <h2>{level.promise}</h2>
                <p>{level.capability}</p>
                <div className="maturity-example">
                  <span className="control-label">
                    Illustrative retail example
                  </span>
                  <p>{level.example}</p>
                </div>
              </div>
              <div className="maturity-level-boundaries">
                <h3>Authority boundary</h3>
                <p>{level.authority}</p>
                <h3>What would you need to demonstrate?</h3>
                <ul className="maturity-evidence-links">
                  {level.evidence.map((item) => (
                    <li key={item.feature}>
                      <a
                        href={maturityEvidenceHref(
                          params,
                          level.id,
                          item.feature,
                        )}
                      >
                        <span className="maturity-evidence-id">
                          {item.feature}
                        </span>
                        <span>
                          <b>{item.label}</b>
                          <span>{item.question}</span>
                        </span>
                        <span
                          className="maturity-evidence-arrow"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="maturity-curation-note">
                  Curated evidence examples, not a complete level checklist.
                </p>
              </div>
            </Surface>
          </TabsContent>
        ))}
      </Tabs>
      <div className="maturity-reading-note">
        <p>
          <strong>A capability framework, not an assessment result.</strong>{' '}
          Choose the least agency the workflow needs. Higher levels do not
          remove earlier safeguards; quality, security and readiness need
          separate evidence. Selecting a level does not assign a score.
        </p>
        <details className="maturity-source-note">
          <summary>Framework sources &amp; interpretation</summary>
          <p>
            The five names and capability progression follow the supplied decks:
          </p>
          <ul>
            {maturityLevelSources.map((source) => (
              <li key={source.id}>
                <cite>{source.title}</cite>. {source.location}
              </li>
            ))}
          </ul>
          <p>
            Retail examples and links to the 57-family library are Planeon’s
            editorial synthesis, not a source-defined scoring rubric. The decks’
            commercial estimates, timelines and telemetry index are not used as
            maturity thresholds. Controls apply according to workflow risk, not
            only at the first level a deck mentions them.
          </p>
        </details>
      </div>
      <a className="maturity-service-link text-link" href="/services">
        From maturity diagnosis to implementation: work with Planeon ↗
      </a>
    </section>
  );
}
