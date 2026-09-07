import type { Metadata } from 'next';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
export const metadata: Metadata = {
  title: 'Interactive Harness Explorer',
  description:
    'Inspect scenario operations as an onion, aligned sequence, or flat and tree waterfalls.',
};
export default function ExplorerPage() {
  return (
    <main className="reference-page">
      <SiteHeader />
      <div className="workspace-label section-shell">
        Explorer / Technical reference
      </div>
      <ScenarioWorkbench technical />
      <SiteFooter />
    </main>
  );
}
