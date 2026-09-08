import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { MaturityExperience } from '@/components/site/MaturityExperience';
export const metadata: Metadata = {
  title: 'Five Levels of Agentic Maturity | Maturity Atlas',
  description:
    'Explore the five AML levels, from FAQ / Search to Proactive Co-Pilot, then inspect 57 feature families, 16 harnesses and their expected evidence.',
};
export default function MaturityPage() {
  return (
    <SiteFrame className="reference-page">
      <MaturityExperience />
    </SiteFrame>
  );
}
