/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ConsultationForm } from '@/components/site/ConsultationForm';

export const metadata: Metadata = {
  title: 'Discuss your priority workflow',
  description:
    'Talk with Planeon about your workflow, maturity assessment, phased implementation or continuing transformation partnership.',
};
export default function ContactPage() {
  return (
    <SiteFrame className="contact-page">
      <section className="contact-layout section-shell">
        <div className="contact-introduction">
          <div className="eyebrow">Work with Planeon</div>
          <h1>Discuss your priority workflow.</h1>
          <p>
            Start with the business outcome you want—not a completed
            questionnaire or a technical specification.
          </p>
          <h2>What to bring</h2>
          <p>
            Tell us which workflow matters, the systems and people involved, and
            what is getting in the way. Share only the context you are
            comfortable sending; do not include credentials or confidential
            customer data.
          </p>
          <h2>What happens next</h2>
          <p>
            Planeon will review your context and respond by email. Together, we
            can clarify the scope, the expertise needed and a suitable first
            engagement.
          </p>
          <a className="text-link" href="/services">
            Review our services ↗
          </a>
        </div>
        <div>
          <p className="form-introduction">
            Fields are required unless marked optional.
          </p>
          <ConsultationForm />
        </div>
      </section>
    </SiteFrame>
  );
}
