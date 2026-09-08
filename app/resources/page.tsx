import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';
export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Technical inspection, research, build sequencing and the Planeon architecture brief.',
};
const resources = [
  [
    '/explorer',
    'Explorer',
    'Inspect a workflow as an onion, aligned sequence or illustrative waterfall.',
  ],
  [
    '/roadmap',
    'Roadmap',
    'Sequence phases 0–3 with prerequisites, deliverables and evidence gates.',
  ],
  [
    '/transformation',
    'Work with Planeon',
    'From maturity diagnosis to phased implementation and a long-term transformation partnership.',
  ],
  [
    '/evolution/research',
    'Research',
    'Explore adaptation patterns, scientific sources, metrics and open questions.',
  ],
  [
    '/whitepaper',
    'Whitepaper',
    'Read the executive brief on the enterprise multi-agent operating model.',
  ],
  [
    '/about',
    'About',
    'The perspective behind Planeon and ways to work together.',
  ],
];
export default function ResourcesPage() {
  return (
    <SiteFrame className="reference-page">
      <PageIntro
        eyebrow="Resources / Go deeper"
        title="The detail behind the system."
        description="Choose the reference that answers your next question. The architecture, operating examples and evidence requirements stay connected."
      />
      <section className="resource-index section-shell">
        {resources.map(([url, name, description]) => (
          <a key={url} href={url} className="surface-shell" aria-label={name}>
            <div className="surface-core">
              <h2>{name}</h2>
              <p>{description}</p>
              <span className="resource-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </a>
        ))}
      </section>
    </SiteFrame>
  );
}
