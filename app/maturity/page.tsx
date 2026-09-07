import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { MaturityAtlas } from '@/components/site/MaturityAtlas';
export const metadata: Metadata = {
  title: 'Maturity Atlas',
  description:
    '57 AML feature families mapped to 16 harnesses, with primary accountability, contributors and expected evidence.',
};
export default function MaturityPage() {
  return (
    <SiteFrame className="reference-page">
      <MaturityAtlas />
    </SiteFrame>
  );
}
