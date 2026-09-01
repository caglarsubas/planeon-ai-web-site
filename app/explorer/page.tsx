import type { Metadata } from 'next';
import { Explorer } from '@/components/site/Explorer';
import { PageIntro, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'Interactive Harness Explorer', description: 'Explore sixteen harnesses, nineteen participants, forty-three messages, twenty-four flow nodes, and twenty-nine typed handoffs.' };

export default function ExplorerPage() {
  return <main><SiteHeader /><PageIntro eyebrow="Explorer / Full reference" title="The complete system, inspectable." description="Navigate the onion by concern or build phase, then inspect every participant, message, node, and edge in the end-to-end task. The diagram is an architectural reference—not evidence that a platform has been implemented." /><Explorer /><SiteFooter /></main>;
}
