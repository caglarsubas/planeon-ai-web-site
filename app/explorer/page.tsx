import type { Metadata } from 'next';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
import { SiteFrame } from '@/components/site/SiteFrame';
export const metadata: Metadata = {
  title: 'Interactive Harness Explorer',
  description:
    'Inspect scenario operations as an onion, aligned sequence, or flat and tree waterfalls.',
};
export default function ExplorerPage() {
  return (
    <SiteFrame className="reference-page">
      <div className="workspace-label section-shell">
        Explorer / Technical reference
      </div>
      <ScenarioWorkbench technical />
    </SiteFrame>
  );
}
