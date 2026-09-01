import Link from 'next/link';
import Image from 'next/image';

const primaryLinks = [
  ['/blueprint', 'Blueprint'],
  ['/journey', 'Journey'],
  ['/roadmap', 'Roadmap'],
  ['/explorer', 'Explorer'],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Planeon.ai home">
        <Image src="/brand/planeon-logo.png" alt="Planeon.ai" width={1571} height={413} priority />
      </Link>
      <nav aria-label="Primary navigation">
        {primaryLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        <Link href="/about">About</Link>
      </nav>
      <Link className="header-cta desktop-cta" href="/assessment">Assess readiness</Link>
      <details className="mobile-menu">
        <summary aria-label="Open navigation">Menu</summary>
        <div>
          {primaryLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/assessment">Assessment</Link>
          <Link href="/whitepaper">Whitepaper</Link>
          <Link href="/about">About</Link>
        </div>
      </details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid section-shell">
        <div>
          <Link className="wordmark footer-wordmark" href="/" aria-label="Planeon.ai home">
            <Image src="/brand/planeon-logo.png" alt="Planeon.ai" width={1571} height={413} />
          </Link>
          <p>Assured multi-agent systems, from architecture to operation.</p>
        </div>
        <div>
          <h2>Read</h2>
          <Link href="/blueprint">Blueprint</Link>
          <Link href="/journey">Journey</Link>
          <Link href="/whitepaper">Whitepaper</Link>
        </div>
        <div>
          <h2>Use</h2>
          <Link href="/explorer">Interactive explorer</Link>
          <Link href="/assessment">Maturity assessment</Link>
          <Link href="/roadmap">Build roadmap</Link>
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about">About Planeon</Link>
          <Link href="/about#contact">Architecture review</Link>
        </div>
      </div>
      <div className="footer-provenance section-shell">
        <p>
          Taxonomy, standards facts, and technology names synthesize three architecture reviews current to approximately mid-2026. Enterprise ownership and build phases are architectural recommendations, not research findings. Review dated claims and tool lists against their linked primary sources before adoption.
        </p>
        <span>© 2026 Planeon</span>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-intro section-shell">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
