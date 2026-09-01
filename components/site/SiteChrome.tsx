/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
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
      <a className="wordmark" href="/" aria-label="Planeon.ai home">
        <Image src="/brand/planeon-logo.png" alt="Planeon.ai" width={1571} height={413} priority />
      </a>
      <nav aria-label="Primary navigation">
        {primaryLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        <a href="/about">About</a>
      </nav>
      <a className="header-cta desktop-cta" href="/assessment">Assess readiness</a>
      <details className="mobile-menu">
        <summary aria-label="Open navigation">Menu</summary>
        <div>
          {primaryLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          <a href="/assessment">Assessment</a>
          <a href="/whitepaper">Whitepaper</a>
          <a href="/about">About</a>
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
          <a className="wordmark footer-wordmark" href="/" aria-label="Planeon.ai home">
            <Image src="/brand/planeon-logo.png" alt="Planeon.ai" width={1571} height={413} />
          </a>
          <p>Assured multi-agent systems, from architecture to operation.</p>
        </div>
        <div>
          <h2>Read</h2>
          <a href="/blueprint">Blueprint</a>
          <a href="/journey">Journey</a>
          <a href="/whitepaper">Whitepaper</a>
        </div>
        <div>
          <h2>Use</h2>
          <a href="/explorer">Interactive explorer</a>
          <a href="/assessment">Maturity assessment</a>
          <a href="/roadmap">Build roadmap</a>
        </div>
        <div>
          <h2>Company</h2>
          <a href="/about">About Planeon</a>
          <a href="/about#contact">Architecture review</a>
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
