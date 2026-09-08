/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { SiteFrame } from '@/components/site/SiteFrame';
import { HomeFilm } from '@/components/site/HomeFilm';
import { SampleDeliverable } from '@/components/site/SampleDeliverable';
import { ActionLabel } from '@/components/site/VisualPrimitives';

export default function Home() {
  return (
    <SiteFrame className="home-page business-home">
      <section
        className="business-opening section-shell"
        id="home-introduction"
      >
        <div className="business-proposition">
          <div className="eyebrow">Your enterprise transformation partner</div>
          <h1>Turn AI pilots into reliable business workflows.</h1>
          <p>
            Planeon helps you assess your starting point, implement the
            workflows that matter most, and build the controls needed to operate
            and improve them—with domain experts and engineers alongside your
            team.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="/contact">
              <ActionLabel>Discuss your workflow</ActionLabel>
            </a>
            <a className="text-link" href="/services">
              Explore our services
            </a>
          </div>
        </div>
        <HomeFilm />
      </section>
      <section
        className="business-section section-shell"
        aria-labelledby="exchange-title"
      >
        <div className="section-number">
          01 / WHAT CHANGES FOR YOUR BUSINESS
        </div>
        <div className="business-section-heading">
          <h2 id="exchange-title">
            From a customer request to a confirmed result.
          </h2>
          <div>
            <span className="example-label">
              Illustrative workflow · not a customer result
            </span>
            <p>
              A customer needs to change the delivery address on a paid order.
              The goal is fewer handoffs without losing control of who can
              change what. An agent must do more than produce a helpful answer.
            </p>
          </div>
        </div>
        <ol className="business-workflow">
          <li>
            <span>01 / Understand</span>
            <h3>Find the right order.</h3>
            <p>
              Identify the customer, interpret the request and ask for any
              missing information.
            </p>
          </li>
          <li>
            <span>02 / Authorize</span>
            <h3>Allow the exact change.</h3>
            <p>
              Check policy and permissions; involve a person when approval is
              needed.
            </p>
          </li>
          <li>
            <span>03 / Verify</span>
            <h3>Confirm what happened.</h3>
            <p>
              Check the saved address and retain a record of the action and its
              outcome.
            </p>
          </li>
        </ol>
        <p>
          The same pattern applies when an agent updates a record, schedules
          work or initiates a payment: decide what it may do, handle exceptions
          explicitly and confirm the external result before calling the task
          complete.
        </p>
        <a className="text-link" href="/journey?scenario=retail-address-human">
          Follow this example in Journey ↗
        </a>
      </section>
      <section
        className="business-section section-shell"
        aria-labelledby="help-title"
      >
        <div className="section-number">02 / HOW WE HELP</div>
        <h2 id="help-title">Start where you are. Build what you need.</h2>
        <div className="engagement-summary">
          <article>
            <span>Diagnose</span>
            <h3>A clear starting point.</h3>
            <p>
              Review your workflows, maturity and constraints. Receive an
              evidence-informed maturity profile and a prioritized roadmap with
              named owners.
            </p>
          </article>
          <article>
            <span>Implement</span>
            <h3>A working priority workflow.</h3>
            <p>
              Build in phases with forward-deployed engineers. Receive
              integrated workflows, the controls they need, and acceptance
              evidence your team can review.
            </p>
          </article>
          <article>
            <span>Improve</span>
            <h3>A continuing partnership.</h3>
            <p>
              Work with domain experts to review outcomes and test improvements.
              Receive an operating review, a shared improvement backlog with
              named owners and an evolving solution blueprint.
            </p>
          </article>
        </div>
        <a className="text-link" href="/services">
          See the engagement and responsibilities ↗
        </a>
        <p>
          Scope comes before scale. Choose the level of autonomy the workflow
          needs, then agree the integration work, human approval points and
          recovery conditions. A twelve-month programme is a scoped target, with
          progress governed by evidence.
        </p>
      </section>
      <section
        className="business-section section-shell"
        aria-labelledby="engine-title"
      >
        <div className="section-number">03 / A METHOD YOU CAN INSPECT</div>
        <div className="business-section-heading">
          <h2 id="engine-title">Make progress tangible.</h2>
          <p>
            Agree what success means before expanding scope. These example
            deliverables show how decisions, responsibilities and evidence stay
            connected; they are not completed assessments or proof of deployed
            capabilities. A maturity profile separates demonstrated capability
            from missing proof. A roadmap makes dependencies and ownership
            visible. An operating-evidence pack supports review of what was
            authorized, released and observed.
          </p>
        </div>
        <div className="sample-deliverables">
          <SampleDeliverable id="sample-maturity" title="Maturity profile">
            <p>
              <strong>Sample finding:</strong> An address-change pilot can
              propose an update, but action authorization has not been
              evidenced.
            </p>
            <p>
              <strong>Next evidence:</strong> A policy decision bound to the
              exact order, action and requesting identity.
            </p>
            <a href="/maturity?feature=A5#evidence-atlas">
              Inspect the reference requirement ↗
            </a>
          </SampleDeliverable>
          <SampleDeliverable id="sample-roadmap" title="Prioritized roadmap">
            <p>
              <strong>Sample priority:</strong> Establish identity and
              authorization before enabling address writes.
            </p>
            <p>
              <strong>Advance condition:</strong> The workflow owner and
              reviewer accept the scoped tests and recovery procedure.
            </p>
            <a href="/roadmap">Explore implementation phases ↗</a>
          </SampleDeliverable>
          <SampleDeliverable
            id="sample-evidence"
            title="Operating-evidence pack"
          >
            <p>
              <strong>Sample contents:</strong> Versioned configuration,
              supplied inputs, policy decisions, approvals, action receipts and
              verified state changes.
            </p>
            <p>
              <strong>Boundary:</strong> Observable records—not a model’s
              private reasoning—support review.
            </p>
            <a href="/explorer">Inspect the technical example ↗</a>
          </SampleDeliverable>
        </div>
        <div className="architecture-preview">
          <div>
            <h3>Supported by one connected blueprint.</h3>
            <p>
              Four concern planes connect sixteen operating capabilities around
              the model. Explore their owners, interfaces and evidence when you
              need the technical detail.
            </p>
            <a className="text-link" href="/blueprint">
              Explore the solution blueprint ↗
            </a>
          </div>
          <div
            className="architecture-preview-planes"
            aria-label="Four concern planes: Runtime, Trust, Execution and Knowledge. These group responsibilities, not deployment dependencies."
          >
            <span data-plane="runtime">
              Runtime <small>Operate</small>
            </span>
            <span data-plane="trust">
              Trust <small>Govern</small>
            </span>
            <span data-plane="execution">
              Execution <small>Act</small>
            </span>
            <span data-plane="knowledge">
              Knowledge <small>Ground</small>
            </span>
          </div>
        </div>
      </section>
      <section
        className="business-section business-enquiry section-shell"
        aria-labelledby="reader-title"
      >
        <div>
          <div className="section-number">04 / START WITH ONE WORKFLOW</div>
          <h2 id="reader-title">Bring the work that matters.</h2>
          <p>
            Tell us the outcome you want, the systems involved and what is
            getting in the way. You do not need a completed assessment. Planeon
            will review your context and respond by email to discuss a suitable
            starting engagement.
          </p>
        </div>
        <div className="business-enquiry-actions">
          <a className="button-primary" href="/contact">
            <ActionLabel>Discuss your workflow</ActionLabel>
          </a>
          <a className="text-link" href="/assessment">
            Prefer to explore first? Take the readiness check ↗
          </a>
        </div>
      </section>
    </SiteFrame>
  );
}
