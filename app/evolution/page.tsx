import type { Metadata } from 'next';
import { EvolutionFlow } from '@/components/site/EvolutionFlow';
import { SiteFrame } from '@/components/site/SiteFrame';
import './evolution.css';
export const metadata: Metadata = {
  title: 'Learning & Evolution',
  description:
    'How an agentic system can learn from experience: improve retrieval, memory and tools through independently tested, authorized changes.',
};
export default function EvolutionPage() {
  return (
    <SiteFrame className="reference-page">
      <EvolutionFlow />
    </SiteFrame>
  );
}
