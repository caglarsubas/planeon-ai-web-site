import type { Metadata } from 'next';
/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';
import { Surface, ActionLabel } from '@/components/site/VisualPrimitives';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Planeon helps enterprises turn multi-agent ambition into governed, evidence-bearing systems.',
};

export default function AboutPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="About / Planeon"
        title="Assured systems for consequential work."
        description="Planeon helps enterprise teams move from impressive agent demos to multi-agent systems with clear boundaries, durable execution, tenant-safe operation, and evidence that survives scrutiny."
      />
      <section className="about-principles section-shell">
        <Surface>
          <span>01</span>
          <h2>Architecture before acceleration.</h2>
          <p>
            Make responsibility and authority explicit before scaling agent
            count, integrations, or autonomy.
          </p>
        </Surface>
        <Surface>
          <span>02</span>
          <h2>Evidence before confidence.</h2>
          <p>
            Treat source, build, deployment, runtime, assurance, and tenant
            acceptance as separate states.
          </p>
        </Surface>
        <Surface>
          <span>03</span>
          <h2>Control without capture.</h2>
          <p>
            Use open contracts and vendor-neutral boundaries so a system remains
            replaceable and governable.
          </p>
        </Surface>
      </section>
      <section className="about-split section-shell">
        <div>
          <div className="section-number">HOW WE HELP</div>
          <h2>From blueprint to operating proof.</h2>
        </div>
        <div>
          <p>
            We work with enterprise architecture, platform, security, data, and
            product leaders to turn a multi-agent strategy into accountable
            boundaries, implementation sequencing, and evidence gates.
          </p>
          <ul>
            <li>Architecture and boundary definition</li>
            <li>Harness readiness and clean-room implementation plans</li>
            <li>Policy, tenant isolation, and durable execution design</li>
            <li>Evaluation, observability, and acceptance evidence</li>
          </ul>
        </div>
      </section>
      <section id="contact" className="contact-band">
        <div className="section-shell">
          <p>Bring one consequential workflow.</p>
          <h2>We’ll map the system it actually needs.</h2>
          <div>
            <a
              className="button-primary"
              href="/assessment#professional-assessment"
            >
              <ActionLabel>Discuss your workflow</ActionLabel>
            </a>
            <a className="text-link" href="/assessment">
              Start with the assessment
            </a>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
