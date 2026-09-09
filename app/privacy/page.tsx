import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Planeon handles information when you use this website.',
};

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Legal / Privacy"
        title="Privacy, stated plainly."
        description="The blueprint, examples and readiness check remain open. Optional private engineering packs require verified contact information."
      />
      <article className="legal-document section-shell">
        <aside>
          <span>Last reviewed</span>
          <strong>09 Sep 2026</strong>
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
              <p>
                Your selected theme and homepage background-motion preference
                are saved in your browser&apos;s local storage. This information
                is not sent to Planeon or used for tracking. You can change
                these preferences using the theme and background-motion
                controls, or remove them by clearing this site&apos;s browser
                data.
              </p>
            </section>
            <section>
              <h2>Consultation delivery</h2>
              <p>
                Consultation requests are delivered to Planeon as transactional
                email through Resend. The consultation form does not create an
                account or a separate assessment database record. The submitted
                message may be retained in Planeon&apos;s mailbox and by the
                delivery provider as required to operate, secure, and
                troubleshoot the service.
              </p>
            </section>
            <section>
              <h2>Journey Studio drafts and private packs</h2>
              <p>
                Public conversations are processed by Planeon’s locally operated
                assistant and are not retained server-side. Drafts stay in the
                current browser page until it is reloaded. Do not submit
                credentials, personal customer records or sensitive confidential
                information.
              </p>
              <p>
                Engineering-pack requests require a name, company, role, company
                email, confirmed brief, intended use and explicit consent. Email
                codes verify mailbox access, not company legitimacy or the
                person’s authority. Sign-in uses a necessary secure session
                cookie; codes are stored only in hashed form.
              </p>
              <p>
                Account records, submitted briefs, prepared documents, review
                history and delivery status are stored privately on Planeon’s
                local service. Caglar reviews the exact prepared files before
                release. Only the verified owner can download approved files;
                private review notes and unreleased versions are not exposed to
                customers.
              </p>
              <p>
                Submitted requests and local files expire 90 days after
                submission. You can delete a request earlier from My requests.
                Inactive accounts without active requests are removed after 90
                days. Deleting local data cannot remove copies already delivered
                by email or retained by the email provider. Verification and
                delivery email use Planeon’s existing Resend service, not a
                marketing subscription.
              </p>
              <p>
                The new assistant and private downloads are best-effort,
                laptop-backed capabilities. They may be unavailable while the
                laptop is offline; the public reference site remains usable.
                Application logs exclude conversation content, codes and
                credentials. Rate limits use pseudonymous technical counters to
                prevent abuse. A necessary temporary draft-session cookie
                applies assistant usage limits without storing conversation
                content.
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
    </SiteFrame>
  );
}
