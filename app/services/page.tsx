/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ActionLabel } from '@/components/site/VisualPrimitives';
import content from '@/data/content.json';
import {
  transformationPhases,
  transformationPartners,
  transformationScheduleNote,
} from '@/data/transformation.v1';

export const metadata: Metadata = {
  title: 'Services — Your Agentic Transformation with Planeon',
  description:
    'Diagnose your agentic maturity, implement the harnesses your priority journeys need and build a long-term partnership with domain experts and forward-deployed engineers.',
};

export default function ServicesPage() {
  return (
    <SiteFrame className="transformation-page">
      <section className="transformation-hero section-shell">
        <p className="eyebrow">Services / How Planeon can help</p>
        <div className="transformation-hero-split">
          <h1>
            Diagnose. Implement.
            <br />
            Keep improving.
          </h1>
          <div>
            <p>
              Receive a clear maturity diagnosis, a working priority workflow
              and a phased plan for the system around it. Domain experts and
              forward-deployed engineers work alongside your team, with a
              continuing partnership to improve what you build.
            </p>
            <a className="button-primary" href="/contact">
              <ActionLabel>Discuss your workflow</ActionLabel>
            </a>
            <p className="transformation-hero-note">
              First engagement: agree one workflow, the evidence to review,
              named owners and the outputs of diagnosis before committing to
              implementation.
            </p>
          </div>
        </div>
        <nav
          className="transformation-contents"
          aria-label="Transformation page sections"
        >
          <a href="#diagnose">
            <span>01</span> Diagnose your maturity{' '}
            <span aria-hidden="true">↓</span>
          </a>
          <a href="#implementation">
            <span>02</span> Build in phases <span aria-hidden="true">↓</span>
          </a>
          <a href="#partnership">
            <span>03</span> Keep improving together{' '}
            <span aria-hidden="true">↓</span>
          </a>
        </nav>
      </section>

      <section
        className="transformation-diagnosis section-shell"
        id="diagnose"
        aria-labelledby="diagnosis-title"
      >
        <div className="transformation-section-heading">
          <p className="eyebrow">01 / See where you are now</p>
          <h2 id="diagnosis-title">
            Diagnose the maturity.
            <br />
            Understand the gaps.
          </h2>
          <p>
            Assess what your agents can demonstrate today—not just what a demo
            promises. We connect the five AML levels to your workflows, harness
            boundaries and operating evidence.
          </p>
          <a className="text-link" href="/maturity">
            Explore the five maturity levels ↗
          </a>
        </div>
        <div className="transformation-diagnosis-detail">
          <dl>
            <div>
              <dt>Your starting point</dt>
              <dd>
                An evidence-backed maturity profile: demonstrated capability,
                missing proof and material risks. Quality, security and
                readiness remain distinct.
              </dd>
            </div>
            <div>
              <dt>Your priorities</dt>
              <dd>
                Rank journeys by business value, feasibility and risk. Choose
                the level of agency each needs; L5 is not the destination for
                every workflow.
              </dd>
            </div>
            <div>
              <dt>Your implementation brief</dt>
              <dd>
                Map the gaps to accountable harness owners, dependencies and
                acceptance criteria. Agree what to build first—and what can
                wait.
              </dd>
            </div>
          </dl>
          <p className="transformation-small-note">
            The online readiness check is self-reported. Professional diagnosis
            reviews evidence, applicability and mandatory controls.
          </p>
          <a className="text-link" href="/assessment">
            Start the readiness check ↗
          </a>
        </div>
      </section>

      <section
        className="transformation-programme section-shell"
        id="implementation"
        aria-labelledby="programme-title"
      >
        <header className="transformation-programme-heading">
          <div>
            <p className="eyebrow">02 / A phase-wise implementation</p>
            <h2 id="programme-title">
              Start with what you need.
              <br />
              Agree a twelve-month target.
            </h2>
          </div>
          <p>
            Your priority workflows determine what to build first. A proposed
            twelve-month programme works toward a complete system for the agreed
            scope—not an unconditional delivery guarantee.
          </p>
        </header>
        <p className="transformation-schedule-note">
          {transformationScheduleNote}
        </p>
        <ol
          className="transformation-timeline"
          aria-label="Proposed twelve-month implementation programme"
        >
          {transformationPhases.map((stage) => (
            <li key={stage.phase}>
              <div className="transformation-months">
                Months {stage.startMonth}–{stage.endMonth}
              </div>
              <div className="transformation-phase-marker" aria-hidden="true">
                <span>{String(stage.phase).padStart(2, '0')}</span>
              </div>
              <p className="transformation-phase-name">
                {
                  content.buildPhases.find((phase) => phase.id === stage.phase)!
                    .name
                }
              </p>
              <h3>{stage.title}</h3>
              <p>{stage.work}</p>
              <dl>
                <div>
                  <dt>What you leave with</dt>
                  <dd>{stage.deliverable}</dd>
                </div>
                <div>
                  <dt>Advance with evidence</dt>
                  <dd>{stage.gate}</dd>
                </div>
              </dl>
              <a href={`/roadmap#phase-${stage.phase}`} className="text-link">
                Technical phase detail <span aria-hidden="true">↗</span>
                <span className="sr-only">: phase {stage.phase}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="transformation-completeness">
          <h3>What does a complete harness system mean?</h3>
          <p>
            An integrated operating model across Runtime, Trust, Execution and
            Knowledge, with the applicable capabilities of all sixteen harnesses
            addressed for the agreed scope. Not sixteen disconnected products,
            and not a requirement for every journey to become fully autonomous.
          </p>
          <a className="text-link" href="/blueprint">
            See the system blueprint ↗
          </a>
        </div>
      </section>

      <section
        className="transformation-partnership section-shell"
        id="partnership"
        aria-labelledby="partnership-title"
      >
        <div className="transformation-section-heading">
          <p className="eyebrow">03 / A long-term partnership</p>
          <h2 id="partnership-title">
            Experts beside you.
            <br />A blueprint that evolves.
          </h2>
          <p>
            Consultancy with domain experts. Implementation with
            forward-deployed engineers. A continuing partnership devoted to an
            always-improving Planeon Solution Blueprint.
          </p>
        </div>
        <div className="transformation-partner-roles">
          {transformationPartners.map((partner) => (
            <article key={partner.role}>
              <p className="transformation-role">{partner.role}</p>
              <h3>{partner.title}</h3>
              <p>{partner.description}</p>
            </article>
          ))}
        </div>
        <div className="transformation-improvement">
          <p className="eyebrow">
            The Planeon Solution Blueprint / Beyond month 12
          </p>
          <h3>Keep the architecture current. Keep the changes governed.</h3>
          <p>
            Turn operational lessons into proposed improvements. Evaluate them
            independently, approve the right version and roll it out with
            monitoring and recovery. A better blueprint informs your roadmap; it
            never silently changes your production system.
          </p>
          <div className="transformation-reference-links">
            <a className="text-link" href="/blueprint">
              Explore the blueprint ↗
            </a>
            <a className="text-link" href="/evolution">
              See governed improvement ↗
            </a>
          </div>
        </div>
        <div className="engagement-ownership">
          <h3>Agree the responsibilities from the start.</h3>
          <p>
            Planeon provides the agreed diagnosis, implementation and review
            work. Your team supplies domain decisions, access to approved
            systems and accountable workflow owners. Together, we agree
            acceptance evidence, handover documentation and who authorizes
            production changes. Ownership, support and commercial terms are
            defined in the engagement scope.
          </p>
        </div>
      </section>

      <section
        className="transformation-invitation section-shell"
        aria-labelledby="transformation-invitation-title"
      >
        <div>
          <p className="eyebrow">Your next step</p>
          <h2 id="transformation-invitation-title">
            Bring your first priority journey.
          </h2>
          <p>
            Tell us your industry, current capability and operating constraints.
            We’ll scope the diagnosis, implementation path and partnership
            together.
          </p>
        </div>
        <a className="button-primary" href="/contact">
          <ActionLabel>Discuss your workflow</ActionLabel>
        </a>
      </section>
    </SiteFrame>
  );
}
