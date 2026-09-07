import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

/** Shared landmarks keep the skip destination after navigation on every route. */
export function SiteFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <SiteHeader />
      <main id="page-content" tabIndex={-1} className={className}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
