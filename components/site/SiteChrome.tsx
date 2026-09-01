'use client';

/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const primaryLinks = [
  ['/blueprint', 'Blueprint'],
  ['/journey', 'Journey'],
  ['/roadmap', 'Roadmap'],
  ['/explorer', 'Explorer'],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Planeon.ai home">
        <Image
          src="/brand/planeon-logo.png"
          alt="Planeon.ai"
          width={1571}
          height={413}
          priority
        />
      </a>
      <nav aria-label="Primary navigation">
        {primaryLinks.map(([href, label]) => (
          <a
            key={href}
            href={href}
            aria-current={isCurrent(href) ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
        <a
          href="/about"
          aria-current={isCurrent('/about') ? 'page' : undefined}
        >
          About
        </a>
      </nav>
      <a
        className="header-cta desktop-cta"
        href="/assessment"
        aria-current={isCurrent('/assessment') ? 'page' : undefined}
      >
        Assess readiness
      </a>
      <details className="mobile-menu">
        <summary aria-label="Open navigation">
          <span>Menu</span>
          <i aria-hidden="true" />
        </summary>
        <div>
          {primaryLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              aria-current={isCurrent(href) ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
          <a
            href="/assessment"
            aria-current={isCurrent('/assessment') ? 'page' : undefined}
          >
            Assessment
          </a>
          <a
            href="/whitepaper"
            aria-current={isCurrent('/whitepaper') ? 'page' : undefined}
          >
            Whitepaper
          </a>
          <a
            href="/about"
            aria-current={isCurrent('/about') ? 'page' : undefined}
          >
            About
          </a>
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
          <a
            className="wordmark footer-wordmark"
            href="/"
            aria-label="Planeon.ai home"
          >
            <Image
              src="/brand/planeon-logo.png"
              alt="Planeon.ai"
              width={1571}
              height={413}
            />
          </a>
          <p>Assured multi-agent systems, from architecture to operation.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <a href="/blueprint">Blueprint</a>
          <a href="/journey">Journey</a>
          <a href="/explorer">Interactive explorer</a>
          <a href="/whitepaper">Whitepaper</a>
        </div>
        <div>
          <h2>Apply</h2>
          <a href="/assessment">Maturity assessment</a>
          <a href="/roadmap">Build roadmap</a>
          <a href="/about">About Planeon</a>
          <a href="/about#contact">Architecture review</a>
        </div>
      </div>
      <div className="footer-provenance section-shell">
        <p>
          Taxonomy, standards facts, and technology names synthesize three
          architecture reviews current to approximately mid-2026. Enterprise
          ownership and build phases are architectural recommendations, not
          research findings. Review dated claims and tool lists against their
          linked primary sources before adoption.
        </p>
        <div className="footer-legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <span>© 2026 Planeon</span>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro section-shell">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
