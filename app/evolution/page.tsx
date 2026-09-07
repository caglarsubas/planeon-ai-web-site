import type { Metadata } from 'next';
import { EvolutionFlow } from '@/components/site/EvolutionFlow';
import { SiteFrame } from '@/components/site/SiteFrame';
export const metadata: Metadata = {
  title: 'Governed Evolution',
  description:
    'Separate proposal, independent evaluation, approval and controlled rollout across the sixteen harnesses.',
};
export default function EvolutionPage() {
  return (
    <SiteFrame className="reference-page">
      <EvolutionFlow />
    </SiteFrame>
  );
}
