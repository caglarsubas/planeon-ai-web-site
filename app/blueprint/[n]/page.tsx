/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFrame } from '@/components/site/SiteFrame';
import { harnesses, bySource, planes, consultationHref } from '@/lib/harness';
import { featuresForHarness } from '@/lib/aml';
import { adaptationBoundaries } from '@/data/operating.v1';
export function generateStaticParams() {
  return harnesses.map((h) => ({ n: String(h.sourceId) }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const h = bySource(Number(n));
  if (!h) return { title: 'Harness not found' };
  return {
    title: `${h.number} · ${h.name}`,
    description: h.mandate,
    openGraph: { title: h.name, description: h.mandate, images: [] },
    twitter: {
      card: 'summary',
      title: h.name,
      description: h.mandate,
      images: [],
    },
  };
}
export default async function HarnessPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const h = bySource(Number(n));
  if (!h) notFound();
  const related = [...h.up, ...h.down, ...h.cross],
    features = featuresForHarness(h.id);
  const previous = harnesses[h.number - 2],
    next = harnesses[h.number];
  return (
    <SiteFrame className={`harness-detail plane-${h.plane}`}>
      <article>
        <header className="harness-hero section-shell">
          <div className="harness-orbit" aria-hidden="true">
            <span>{String(h.number).padStart(2, '0')}</span>
          </div>
          <div>
            <p className="eyebrow">
              {planes[h.plane].name} / Phase {h.phase}
            </p>
            <h1>{h.name}</h1>
            <p className="harness-question">{h.q}</p>
            <p className="harness-mandate">{h.mandate}</p>
            <a className="text-link" href={`/journey?mode=design&harness=${h.id}`}>Use this harness in my journey →</a>
          </div>
        </header>
        <div className="detail-layout section-shell">
          <aside className="detail-index" aria-label="On this page">
            <span>HARNESS {String(h.number).padStart(2, '0')}</span>
            <a href="#owns">Responsibilities</a>
            <a href="#interfaces">Interfaces</a>
            <a href="#evidence">Evidence</a>
            <a href="#adaptation">Adaptation boundaries</a>
            <a href="#stack">References</a>
          </aside>
          <div className="detail-content surface-shell">
            <div className="surface-core">
              <section id="owns">
                <div className="section-number">01 / RESPONSIBILITIES</div>
                <ul className="statement-list">
                  {h.owns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3 id="accountability">Accountable owner</h3>
                <p className="accountable-owner">{h.deptAcc}</p>
                <ul className="role-list">
                  {h.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
                <p className="recommendation-note">
                  Ownership and phase are architectural recommendations, not
                  assessed results.
                </p>
              </section>
              <section id="interfaces">
                <div className="section-number">02 / INTERFACES</div>
                <div className="interface-list">
                  {related.map((item, i) => {
                    const target = bySource(item.h)!;
                    return (
                      <a key={`${item.h}-${i}`} href={target.href}>
                        <span>{String(target.number).padStart(2, '0')}</span>
                        <div>
                          <b>{target.name}</b>
                          <p>{item.why}</p>
                        </div>
                        <span aria-hidden="true">↗</span>
                      </a>
                    );
                  })}
                </div>
              </section>
              <section id="evidence">
                <div className="section-number">03 / EVIDENCE</div>
                <blockquote>{h.phaseNote}</blockquote>
                <h3>Signals to watch</h3>
                <ul className="signal-list">
                  {h.signals.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <h3>Related AML reference requirements</h3>
                <p>
                  These relationships identify where to obtain evidence. They do
                  not demonstrate that this harness has passed an assessment.
                </p>
                <div className="reference-links">
                  {features.map((f) => (
                    <a
                      key={f.id}
                      href={`/maturity?feature=${f.id}&harness=${h.id}`}
                    >
                      {f.id} · {f.name} —{' '}
                      {f.primary_accountable_harness === h.id
                        ? 'primary'
                        : 'contributor'}{' '}
                      ↗
                    </a>
                  ))}
                </div>
              </section>
              <section id="adaptation">
                <div className="section-number">04 / ADAPTATION BOUNDARIES</div>
                <p>{adaptationBoundaries[h.id]}</p>
                <a className="text-link" href="/evolution">
                  How governed change crosses the architecture ↗
                </a>
                <h3 id="risks">Failure modes</h3>
                <ol className="risk-list">
                  {h.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ol>
              </section>
              <section id="stack">
                <div className="section-number">05 / REFERENCES</div>
                <p className="review-date">
                  Existing tool and standards snapshot · approximately mid-2026.
                  Examples, not required dependencies; verify current versions
                  before adoption.
                </p>
                <div className="stack-grid">
                  <div>
                    <h3>Open source</h3>
                    <ul>
                      {h.oss.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Managed</h3>
                    <ul>
                      {h.managed.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Standards</h3>
                    <ul>
                      {h.standards.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="reference-links">
                  <a
                    href={`https://github.com/caglarsubas/harness-onion/blob/7047ec93170d5db8a148d1f6cfd34ad7877fb423/docs/harnesses/${h.id}.md`}
                  >
                    Pinned harness specification ↗
                  </a>
                  <a href="/evolution/research#sources">
                    Research and provenance ↗
                  </a>
                  <a href={consultationHref({ harness: h.id })}>
                    Discuss this boundary with Planeon ↗
                  </a>
                </div>
                <p>{h.note}</p>
              </section>
            </div>
          </div>
        </div>
      </article>
      <nav
        className="harness-pagination section-shell"
        aria-label="Harness pages"
      >
        {previous ? (
          <a href={previous.href}>
            <span>Previous</span>
            {previous.number} · {previous.shortName}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={next.href}>
            <span>Next</span>
            {next.number} · {next.shortName}
          </a>
        ) : (
          <a href="/blueprint">Return to blueprint</a>
        )}
      </nav>
    </SiteFrame>
  );
}
