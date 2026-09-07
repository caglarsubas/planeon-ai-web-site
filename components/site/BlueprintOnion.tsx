'use client';
import { HarnessOnion } from './HarnessOnion';
import { byId } from '@/lib/harness';
import { useUrlState } from '@/lib/url-state';
export function BlueprintOnion() {
  const { params, update } = useUrlState();
  const h =
    byId(params.get('harness') ?? '') ?? byId('knowledge.retrieval-context')!;
  return (
    <section className="blueprint-onion-section section-shell">
      <div>
        <div className="section-number">THE ARCHITECTURE</div>
        <h2>
          One model.
          <br />
          Sixteen boundaries.
        </h2>
        <p>
          Runtime is the outer plane; Knowledge is nearest the core. Rings group
          concerns, not priority or deployment dependencies.
        </p>
        <div className="inline-evidence">
          <p className="eyebrow">
            {h.number} / {h.shortName}
          </p>
          <h3>{h.q}</h3>
          <p>{h.mandate}</p>
          <a className="text-link" href={h.href}>
            Inspect this boundary ↗
          </a>
        </div>
      </div>
      <HarnessOnion
        selected={h.id}
        onSelect={(id) => update({ harness: id })}
      />
    </section>
  );
}
