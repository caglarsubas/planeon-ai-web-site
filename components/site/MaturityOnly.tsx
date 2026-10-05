import type { ReactNode } from 'react';
import { maturityPageEnabled } from '@/lib/site-visibility';

export function MaturityOnly({ children }: { children: ReactNode }) {
  return maturityPageEnabled ? children : null;
}
