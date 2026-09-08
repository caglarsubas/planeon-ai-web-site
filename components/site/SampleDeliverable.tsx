'use client';
import type { ReactNode } from 'react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

/** A hydrated control owns expansion, including replayed early keyboard or pointer input. */
export function SampleDeliverable({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Collapsible className="sample-deliverable">
      <h3 className="sample-heading">
        <CollapsibleTrigger
          id={`${id}-trigger`}
          aria-controls={`${id}-content`}
        >
          <span className="sample-label">Example deliverable</span>
          <span className="sample-title">{title}</span>
          <span className="sample-indicator" aria-hidden="true" />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent
        id={`${id}-content`}
        aria-labelledby={`${id}-trigger`}
      >
        <div className="sample-body">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
