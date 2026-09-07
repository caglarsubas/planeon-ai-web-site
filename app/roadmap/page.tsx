/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
import type { Metadata } from 'next';
import content from '@/data/content.json';
import {
  PageIntro,
  SiteFooter,
  SiteHeader,
} from '@/components/site/SiteChrome';
import { harnesses } from '@/lib/harness';
import { phaseContracts, operationalDimensions } from '@/data/operating.v1';

export const metadata: Metadata = {
  title: 'Build Roadmap',
  description: 'A four-phase path from foundation to governed scale.',
};

export default function RoadmapPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="Roadmap / Phase 0—3"
        title="Sequence the capability, not the theatre."
        description="The roadmap starts with boundaries that must exist before the first pilot and ends with federation across teams, agents, and regulated workloads. Phase is sequencing; tier is the source deck’s MVP-versus-full distinction. They are not the same thing."
      />
      <section className="roadmap section-shell">
        {content.buildPhases.map((phase) => (
          <article key={phase.id} className={`roadmap-phase phase-${phase.id}`}>
            <div className="surface-shell">
              <div className="surface-core">
                <header>
                  <span>0{phase.id}</span>
                  <div>
                    <p>{phase.blurb}</p>
                    <h2>{phase.name}</h2>
                  </div>
                </header>
                <dl className="roadmap-contract">
                  {Object.entries(phaseContracts[phase.id]).map(
                    ([key, text]) => (
                      <div key={key}>
                        <dt>
                          {
                            {
                              prerequisite: 'Prerequisite',
                              deliverable: 'Deliverable',
                              evidence: 'Required evidence',
                              condition: 'Advance / hold',
                            }[key]
                          }
                        </dt>
                        <dd>{text}</dd>
                      </div>
                    ),
                  )}
                </dl>
                <div className="roadmap-harnesses">
                  {harnesses
                    .filter((h) => h.phase === phase.id)
                    .map((h) => (
                      <a key={h.id} href={h.href}>
                        <span>{String(h.number).padStart(2, '0')}</span>
                        <div>
                          <h3>{h.name}</h3>
                          <p>{h.phaseNote}</p>
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section
        className="operational-checklist section-shell"
        id="operational-dimensions"
      >
        <div className="section-number">FIVE OPERATING PERSPECTIVES</div>
        <h2>Watch the operation, not only its uptime.</h2>
        <p>
          These are monitoring perspectives, not five new maturity scores.
          Define applicable measures and thresholds for the actual workflow.
        </p>
        <ul>
          {operationalDimensions.map((d) => (
            <li key={d.name}>
              <b>{d.name}</b>
              <span>{d.question}</span>
            </li>
          ))}
        </ul>
        <a className="text-link" href="/assessment">
          Start with a self-reported readiness check ↗
        </a>
      </section>
      <section className="roadmap-coda section-shell">
        <div className="section-number">A USEFUL DEFINITION OF DONE</div>
        <blockquote>
          Each phase is complete when its controls can produce evidence under
          failure—not when the happy-path demo runs once.
        </blockquote>
      </section>
      <SiteFooter />
    </main>
  );
}
