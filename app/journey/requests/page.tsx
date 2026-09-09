import { SiteFrame } from '@/components/site/SiteFrame';
import { StudioRequests } from '@/components/site/StudioRequests';
import '../studio.css';
export const metadata = {
  title: 'My requests · Planeon',
  robots: { index: false, follow: false },
};
export default function RequestsPage() {
  return (
    <SiteFrame className="reference-page">
      <StudioRequests />
    </SiteFrame>
  );
}
