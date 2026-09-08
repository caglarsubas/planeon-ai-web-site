import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
import { CanonicalExchanges } from '@/components/site/CanonicalExchanges';
export const metadata: Metadata = {
  title: 'Journey · One Task, End to End',
  description:
    'Follow a consequential enterprise workflow through its harnesses, decisions and evidence.',
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
