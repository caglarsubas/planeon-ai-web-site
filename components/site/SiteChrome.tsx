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
import { navigationCurrent } from '@/lib/navigation';
import { ThemeToggle } from './ThemeToggle';

const primaryLinks = [
  ['/services', 'Services'],
  ['/maturity', 'Maturity'],
  ['/resources', 'Resources'],
  ['/about', 'About'],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = (href: string) => navigationCurrent(pathname, href);

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
          <a key={href} href={href} aria-current={current(href)}>
            {label}
          </a>
        ))}
      </nav>
      <a
        className="header-cta desktop-cta"
        href="/contact"
        aria-current={current('/contact')}
      >
        <ActionLabel>Discuss your workflow</ActionLabel>
      </a>
      <ThemeToggle />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          id="planeon-navigation-trigger"
          className="navigation-toggle"
          aria-label="Open navigation"
          data-expanded={open}
        >
          <span className="hamburger" aria-hidden="true">
            <i />
            <i />
          </span>
        </DialogTrigger>
        <DialogContent
          id="planeon-navigation-dialog"
          aria-labelledby="planeon-navigation-title"
          className="navigation-overlay"
          showCloseButton={false}
        >
          <div className="navigation-overlay-top">
            <DialogTitle id="planeon-navigation-title">
              Explore Planeon
            </DialogTitle>
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
          <div className="navigation-theme">
            <ThemeToggle labeled />
          </div>
          <nav className="overlay-links" aria-label="Expanded navigation">
            {[['/', 'Home'], ...primaryLinks].map(([href, label], index) => (
              <div key={href} className="navigation-link-mask">
                <a
                  href={href}
                  aria-current={current(href)}
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
              Your enterprise transformation partner.
              <br />
              Start with the work that matters.
            </p>
            <a className="button-primary" href="/contact">
              <ActionLabel>Discuss your workflow</ActionLabel>
            </a>
            <div className="overlay-resources">
              {[
                ['/blueprint', 'Blueprint'],
                ['/journey', 'Journey'],
                ['/evolution', 'Learning & Evolution'],
                ['/explorer', 'Explorer'],
                ['/roadmap', 'Roadmap'],
                ['/evolution/research', 'Research'],
                ['/whitepaper', 'Whitepaper'],
              ].map(([href, label]) => (
                <a key={href} href={href} aria-current={current(href)}>
                  {label}
                </a>
              ))}
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
          <p>
            Your enterprise transformation partner. From a priority workflow to
            an improving operating system.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <a href="/blueprint">Blueprint</a>
          <a href="/journey">Journey</a>
          <a href="/maturity">Maturity</a>
          <a href="/evolution">Learning & Evolution</a>
          <a href="/services">Services</a>
        </div>
        <div>
          <h2>Go further</h2>
          <a href="/resources">Resources & references</a>
          <a href="/assessment">Assess readiness</a>
          <a href="/contact">Discuss your workflow</a>
          <a href="/about">About Planeon</a>
        </div>
      </div>
      <div className="footer-provenance section-shell">
        <p>
          Reference models and illustrative examples are not customer results or
          certifications. Sources, qualifications and technical detail are
          available in <a href="/resources">Resources</a>.
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
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`page-intro section-shell${compact ? ' page-intro-compact' : ''}`}
    >
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
