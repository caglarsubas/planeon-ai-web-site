import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { JourneyExperience } from '@/components/site/JourneyExperience';
import './mapping.css';
import './studio.css';
export const metadata: Metadata = {
  title: 'Journey Studio · Explore or Design a Workflow',
  description:
    'Explore an industry example or design your own workflow with Planeon. Inspect proposed harness responsibilities, AML evidence needs and a privately reviewed engineering pack.',
};
export default function JourneyPage() {
  return (
    <SiteFrame className="reference-page">
      <JourneyExperience />
    </SiteFrame>
  );
}
