'use client';

/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, type CSSProperties } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ActionLabel } from './VisualPrimitives';

const primaryLinks = [
  ['/blueprint', 'Blueprint'],
  ['/journey', 'Journey'],
  ['/maturity', 'Maturity'],
  ['/evolution', 'Evolution'],
  ['/resources', 'Resources'],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
      <nav className="desktop-navigation" aria-label="Primary navigation">
        {primaryLinks.map(([href, label]) => (
          <a
            key={href}
            href={href}
            aria-current={isCurrent(href) ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
      <a
        className="header-cta desktop-cta"
        href="/assessment"
        aria-current={isCurrent('/assessment') ? 'page' : undefined}
      >
        <ActionLabel>Assess readiness</ActionLabel>
      </a>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className="navigation-toggle"
          aria-label="Open navigation"
          data-expanded={open}
        >
          <span className="hamburger" aria-hidden="true">
            <i />
            <i />
          </span>
        </DialogTrigger>
        <DialogContent className="navigation-overlay" showCloseButton={false}>
          <div className="navigation-overlay-top">
            <DialogTitle>Explore Planeon</DialogTitle>
            <DialogClose
              className="navigation-toggle"
              aria-label="Close navigation"
              data-expanded="true"
            >
              <span className="hamburger" aria-hidden="true">
                <i />
                <i />
              </span>
            </DialogClose>
          </div>
          <nav className="overlay-links" aria-label="Expanded navigation">
            {[['/', 'Home'], ...primaryLinks].map(([href, label], index) => (
              <div key={href} className="navigation-link-mask">
                <a
                  href={href}
                  aria-current={isCurrent(href) ? 'page' : undefined}
                  style={{ '--link-index': index } as CSSProperties}
                >
                  <span className="navigation-index">0{index + 1}</span>
                  {label}
                  <span className="navigation-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            ))}
          </nav>
          <div className="navigation-overlay-bottom">
            <p>
              From architecture to operation.
              <br />
              One connected operating model.
            </p>
            <a className="button-primary" href="/assessment">
              <ActionLabel>Assess readiness</ActionLabel>
            </a>
            <div className="overlay-resources">
              <a href="/explorer">Explorer</a>
              <a href="/roadmap">Roadmap</a>
              <a href="/whitepaper">Whitepaper</a>
              <a href="/about">About</a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
          <a href="/maturity">Maturity Atlas</a>
          <a href="/evolution">Governed evolution</a>
          <a href="/whitepaper">Whitepaper</a>
        </div>
        <div>
          <h2>Apply</h2>
          <a href="/assessment">Readiness check</a>
          <a href="/roadmap">Build roadmap</a>
          <a href="/about">About Planeon</a>
          <a href="/about#contact">Architecture review</a>
          <a href="/resources">All resources</a>
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
