import type { ComponentProps, ReactNode } from 'react';

/** One concentric enclosure for major reading and working surfaces. */
export function Surface({
  children,
  className = '',
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={`surface-shell ${className}`} {...props}>
      <div className="surface-core">{children}</div>
    </div>
  );
}

export function ArrowIsland() {
  return (
    <span className="arrow-island" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <path d="M6 18 18 6M6 6h12v12" />
      </svg>
    </span>
  );
}

export function ActionLabel({ children }: { children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <ArrowIsland />
    </>
  );
}
