'use client';
import { lazy, Suspense } from 'react';
import { ReferenceLoading } from './ReferenceLoading';
import { atlasRequested } from '@/lib/maturity-disclosure';
import { MaturityLevels } from './MaturityLevels';
import { useUrlState } from '@/lib/url-state';

const MaturityAtlas = lazy(() =>
  import('./MaturityAtlas').then((module) => ({
    default: module.MaturityAtlas,
  })),
);

export type MaturitySelection = Pick<
  ReturnType<typeof useUrlState>,
  'params' | 'update'
>;

export function MaturityExperience() {
  // One history owner keeps level, evidence and reverse lookup synchronized.
  const { params, hash, update } = useUrlState();
  const showAtlas = atlasRequested(params, hash);
  return (
    <>
      <MaturityLevels params={params} update={update} />
      <div id="evidence-atlas" className="atlas-entry">
        {showAtlas ? (
          <Suspense
            fallback={
              <ReferenceLoading label="Loading the evidence reference…" />
            }
          >
            <MaturityAtlas params={params} update={update} />
          </Suspense>
        ) : (
          <section
            className="atlas-invitation section-shell"
            aria-labelledby="atlas-invitation-title"
          >
            <div>
              <p className="eyebrow">Go deeper / Evidence Atlas</p>
              <h2 id="atlas-invitation-title">
                What would demonstrate this capability?
              </h2>
              <p>
                Explore 57 feature families, their accountable owners and
                contributing harnesses. This reference library describes
                evidence to seek—not controls already passed.
              </p>
            </div>
            <button
              className="button-primary"
              onClick={() => update({ atlas: 'open' })}
            >
              Explore evidence requirements
            </button>
          </section>
        )}
      </div>
    </>
  );
}
