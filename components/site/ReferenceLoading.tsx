/* oxlint-disable jsx-a11y/prefer-tag-over-role -- A loading status contains block-level placeholders; it is not a calculated form output. */
import { Skeleton } from '@/components/ui/skeleton';

/** Reserve a useful diagram footprint while an optional reference is loaded. */
export function ReferenceLoading({ label }: { label: string }) {
  return (
    <div className="reference-loading" role="status" aria-live="polite">
      <p>{label}</p>
      <div className="reference-loading-rows" aria-hidden="true">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} />
        ))}
      </div>
    </div>
  );
}
