import type { Metadata } from 'next';
import { EvolutionFlow } from '@/components/site/EvolutionFlow';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
export const metadata: Metadata = {
  title: 'Governed Evolution',
  description:
    'Separate proposal, independent evaluation, approval and controlled rollout across the sixteen harnesses.',
};
export default function EvolutionPage() {
  return (
    <main className="reference-page">
      <SiteHeader />
      <EvolutionFlow />
      <SiteFooter />
    </main>
  );
}
