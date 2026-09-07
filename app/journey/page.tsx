import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { ScenarioWorkbench } from '@/components/site/ScenarioWorkbench';
export const metadata: Metadata = {
  title: 'Journey · One Task, End to End',
  description:
    'Follow a consequential enterprise workflow through its harnesses, decisions and evidence.',
};
export default function JourneyPage() {
  return (
    <main className="reference-page">
      <SiteHeader />
      <div className="workspace-label section-shell">
        Journey / 36 use cases · 72 variants
      </div>
      <ScenarioWorkbench />
      <SiteFooter />
    </main>
  );
}
