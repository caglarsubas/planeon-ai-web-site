import type { Metadata } from 'next';
import {
  PageIntro,
  SiteFooter,
  SiteHeader,
} from '@/components/site/SiteChrome';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Planeon handles information when you use this website.',
};

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro
        eyebrow="Legal / Privacy"
        title="Privacy, stated plainly."
        description="This website is designed to be useful without requiring an account, an email gate, or behavioural profiling."
      />
      <article className="legal-document section-shell">
        <aside>
          <span>Last reviewed</span>
          <strong>02 Sep 2026</strong>
        </aside>
        <div className="surface-shell">
          <div className="surface-core">
            <section>
              <h2>Information you choose to send</h2>
              <p>
                If you submit the professional consultation form, Planeon
                receives the contact details, organisation, service preference,
                workflow description, and readiness summary you choose to
                provide so we can assess and respond to your request. The form
                clearly asks for your consent before sending.
              </p>
            </section>
            <section>
              <h2>Local interactions</h2>
              <p>
                The maturity assessment runs in your browser. Its answers are
                not submitted to Planeon or saved by this website. Closing or
                refreshing the page clears the current assessment.
              </p>
            </section>
            <section>
              <h2>Consultation delivery</h2>
              <p>
                Consultation requests are delivered to Planeon as transactional
                email through Resend. The website does not create an account or
                a separate assessment database record. The submitted message may
                be retained in Planeon&apos;s mailbox and by the delivery
                provider as required to operate, secure, and troubleshoot the
                service.
              </p>
            </section>
            <section>
              <h2>Website delivery</h2>
              <p>
                Our hosting providers may process standard technical request
                data, such as an IP address, browser information, requested URL,
                and timestamp, to deliver and protect the site. Their handling
                of that data is governed by their own service terms and privacy
                practices.
              </p>
            </section>
            <section>
              <h2>External sources</h2>
              <p>
                The site links to third-party research and standards. Following
                those links takes you to services with their own privacy
                practices. Planeon does not control those services.
              </p>
            </section>
            <section>
              <h2>Questions</h2>
              <p>
                For privacy questions, contact{' '}
                <a href="mailto:hello@planeon.ai">hello@planeon.ai</a>.
              </p>
            </section>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
