/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import content from '@/data/content.json';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

const planeOrder = ['runtime', 'knowledge', 'execution', 'trust'] as const;
const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);
const planeGeometry = [
  {
    plane: 'knowledge', label: 'Knowledge plane', inner: 70, outer: 170,
    items: [
      { number: 13, sourceId: 5, shortName: 'Domain' },
      { number: 14, sourceId: 6, shortName: 'Data' },
      { number: 15, sourceId: 7, shortName: 'Retrieval' },
      { number: 16, sourceId: 8, shortName: 'Memory' },
    ],
  },
  {
    plane: 'execution', label: 'Execution plane', inner: 170, outer: 270,
    items: [
      { number: 9, sourceId: 9, shortName: 'Protocol' },
      { number: 10, sourceId: 10, shortName: 'Orchestration' },
      { number: 11, sourceId: 11, shortName: 'Action' },
      { number: 12, sourceId: 12, shortName: 'ML' },
    ],
  },
  {
    plane: 'trust', label: 'Trust plane', inner: 270, outer: 370,
    items: [
      { number: 5, sourceId: 13, shortName: 'Secure&Safe' },
      { number: 6, sourceId: 14, shortName: 'Governance' },
      { number: 7, sourceId: 15, shortName: 'Observability' },
      { number: 8, sourceId: 16, shortName: 'Evaluation' },
    ],
  },
  {
    plane: 'runtime', label: 'Runtime plane', inner: 370, outer: 470,
    items: [
      { number: 1, sourceId: 1, shortName: 'Compute' },
      { number: 2, sourceId: 2, shortName: 'Model' },
      { number: 3, sourceId: 3, shortName: 'Gateway' },
      { number: 4, sourceId: 4, shortName: 'Interaction' },
    ],
  },
] as const;
const planeLegend = [...planeGeometry].reverse();

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
          {planeGeometry.map(({ plane, inner, outer, items }) => {
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
                {items.map((item, index) => {
                  const position = pointOnCircle(middle, labelAngles[index]);

                  return (
                    <g key={item.number} transform={`translate(${position.x} ${position.y})`}>
                      <text
                        className={`onion-harness-label onion-harness-${String(item.number).padStart(2, '0')}`}
                        textAnchor="middle"
                      >
                        <tspan className="onion-harness-number" x="0" dy="-7">{item.number}</tspan>
                        <tspan className="onion-harness-short-name" x="0" dy="24">{item.shortName}</tspan>
                        </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {planeGeometry.map(({ plane, label }) => (
          <span key={plane} className={`onion-plane-name onion-plane-name-${plane}`} aria-hidden="true">
            {label}
          </span>
        ))}
        <span className="onion-core" aria-hidden="true">MODEL</span>
      </div>
      <div className="onion-harness-ledger" aria-label="Harness legend">
        {planeLegend.map(({ plane, label, items }) => (
          <section key={plane} className={`onion-ledger-plane onion-ledger-${plane}`}>
            <h3>{label}</h3>
            <div className="onion-legend-entries">
              {items.map((item) => {
                const harness = harnesses.find((candidate) => candidate.n === item.sourceId)!;

                return (
                  <details key={item.number} className="onion-legend-entry">
                    <summary>
                      <span className="onion-legend-number">{item.number}</span>
                      <span className="onion-legend-summary-copy">
                        <strong>{item.shortName}</strong>
                        <small>{harness.q}</small>
                      </span>
                      <span className="onion-legend-toggle" aria-hidden="true">+</span>
                    </summary>
                    <div className="onion-legend-detail">
                      <p>{harness.mandate}</p>
                      <h4>Ingredients</h4>
                      <ul>
                        {harness.owns.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
                      </ul>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <figcaption className="sr-only">
        The model remains fixed at the center. Four concern planes appear from the inside out: Knowledge, Execution, Trust, and Runtime. Each plane then divides into four equal segments with shortened harness names. The legend provides each harness explanation and ingredients.
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
