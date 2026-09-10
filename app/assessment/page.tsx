import type { Metadata } from 'next';
import { harnesses as registry } from '@/lib/harness';
import { AssessmentTool } from '@/components/site/AssessmentTool';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';

export const metadata: Metadata = {
  title: 'Self-Reported Readiness Check',
  description:
    'Review sixteen enterprise system boundaries and prepare an evidence-led professional assessment.',
};

export default function AssessmentPage() {
  const harnesses = registry.map(({ number, name, q, phase, plane }) => ({
    n: number,
    name,
    q,
    phase,
    plane,
  }));
  return (
    <SiteFrame>
      <PageIntro
        compact
        eyebrow="Self-reported readiness / No email gate"
        title="What is ready today?"
        description="Rate what exists, not what the roadmap promises. This self-reported check highlights weak boundaries; it is not an AML score or evidence of control satisfaction. Professional assessment examines applicability, mandatory controls and actual evidence."
      />
      <AssessmentTool harnesses={harnesses} />
    </SiteFrame>
  );
}
