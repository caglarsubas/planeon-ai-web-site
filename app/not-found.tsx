/* oxlint-disable next/no-html-link-for-pages -- vinext production Link navigation is broken in the current Sites runtime. */
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { ActionLabel } from '@/components/site/VisualPrimitives';

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="not-found section-shell">
        <div className="not-found-code" aria-hidden="true">
          <span>4</span>
          <i>0</i>
          <span>4</span>
        </div>
        <div>
          <p className="eyebrow">Boundary not found</p>
          <h1>This path is outside the blueprint.</h1>
          <p>
            The page may have moved, or the address may be incomplete. Return to
            the architecture map and choose a defined boundary.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="/blueprint">
              <ActionLabel>Open the blueprint</ActionLabel>
            </a>
            <a className="text-link" href="/">
              Return home
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
