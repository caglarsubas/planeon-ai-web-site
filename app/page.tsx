import Link from 'next/link';
import content from '@/data/content.json';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

const planeOrder = ['runtime', 'knowledge', 'execution', 'trust'] as const;

function OnionMini() {
  return (
    <figure className="onion-mini" aria-label="Four concern groupings surround the model core: runtime, knowledge, execution, and trust.">
      <span className="onion-ring onion-trust" />
      <span className="onion-ring onion-execution" />
      <span className="onion-ring onion-knowledge" />
      <span className="onion-ring onion-runtime" />
      <span className="onion-core">MODEL</span>
    </figure>
  );
}

export default function Home() {
  const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);

  return (
    <main>
      <SiteHeader />

      <section className="hero section-shell">
        <div className="eyebrow">Enterprise multi-agent systems</div>
        <h1>The model was <span className="signal-text">never the hard part.</span></h1>
        <p className="hero-copy">
          Sixteen harnesses turn a capable model into an enterprise system that can be operated, governed, and trusted.
        </p>
        <div className="hero-actions">
          <Link prefetch={false} className="button-primary" href="/blueprint">Read the blueprint <span aria-hidden="true">↗</span></Link>
          <Link prefetch={false} className="text-link" href="/journey">Follow one task end to end</Link>
        </div>
        <div className="hero-index" aria-label="Blueprint contents">
          <span>04 concern planes</span><span>16 harnesses</span><span>43 exchanges</span><span>01 governable system</span>
        </div>
      </section>

      <section className="evidence-strip section-shell" aria-labelledby="evidence-title">
        <div className="section-number" id="evidence-title">RESEARCH SNAPSHOT / REVIEWED 01 SEP 2026</div>
        <div className="evidence-grid">
          <article><strong>47.1%</strong><p>of deployed enterprise agents actively monitored and secured in Gravitee’s 2026 survey.</p><a href="https://www.gravitee.io/hubfs/Downloadable%20Resource/state_of_ai_agent_security_report_pdf_2026.pdf">Primary report ↗</a></article>
          <article><strong>68%</strong><p>of organisations unable to clearly separate agent activity from human activity.</p><a href="https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/ai-agent-identity-nvd-visibility-crisis-v1-csa-styled.pdf">CSA research ↗</a></article>
          <article><strong>15×</strong><p>the tokens of a chat interaction for one observed production multi-agent research system.</p><a href="https://www.anthropic.com/engineering/multi-agent-research-system">Anthropic engineering ↗</a></article>
          <article><strong>2 / 43</strong><p>exchanges in this reference task that touch the model itself; the rest belong to the harness.</p><Link prefetch={false} href="/journey">Trace the task ↗</Link></article>
        </div>
      </section>

      <section className="argument-grid section-shell" aria-labelledby="engine-title">
        <div className="argument-copy">
          <div className="section-number">01 / THE IDEA IN ONE PICTURE</div>
          <h2 id="engine-title">The model is the engine.<br />The harness is the vehicle.</h2>
          <p>
            Intelligence is only one component. Around it sit the runtime, knowledge, execution, and trust concerns that let an enterprise put real work—and real consequences—through the system.
          </p>
          <p className="diagram-note">
            The rings group concerns. They do not imply priority, containment, or dependency.
          </p>
        </div>
        <OnionMini />
      </section>

      <section className="exchange-section section-shell" aria-labelledby="exchange-title">
        <div className="section-number">02 / TWO OF FORTY-THREE</div>
        <div className="exchange-heading">
          <h2 id="exchange-title">Only two exchanges touch the model.</h2>
          <p>Everything else establishes identity, context, authority, evidence, safety, continuity, cost, and accountability.</p>
        </div>
        <div className="dot-field" aria-label="Forty-three exchanges; steps sixteen and seventeen touch the model.">
          {Array.from({ length: 43 }, (_, index) => (
            <span key={index} className={index === 15 || index === 16 ? 'model-dot' : ''} title={`Step ${index + 1}`}>
              <b>{String(index + 1).padStart(2, '0')}</b>
            </span>
          ))}
        </div>
      </section>

      <section className="blueprint-glance section-shell" aria-labelledby="glance-title">
        <div className="section-number">03 / THE BLUEPRINT AT A GLANCE</div>
        <h2 id="glance-title">Four concerns. Sixteen accountable boundaries.</h2>
        <div className="plane-columns">
          {planeOrder.map((plane) => (
            <section key={plane} className={`plane-column plane-${plane}`}>
              <h3>{content.planes[plane].label}</h3>
              <ol>
                {harnesses.filter((h) => h.plane === plane).map((harness) => (
                  <li key={harness.n}>
                    <Link prefetch={false} href={`/blueprint/${harness.n}`}>
                      <span>{String(harness.n).padStart(2, '0')}</span>{harness.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>

      <section className="reader-paths section-shell" aria-labelledby="reader-title">
        <div className="section-number">04 / CHOOSE YOUR READING DEPTH</div>
        <h2 id="reader-title">One architecture. Three ways in.</h2>
        <div className="reader-grid">
          <Link prefetch={false} href="/whitepaper"><span>05 min</span><h3>Executive</h3><p>See why pilots stall, what the missing system costs, and what to build first.</p><b>Read the brief ↗</b></Link>
          <Link prefetch={false} href="/blueprint"><span>30 min</span><h3>Architect</h3><p>Review all sixteen boundaries, integration points, ownership, and sequencing.</p><b>Open the blueprint ↗</b></Link>
          <Link prefetch={false} href="/explorer"><span>Reference</span><h3>Engineer</h3><p>Inspect the detailed contracts, signals, standards, and end-to-end exchanges.</p><b>Use the explorer ↗</b></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
