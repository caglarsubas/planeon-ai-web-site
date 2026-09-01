import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SiteFooter, SiteHeader } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'About', description: 'Planeon helps enterprises turn multi-agent ambition into governed, evidence-bearing systems.' };

export default function AboutPage() {
  return <main><SiteHeader /><PageIntro eyebrow="About / Planeon" title="Assured systems for consequential work." description="Planeon helps enterprise teams move from impressive agent demos to multi-agent systems with clear boundaries, durable execution, tenant-safe operation, and evidence that survives scrutiny." />
    <section className="about-principles section-shell"><div><span>01</span><h2>Architecture before acceleration.</h2><p>Make responsibility and authority explicit before scaling agent count, integrations, or autonomy.</p></div><div><span>02</span><h2>Evidence before confidence.</h2><p>Treat source, build, deployment, runtime, assurance, and tenant acceptance as separate states.</p></div><div><span>03</span><h2>Control without capture.</h2><p>Use open contracts and vendor-neutral boundaries so a system remains replaceable and governable.</p></div></section>
    <section className="about-split section-shell"><div><div className="section-number">HOW WE HELP</div><h2>From blueprint to operating proof.</h2></div><div><p>We work with enterprise architecture, platform, security, data, and product leaders to turn a multi-agent strategy into accountable boundaries, implementation sequencing, and evidence gates.</p><ul><li>Architecture and boundary definition</li><li>Harness readiness and clean-room implementation plans</li><li>Policy, tenant isolation, and durable execution design</li><li>Evaluation, observability, and acceptance evidence</li></ul></div></section>
    <section id="contact" className="contact-band"><div className="section-shell"><p>Bring one consequential workflow.</p><h2>We’ll map the system it actually needs.</h2><div><a className="button-primary" href="mailto:hello@planeon.ai">hello@planeon.ai <span>↗</span></a><Link prefetch={false} className="text-link" href="/assessment">Start with the assessment</Link></div></div></section>
    <SiteFooter /></main>;
}
