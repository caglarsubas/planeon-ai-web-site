import { featuresForHarness, relation } from './aml';
import { byId, bySource, harnesses } from './harness';
import type { Frame, Occurrence } from './scenarios';

/** Receiving boundary first. The core and external systems are not harnesses. */
export function occurrenceHarnesses(step: Occurrence) {
  const ids = [step.message.to, step.message.from].flatMap((endpoint) =>
    endpoint === 'all'
      ? harnesses.map((h) => h.id)
      : typeof endpoint === 'number'
        ? [bySource(endpoint)?.id].filter((id): id is NonNullable<typeof id> =>
            Boolean(id),
          )
        : [],
  );
  return [...new Set(ids)].map((id) => byId(id)!);
}

// Curated reading suggestions, not new feature/occurrence assessment mappings.
// A suggestion is used only when the existing registry relates it to the harness.
const suggestedReading: Record<number, string> = {
  4: 'A5',
  8: 'B1',
  9: 'B1',
  10: 'B1',
  13: 'B1',
  19: 'A5',
  20: 'A5',
  21: 'A5',
  22: 'A5',
  23: 'D7',
  28: 'D7',
  29: 'D7',
  30: 'D8',
  31: 'D8',
  32: 'D8',
  37: 'D8',
};

export function journeyMapping(
  frame: Frame,
  active: Occurrence,
  harnessId?: string | null,
  featureId?: string | null,
) {
  const inFrame = frame.steps
    .filter((s) => !s.skipped && !s.branchNotTaken)
    .flatMap(occurrenceHarnesses);
  const involved = [...new Map(inFrame.map((h) => [h.id, h])).values()];
  const endpoints = occurrenceHarnesses(active);
  const pinned = byId(harnessId ?? '');
  const harness = pinned ?? endpoints[0];
  const rows = (harness ? featuresForHarness(harness.id) : [])
    .map((feature) => ({
      feature,
      role: relation(feature, harness!.id)!,
      contribution: feature.contributors.find(
        (c) => c.harness_id === harness!.id,
      ),
    }))
    .sort(
      (a, b) => Number(b.role === 'primary') - Number(a.role === 'primary'),
    );
  const suggested = suggestedReading[active.message.n ?? -1];
  const selected =
    rows.find((r) => r.feature.id === featureId) ??
    rows.find((r) => r.feature.id === suggested) ??
    rows[0];
  return {
    harness,
    rows,
    selected,
    endpoints,
    involved,
    pinned: Boolean(pinned),
    onStage: Boolean(harness && involved.some((h) => h.id === harness.id)),
    omitted: Boolean(active.skipped || active.branchNotTaken),
  };
}

export function journeyAtlasHref(context: {
  scenario: string;
  occurrence: string;
  harness: string;
  feature: string;
}) {
  return `/maturity?${new URLSearchParams(context)}#expected-evidence`;
}
