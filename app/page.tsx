/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import content from '@/data/content.json';
import { SiteFrame } from '@/components/site/SiteFrame';
import { HomeFilm } from '@/components/site/HomeFilm';
import { AnimatedArchitecture } from '@/components/site/AnimatedArchitecture';
import { OpsComparison } from '@/components/site/OperatingFoundations';
import { ActionLabel, Surface } from '@/components/site/VisualPrimitives';
const exchanges = Object.entries(content.sequence.messageMeta)
  .map(([id, message]) => ({ number: Number(id.slice(1)), ...message }))
  .sort((a, b) => a.number - b.number);
export default function Home() {
  return (
    <SiteFrame className="home-page">
      <HomeFilm />
      <section className="hero section-shell" id="home-introduction">
        <div className="eyebrow">Enterprise multi-agent systems</div>
        <h1>
          The model was{' '}
          <span className="signal-text">never the hard part.</span>
        </h1>
        <p className="hero-copy">
          Sixteen harnesses turn a capable model into an enterprise system that
          can be operated, governed and trusted.
        </p>
        <p className="home-intro-copy">
          Planeon connects architecture to the work it must support: a task that
          can act safely, evidence that can be checked, and a release that can
          improve without losing control. Start with the system, then follow the
          responsibility behind each decision.
        </p>
        <div className="hero-actions">
          <a className="button-primary" href="/assessment">
            <ActionLabel>Assess readiness</ActionLabel>
          </a>
          <a className="text-link" href="/blueprint">
            Read the blueprint
          </a>
        </div>
        <div className="hero-index">
          <span>04 concern planes</span>
          <span>16 harnesses</span>
          <span>One connected operating model</span>
        </div>
      </section>
      <section className="operational-intro section-shell">
        <div className="section-number">01 / FROM DELIVERY TO DELEGATION</div>
        <h2>
          New capabilities.
          <br />
          Additional responsibilities.
        </h2>
        <p>
          An agent does more than generate an answer. It can select tools,
          retain context and change an external system. Software delivery
          remains the foundation; learned behaviour, language and delegated
          action add different questions to operate and verify.
        </p>
        <OpsComparison compact />
      </section>
      <section
        className="argument-grid section-shell"
        aria-labelledby="engine-title"
      >
        <div className="argument-copy">
          <div className="section-number">THE IDEA IN ONE PICTURE</div>
          <h2 id="engine-title">
            The model is the engine.
            <br />
            The harness is the vehicle.
          </h2>
          <p>
            Intelligence is one component. Around it sit runtime, knowledge,
            execution and trust: the boundaries that let an enterprise put real
            work—and real consequences—through the system. Select a legend entry
            for its purpose and ingredients.
          </p>
          <p className="diagram-note">
            The rings group concerns. They do not imply priority, containment or
            deployment dependency.
          </p>
        </div>
        <Surface className="architecture-surface">
          <AnimatedArchitecture />
        </Surface>
      </section>
      <section
        className="exchange-section section-shell"
        aria-labelledby="exchange-title"
      >
        <div className="section-number">02 / TWO OF FORTY-THREE</div>
        <div className="exchange-heading">
          <h2 id="exchange-title">Only two exchanges cross the model core.</h2>
          <p>
            In this canonical example, they are one request/response pair—not
            two model invocations. Other workflows can repeat or omit reasoning,
            or add separate intent calls.
          </p>
        </div>
        <p>
          Everything else establishes identity, context, authority, evidence,
          safety, continuity, cost and accountability. Hover or focus a node to
          inspect its operation; open it to follow the same exchange through the
          Journey.
        </p>
        <div className="dot-field" aria-label="43 canonical exchanges">
          {exchanges.map((m) => (
            <a
              key={m.number}
              className={[16, 17].includes(m.number) ? 'model-dot' : ''}
              href={`/journey#step-${m.number}`}
              aria-label={`Step ${m.number}: ${m.label}`}
            >
              <b>{String(m.number).padStart(2, '0')}</b>
              <span className="dot-operation" role="tooltip">
                <small>
                  {m.from} → {m.to}
                </small>
                {m.label}
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="connected-example section-shell">
        <div className="section-number">03 / FROM CAPABILITY TO EVIDENCE</div>
        <h2>
          “Can it change an order?”
          <br />
          Ask what proves it should.
        </h2>
        <p>
          A delivery-address change links architecture, maturity and
          improvement. The workflow needs exact-action authority, a reliable
          transaction and a verified outcome. A later improvement must preserve
          those controls. A mapped capability is a requirement to investigate,
          not a passed assessment. Use the same scenario to discuss architecture
          with engineers, evaluate evidence with reviewers, and agree an
          improvement boundary with decision-makers.
        </p>
        <div className="connected-path">
          <Surface>
            <a href="/journey?scenario=retail-address-human">
              <span>01 / OPERATE</span>
              <h3>Follow the action.</h3>
              <p>
                Trace one request through its decisions and external effects.
              </p>
            </a>
          </Surface>
          <Surface>
            <a href="/maturity?feature=A5">
              <span>02 / SUBSTANTIATE</span>
              <h3>Inspect the evidence.</h3>
              <p>
                Connect authorization to accountable and contributing harnesses.
              </p>
            </a>
          </Surface>
          <Surface>
            <a href="/evolution">
              <span>03 / IMPROVE</span>
              <h3>Govern the change.</h3>
              <p>
                Require independent evaluation before a new version reaches the
                task.
              </p>
            </a>
          </Surface>
        </div>
      </section>
      <section
        className="reader-paths section-shell"
        aria-labelledby="reader-title"
      >
        <div className="section-number">04 / CHOOSE YOUR READING DEPTH</div>
        <h2 id="reader-title">One system. Your next question.</h2>
        <div className="reader-grid">
          <Surface>
            <a href="/whitepaper">
              <span>Executive</span>
              <h3>Understand the system.</h3>
              <p>
                Why pilots stall and what makes the operating model complete.
              </p>
              <b>Read the brief ↗</b>
            </a>
          </Surface>
          <Surface>
            <a href="/blueprint">
              <span>Architect</span>
              <h3>Define the boundaries.</h3>
              <p>
                Owners, interfaces, release artifacts and evidence expectations.
              </p>
              <b>Open the blueprint ↗</b>
            </a>
          </Surface>
          <Surface>
            <a href="/explorer">
              <span>Engineer</span>
              <h3>Inspect the work.</h3>
              <p>
                Scenario-specific sequences, contracts and illustrative
                timelines.
              </p>
              <b>Use the explorer ↗</b>
            </a>
          </Surface>
        </div>
        <div className="professional-home">
          <div>
            <h3>Bring one consequential workflow.</h3>
            <p>
              Diagnose your maturity, implement the harnesses your priority
              journeys need, and keep improving with domain experts and
              forward-deployed engineers alongside your team.
            </p>
          </div>
          <a className="button-primary" href="/services">
            <ActionLabel>Work with Planeon</ActionLabel>
          </a>
        </div>
      </section>
    </SiteFrame>
  );
}
