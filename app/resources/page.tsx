/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/SiteChrome';
import { SiteFrame } from '@/components/site/SiteFrame';
import { resourceGroups } from '@/data/navigation.v1';
import { StudioReferenceSearch } from '@/components/site/StudioReferenceSearch';
import '../journey/studio.css';
export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Understand the system, inspect implementation and read the research behind the Planeon solution blueprint.',
};
export default function ResourcesPage() {
  return (
    <SiteFrame className="reference-page">
      <PageIntro
        compact
        eyebrow="Resources / Choose your depth"
        title="The detail, when you need it."
        description="Start with the question you want to answer. The architecture, operating examples and research each have a home here."
      />
      <div className="resource-groups section-shell">
        <div className="studio-designer">
          <StudioReferenceSearch />
        </div>
        {resourceGroups.map((group, index) => (
          <section
            key={group.title}
            aria-labelledby={`resource-group-${index}`}
          >
            <div>
              <span className="section-number">0{index + 1}</span>
              <h2 id={`resource-group-${index}`}>{group.title}</h2>
              <p>{group.description}</p>
            </div>
            <div className="resource-group-links">
              {group.links.map(([href, name, description]) => (
                <a href={href} key={href}>
                  <div>
                    <h3>{name}</h3>
                    <p>{description}</p>
                  </div>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SiteFrame>
  );
}
