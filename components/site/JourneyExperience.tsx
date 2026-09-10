'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */

import { useUrlState } from '@/lib/url-state';
import { findScenario } from '@/lib/scenarios';
import { ScenarioWorkbench } from './ScenarioWorkbench';
import { CanonicalExchanges } from './CanonicalExchanges';
import { JourneyDesigner } from './JourneyDesigner';

export function JourneyExperience() {
  const { params, update } = useUrlState();
  const design = params.get('mode') === 'design';
  function select(mode: string) {
    if ((mode === 'design') === design) return;
    update({
      mode: mode === 'design' ? 'design' : null,
      ...(mode === 'design'
        ? { scenario: findScenario(params.get('scenario')).id }
        : {}),
    });
  }
  return (
    <>
      <div className="studio-entrance section-shell">
        <div>
          <span className="eyebrow">Journey Studio</span>
          <h1>From a workflow to a working proposal.</h1>
        </div>
        <div className="studio-switch" aria-label="Journey entrance">
          <button
            type="button"
            aria-pressed={!design}
            onClick={() => select('explore')}
          >
            Explore an example
          </button>
          <button
            type="button"
            aria-pressed={design}
            onClick={() => select('design')}
          >
            Design my journey
          </button>
          <a href="/journey/requests">My requests</a>
        </div>
      </div>
      <div hidden={!design}>
        <JourneyDesigner />
      </div>
      {!design && (
        <>
          <ScenarioWorkbench embedded />
          <CanonicalExchanges />
        </>
      )}
    </>
  );
}
