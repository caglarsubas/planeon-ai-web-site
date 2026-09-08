/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ActionLabel } from '@/components/site/VisualPrimitives';
export const metadata: Metadata = {
  title: 'About Planeon',
  description:
    'A transformation partnership built around domain expertise, hands-on implementation and evidence your team can inspect.',
};
export default function AboutPage() {
  return (
    <SiteFrame className="about-business-page">
      <PageIntro
        compact
        eyebrow="About / Planeon"
        title="Work with a partner. Keep ownership of the decisions."
        description="Planeon connects domain expertise, hands-on engineering and a shared solution blueprint to help enterprises turn AI pilots into reliable workflows. The working relationship is built around your priorities and evidence your team can inspect."
      />
      <section
        className="about-working section-shell"
        aria-labelledby="working-title"
      >
        <div>
          <div className="section-number">HOW WE WORK WITH YOUR TEAM</div>
          <h2 id="working-title">
            Expertise beside you, from diagnosis to operation.
          </h2>
        </div>
        <dl>
          <div>
            <dt>Domain experts</dt>
            <dd>
              Translate business rules, exceptions and consequences into
              workflow requirements and acceptance criteria with your
              subject-matter experts.
            </dd>
          </div>
          <div>
            <dt>Forward-deployed engineers</dt>
            <dd>
              Work alongside your team on the agreed integrations, controls,
              tests and handover documentation. Implementation follows the
              workflow priorities you choose together.
            </dd>
          </div>
          <div>
            <dt>Continuing partnership</dt>
            <dd>
              Review operating outcomes, maintain a shared improvement backlog
              and evolve the blueprint. Proposed improvements still need
              validation and approval before release.
            </dd>
          </div>
        </dl>
      </section>
      <section
        className="about-working section-shell"
        aria-labelledby="method-title"
      >
        <div>
          <div className="section-number">METHOD AND OWNERSHIP</div>
          <h2 id="method-title">
            Clear responsibilities. Reviewable progress.
          </h2>
        </div>
        <div>
          <p>
            Start with one workflow and an evidence-informed maturity diagnosis.
            Agree the deliverables, named owners and acceptance conditions
            before broadening implementation.
          </p>
          <p>
            Your organization retains responsibility for business policy, access
            decisions and acceptance of production changes. Planeon’s delivery
            obligations, intellectual-property terms and ongoing support are
            agreed explicitly in the engagement scope.
          </p>
          <p>
            The blueprint uses vendor-neutral boundaries so components can be
            evaluated and replaced. A reference model or successful demo is
            never presented as proof that a production control has passed.
          </p>
          <a className="text-link" href="/services">
            See deliverables and the phased engagement ↗
          </a>
        </div>
      </section>
      <section
        id="contact"
        className="business-enquiry business-section section-shell"
      >
        <div>
          <h2>Start with your priority workflow.</h2>
          <p>
            Tell us what needs to change. We will review your context and
            respond by email to discuss the right first engagement.
          </p>
        </div>
        <a className="button-primary" href="/contact">
          <ActionLabel>Discuss your workflow</ActionLabel>
        </a>
      </section>
    </SiteFrame>
  );
}
