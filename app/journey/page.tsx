import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
import { CanonicalExchanges } from '@/components/site/CanonicalExchanges';
import './mapping.css';
export const metadata: Metadata = {
  title: 'Journey · One Task, End to End',
  description:
    'Choose an industry workflow, follow its animated handoffs and explore the related harness responsibilities, AML features and expected evidence.',
};
export default function JourneyPage() {
  return (
    <SiteFrame className="reference-page">
      <div className="workspace-label section-shell">
        Journey / One workflow, explained step by step
      </div>
      <ScenarioWorkbench />
      <CanonicalExchanges />
    </SiteFrame>
  );
}
