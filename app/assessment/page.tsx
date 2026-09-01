import type { Metadata } from 'next';
import content from '@/data/content.json';
import { AssessmentTool } from '@/components/site/AssessmentTool';
import { PageIntro, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'Harness Maturity Assessment', description: 'Assess sixteen enterprise multi-agent system boundaries without an email gate.' };

export default function AssessmentPage() {
  const harnesses = Object.values(content.harnesses).sort((a, b) => a.n - b.n).map(({ n, name, q, phase, plane }) => ({ n, name, q, phase, plane }));
  return <main><SiteHeader /><PageIntro eyebrow="Assessment / No email gate" title="Where is your system actually mature?" description="Rate each boundary against what exists today—not what the roadmap says. The result stays in this page, identifies the weakest three harnesses, and points to the earliest phase that still needs work." /><AssessmentTool harnesses={harnesses} /><SiteFooter /></main>;
}
