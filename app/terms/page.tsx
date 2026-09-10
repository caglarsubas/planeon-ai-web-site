import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'Terms for using the Planeon website and architecture materials.',
};

export default function TermsPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Legal / Terms"
        title="Use the blueprint critically."
        description="These materials are an architectural reference. They do not replace the engineering, security, legal, or operational review required for a consequential system."
      />
      <article className="legal-document section-shell">
        <aside>
          <span>Last reviewed</span>
          <strong>01 Sep 2026</strong>
        </aside>
        <div className="surface-shell">
          <div className="surface-core">
            <section>
              <h2>Informational purpose</h2>
              <p>
                The Planeon website, blueprint, explorer, assessment, and
                related materials provide general architecture information. They
                are not professional advice, a certification, a warranty, or
                evidence that any particular system has been implemented or
                accepted.
              </p>
            </section>
            <section>
              <h2>Your decisions remain yours</h2>
              <p>
                You are responsible for validating the framework against your
                organisation’s requirements, applicable law, contracts, threat
                model, operating environment, and current primary sources before
                adoption.
              </p>
            </section>
            <section>
              <h2>Research and external links</h2>
              <p>
                Dated claims and technology references can change. External
                links are provided for context; Planeon does not control their
                availability, content, or practices.
              </p>
            </section>
            <section>
              <h2>Intellectual property</h2>
              <p>
                Planeon names, marks, visual identity, and original site
                materials remain the property of their respective owners.
                Third-party names and marks belong to their owners and do not
                imply endorsement.
              </p>
            </section>
            <section>
              <h2>Questions</h2>
              <p>
                For questions about permitted use, contact{' '}
                <a href="mailto:hello@planeon.ai">hello@planeon.ai</a>.
              </p>
            </section>
          </div>
        </div>
      </article>
    </SiteFrame>
  );
}
