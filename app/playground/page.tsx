import type { Metadata } from 'next';
import { SiteFrame } from '@/components/site/SiteFrame';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
import './playground.css';

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Choose an industry workflow, follow its animated harness handoffs and explore the related AML responsibilities and evidence requirements.',
};

export default function PlaygroundPage() {
  return (
    <SiteFrame className="reference-page playground-page">
      <div className="workspace-label section-shell">
        Playground / Watch the workflow. Understand its controls.
      </div>
      <ScenarioWorkbench playground />
    </SiteFrame>
  );
}
