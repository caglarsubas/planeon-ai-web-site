import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import content from '@/data/content.json';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);

export function generateStaticParams() {
  return harnesses.map((harness) => ({ n: String(harness.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const harness = harnesses.find((item) => item.n === Number(n));
  if (!harness) return { title: 'Harness not found' };
  return {
    title: `${harness.n} · ${harness.name}`,
    description: harness.mandate,
    openGraph: { title: `${harness.n} · ${harness.name}`, description: harness.mandate, images: [] },
    twitter: { card: 'summary', title: `${harness.n} · ${harness.name}`, description: harness.mandate, images: [] },
  };
}

export default async function HarnessPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const harness = harnesses.find((item) => item.n === Number(n));
  if (!harness) notFound();
  const plane = content.planes[harness.plane as keyof typeof content.planes];
  const related = [...harness.up, ...harness.down, ...harness.cross];
  const previous = harnesses[harness.n - 2];
  const next = harnesses[harness.n];

  return (
    <main className={`harness-detail plane-${harness.plane}`}>
      <SiteHeader />
      <article>
        <header className="harness-hero section-shell">
          <div className="harness-orbit" aria-hidden="true"><span>{String(harness.n).padStart(2, '0')}</span></div>
          <div>
            <p className="eyebrow">{plane.label} / {harness.tier} / Phase {harness.phase}</p>
            <h1>{harness.name}</h1>
            <p className="harness-question">{harness.q}</p>
            <p className="harness-mandate">{harness.mandate}</p>
          </div>
        </header>

        <div className="detail-layout section-shell">
          <aside className="detail-index" aria-label="On this page">
            <span>HARNESS {String(harness.n).padStart(2, '0')}</span>
            <a href="#owns">Owns</a><a href="#interfaces">Interfaces</a><a href="#accountability">Accountability</a><a href="#evidence">Evidence</a><a href="#risks">Risks</a><a href="#stack">Reference stack</a>
          </aside>
          <div className="detail-content">
            <section id="owns"><div className="section-number">01 / WHAT THIS BOUNDARY OWNS</div><ul className="statement-list">{harness.owns.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section id="interfaces"><div className="section-number">02 / INTEGRATION POINTS</div><div className="interface-list">{related.map((item, index) => {
              const target = harnesses.find((candidate) => candidate.n === item.h);
              return <Link prefetch={false} key={`${item.h}-${index}`} href={`/blueprint/${item.h}`}><span>{String(item.h).padStart(2, '0')}</span><div><b>{target?.name}</b><p>{item.why}</p></div><span aria-hidden="true">↗</span></Link>;
            })}</div></section>
            <section id="accountability"><div className="section-number">03 / ENTERPRISE ACCOUNTABILITY</div><p className="accountable-owner">{harness.deptAcc}</p><ul className="role-list">{harness.roles.map((role) => <li key={role}>{role}</li>)}</ul><p className="recommendation-note">Architectural recommendation, not a research finding.</p></section>
            <section id="evidence"><div className="section-number">04 / WHAT DONE LOOKS LIKE</div><blockquote>{harness.phaseNote}</blockquote><h3>Signals to watch</h3><ul className="signal-list">{harness.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></section>
            <section id="risks"><div className="section-number">05 / FAILURE MODES</div><ol className="risk-list">{harness.risks.map((risk) => <li key={risk}>{risk}</li>)}</ol></section>
            <section id="stack"><div className="section-number">06 / REFERENCE LANDSCAPE</div><p className="review-date">Tool and standards snapshot · last reviewed approximately mid-2026</p><div className="stack-grid"><div><h3>Open source</h3><ul>{harness.oss.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Managed</h3><ul>{harness.managed.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Standards</h3><ul>{harness.standards.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
            <section className="editorial-note"><div className="section-number">ARCHITECTURE NOTE</div><p>{harness.note}</p></section>
          </div>
        </div>
      </article>
      <nav className="harness-pagination section-shell" aria-label="Harness pages">
        {previous ? <Link prefetch={false} href={`/blueprint/${previous.n}`}><span>Previous</span>{String(previous.n).padStart(2, '0')} · {previous.name}</Link> : <span />}
        {next ? <Link prefetch={false} href={`/blueprint/${next.n}`}><span>Next</span>{String(next.n).padStart(2, '0')} · {next.name}</Link> : <Link prefetch={false} href="/blueprint"><span>Next</span>Return to blueprint</Link>}
      </nav>
      <SiteFooter />
    </main>
  );
}
