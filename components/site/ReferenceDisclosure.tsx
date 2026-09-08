'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useUrlState } from '@/lib/url-state';

/** Native disclosure; existing fragment links reveal their content before scrolling. */
export function ReferenceDisclosure({ id, anchors = [], title, children, className = '' }: {
  id: string; anchors?: string[]; title: string; children: ReactNode; className?: string;
}) {
  const { hash } = useUrlState();
  const ref = useRef<HTMLDetailsElement>(null);
  const matches = hash === `#${id}` || anchors.some((anchor) => hash === `#${anchor}`);
  useEffect(() => {
    if (!matches || !ref.current) return;
    ref.current.open = true;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [matches, hash]);
  return <details id={id} ref={ref} className={`reference-disclosure ${className}`}>
    <summary>{title}</summary>
    <div className="reference-disclosure-content">{children}</div>
  </details>;
}
