import type { Metadata } from 'next';
/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import content from '@/data/content.json';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { Term } from '@/components/site/Term';
import { harnesses } from '@/lib/harness';

export const metadata: Metadata = {
  title: 'Whitepaper — The Enterprise MAS Blueprint',
  description:
    'A vendor-neutral field guide to the sixteen harnesses around an enterprise multi-agent system.',
  other: { 'article:modified_time': '2026-09-01T00:00:00+08:00' },
};

export default function WhitepaperPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'The Enterprise Multi-Agent Systems Blueprint',
    dateModified: '2026-09-01',
    author: { '@type': 'Organization', name: 'Planeon' },
    description:
      'A vendor-neutral field guide to the sixteen harnesses around an enterprise multi-agent system.',
  };
  return (
    <main>
      <SiteHeader />
      <article className="whitepaper section-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <header className="whitepaper-cover">
          <div className="surface-shell">
            <div className="surface-core">
              <div>
                <p>PLANEON FIELD NOTE / 01</p>
                <span>Last reviewed 01 September 2026</span>
              </div>
              <h1>The enterprise multi-agent systems blueprint.</h1>
              <p>
                Sixteen boundaries that turn a capable model into a system an
                enterprise can operate, govern, and trust.
              </p>
              <a
                className="button-primary"
                href="/downloads/planeon-enterprise-mas-blueprint.pdf"
                download
              >
                Download the PDF{' '}
                <span className="arrow-island" aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
          </div>
        </header>
        <div className="whitepaper-body">
          <aside>
            <span>CONTENTS</span>
            <a href="#thesis">01 / Thesis</a>
            <a href="#planes">02 / Four concerns</a>
            <a href="#harnesses">03 / Sixteen harnesses</a>
            <a href="#sequence">04 / The sequence</a>
            <a href="#build">05 / Build order</a>
            <a href="#provenance">06 / Provenance</a>
          </aside>
          <div>
            <section id="thesis">
              <div className="section-number">01 / THESIS</div>
              <h2>The model is necessary. It is not the system.</h2>
              <p>
                A production agent is a chain of identity, interpretation,
                retrieval, reasoning, authority, action, memory, evidence, and
                feedback. Most failures arrive in the joins: a missing{' '}
                <Term id="workload identity">workload identity</Term>, a retry
                without <Term id="idempotency">idempotency</Term>, retrieved
                text treated as instruction, or a release gate that consumes
                opinion instead of evidence.
              </p>
              <p>
                The blueprint makes those joins explicit. It does not prescribe
                one platform or vendor. It names the jobs that fail differently,
                change at different speeds, or answer to different owners.
              </p>
            </section>
            <section id="planes">
              <div className="section-number">02 / FOUR CONCERNS</div>
              <h2>Group by concern, not hierarchy.</h2>
              <div className="whitepaper-planes">
                {Object.entries(content.planes).map(([id, plane]) => (
                  <div key={id} className={`plane-${id}`}>
                    <span>{plane.label}</span>
                    <p>
                      {id === 'runtime'
                        ? 'Where it runs, how models are served, how requests enter and leave.'
                        : id === 'knowledge'
                          ? 'What the system knows, may retrieve, and earns the right to remember.'
                          : id === 'execution'
                            ? 'How work is planned, continued, standardised, isolated, and completed.'
                            : 'Who or what is permitted, how evidence is gathered, and how change is governed.'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section id="harnesses">
              <div className="section-number">03 / SIXTEEN HARNESSES</div>
              <h2>Every boundary needs an owner and proof.</h2>
              {harnesses.map((harness) => (
                <section
                  key={harness.n}
                  className={`whitepaper-harness plane-${harness.plane}`}
                >
                  <span>{String(harness.number).padStart(2, '0')}</span>
                  <div>
                    <h3>
                      <a href={`/blueprint/${harness.n}`}>{harness.name}</a>
                    </h3>
                    <p>{harness.mandate}</p>
                    <b>{harness.deptAcc}</b>
                  </div>
                </section>
              ))}
            </section>
            <section id="sequence">
              <div className="section-number">04 / ONE TASK END TO END</div>
              <h2>Only two of forty-three exchanges touch the model.</h2>
              <p>
                The reference sequence follows a task from an authenticated
                channel to governed data, a pinned model, a policy gate, a typed
                tool, memory write-back, a validated response, and a lifecycle
                loop. Steps 16 and 17 are one request/response pair crossing the
                model core, not two invocations. This is a canonical teaching
                example, not a universal scenario count. Continuous monitoring
                and offline improvement are separate from the live task.
              </p>
              <a className="text-link" href="/journey">
                Walk the complete sequence ↗
              </a>
            </section>
            <section id="build">
              <div className="section-number">05 / BUILD ORDER</div>
              <h2>Start with what must be true before autonomy.</h2>
              {content.buildPhases.map((phase) => (
                <div key={phase.id} className="whitepaper-phase">
                  <span>0{phase.id}</span>
                  <div>
                    <h3>{phase.name}</h3>
                    <p>{phase.blurb}</p>
                    <p>
                      {harnesses
                        .filter((h) => h.phase === phase.id)
                        .map((h) => h.name)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </section>
            <section id="provenance">
              <div className="section-number">06 / PROVENANCE & LIMITS</div>
              <h2>Use the framework critically.</h2>
              <p>{content._provenance}</p>
              <p>
                Enterprise ownership models and build phases are architectural
                recommendations, not research findings. Tier badges reproduce
                the source deck’s MVP-versus-full split; Phase 0–3 is a separate
                sequencing model. Tool lists are a dated landscape, not an
                endorsement.
              </p>
              <p>
                Research snapshot links:{' '}
                <a href="https://www.gravitee.io/hubfs/Downloadable%20Resource/state_of_ai_agent_security_report_pdf_2026.pdf">
                  Gravitee 2026
                </a>{' '}
                ·{' '}
                <a href="https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/ai-agent-identity-nvd-visibility-crisis-v1-csa-styled.pdf">
                  Cloud Security Alliance 2026
                </a>{' '}
                ·{' '}
                <a href="https://www.anthropic.com/engineering/multi-agent-research-system">
                  Anthropic engineering 2025
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
