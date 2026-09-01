/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import content from '@/data/content.json';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

const planeOrder = ['runtime', 'knowledge', 'execution', 'trust'] as const;
const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);
const planeGeometry = [
  { plane: 'knowledge', inner: 70, outer: 170, ids: [5, 6, 7, 8] },
  { plane: 'execution', inner: 170, outer: 270, ids: [9, 10, 11, 12] },
  { plane: 'trust', inner: 270, outer: 370, ids: [13, 14, 15, 16] },
  { plane: 'runtime', inner: 370, outer: 470, ids: [4, 3, 1, 2] },
] as const;

function pointOnCircle(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return {
    x: 500 + radius * Math.cos(radians),
    y: 500 + radius * Math.sin(radians),
  };
}

function OnionMini() {
  const labelAngles = [-45, 45, 135, 225];

  return (
    <figure className="onion-mini">
      <div className="onion-visual">
        <svg className="onion-graphic" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
          {planeGeometry.map(({ plane, inner, outer, ids }) => {
            const planeHarnesses = ids.map((id) => harnesses.find((harness) => harness.n === id)!);
            const middle = (inner + outer) / 2;
            const separators = [
              { x1: 500, y1: 500 - inner, x2: 500, y2: 500 - outer },
              { x1: 500 + inner, y1: 500, x2: 500 + outer, y2: 500 },
              { x1: 500, y1: 500 + inner, x2: 500, y2: 500 + outer },
              { x1: 500 - inner, y1: 500, x2: 500 - outer, y2: 500 },
            ];

            return (
              <g key={plane} className={`onion-plane onion-plane-${plane}`}>
                <circle className="onion-plane-fill" cx="500" cy="500" r={middle} strokeWidth={outer - inner} />
                <circle className="onion-plane-edge" cx="500" cy="500" r={outer} />
                <g className={`onion-slicers onion-slicers-${plane}`}>
                  {separators.map((line, index) => (
                    <line key={index} {...line} pathLength="1" />
                  ))}
                </g>
                {planeHarnesses.map((harness, index) => {
                  const position = pointOnCircle(middle, labelAngles[index]);

                  return (
                    <g key={harness.n} transform={`translate(${position.x} ${position.y})`}>
                      <g className={`onion-harness-marker onion-harness-${String(harness.n).padStart(2, '0')}`}>
                        <circle r="27" />
                        <text textAnchor="middle" dominantBaseline="central">
                          {String(harness.n).padStart(2, '0')}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {planeGeometry.map(({ plane }) => (
          <span key={plane} className={`onion-plane-name onion-plane-name-${plane}`} aria-hidden="true">
            {content.planes[plane].label}
          </span>
        ))}
        <span className="onion-core" aria-hidden="true">MODEL</span>
      </div>
      <div className="onion-harness-ledger" aria-hidden="true">
        {planeGeometry.map(({ plane, ids }) => (
          <section key={plane} className={`onion-ledger-plane onion-ledger-${plane}`}>
            <h3>{content.planes[plane].label}</h3>
            <ol>
              {ids.map((id) => harnesses.find((harness) => harness.n === id)!).map((harness) => (
                <li key={harness.n} className={`onion-harness-${String(harness.n).padStart(2, '0')}`}>
                  <span>{String(harness.n).padStart(2, '0')}</span>{harness.name}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <figcaption className="sr-only">
        The model remains fixed at the center. Four concern planes appear around it, then each plane divides into four equal segments for these harnesses: {harnesses.map((harness) => harness.name).join(', ')}.
      </figcaption>
    </figure>
  );
}

export default function Home() {
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
          <a className="button-primary" href="/blueprint">Read the blueprint <span aria-hidden="true">↗</span></a>
          <a className="text-link" href="/journey">Follow one task end to end</a>
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
          <article><strong>2 / 43</strong><p>exchanges in this reference task that touch the model itself; the rest belong to the harness.</p><a href="/journey">Trace the task ↗</a></article>
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
                    <a href={`/blueprint/${harness.n}`}>
                      <span>{String(harness.n).padStart(2, '0')}</span>{harness.name}
                    </a>
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
          <a href="/whitepaper"><span>05 min</span><h3>Executive</h3><p>See why pilots stall, what the missing system costs, and what to build first.</p><b>Read the brief ↗</b></a>
          <a href="/blueprint"><span>30 min</span><h3>Architect</h3><p>Review all sixteen boundaries, integration points, ownership, and sequencing.</p><b>Open the blueprint ↗</b></a>
          <a href="/explorer"><span>Reference</span><h3>Engineer</h3><p>Inspect the detailed contracts, signals, standards, and end-to-end exchanges.</p><b>Use the explorer ↗</b></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
