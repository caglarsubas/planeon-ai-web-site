import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome';
import { MaturityAtlas } from '@/components/site/MaturityAtlas';
export const metadata: Metadata = {
  title: 'Maturity Atlas',
  description:
    '57 AML feature families mapped to 16 harnesses, with primary accountability, contributors and expected evidence.',
};
export default function MaturityPage() {
  return (
    <main className="reference-page">
      <SiteHeader />
      <MaturityAtlas />
      <SiteFooter />
    </main>
  );
}
