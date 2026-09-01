import type { Metadata } from 'next';
import content from '@/data/content.json';
import { PageIntro, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'Build Roadmap', description: 'A four-phase path from foundation to governed scale.' };

export default function RoadmapPage() {
  const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n);
  return <main><SiteHeader /><PageIntro eyebrow="Roadmap / Phase 0—3" title="Sequence the capability, not the theatre." description="The roadmap starts with boundaries that must exist before the first pilot and ends with federation across teams, agents, and regulated workloads. Phase is sequencing; tier is the source deck’s MVP-versus-full distinction. They are not the same thing." />
    <section className="roadmap section-shell">
      {content.buildPhases.map((phase) => <article key={phase.id} className={`roadmap-phase phase-${phase.id}`}>
        <header><span>0{phase.id}</span><div><p>{phase.blurb}</p><h2>{phase.name}</h2></div></header>
        <div className="roadmap-harnesses">{harnesses.filter((h) => h.phase === phase.id).map((h) => <a key={h.n} href={`/blueprint/${h.n}`}><span>{String(h.n).padStart(2, '0')}</span><div><h3>{h.name}</h3><p>{h.phaseNote}</p></div></a>)}</div>
      </article>)}
    </section>
    <section className="roadmap-coda section-shell"><div className="section-number">A USEFUL DEFINITION OF DONE</div><blockquote>Each phase is complete when its controls can produce evidence under failure—not when the happy-path demo runs once.</blockquote></section>
    <SiteFooter /></main>;
}
