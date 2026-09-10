import { SiteFrame } from '@/components/site/SiteFrame';
import { StudioRequests } from '@/components/site/StudioRequests';
import '../studio.css';
export const metadata = {
  title: 'Private pack review · Planeon',
  robots: { index: false, follow: false },
};
export default function ReviewPage() {
  return (
    <SiteFrame className="reference-page">
      <StudioRequests reviewer />
    </SiteFrame>
  );
}
