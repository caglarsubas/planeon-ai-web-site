import mapping from '../data/reference/aml.v1.json';
export const features = mapping.features;
export type Feature = (typeof features)[number];
export const findFeature = (id: string | null) =>
  features.find((f) => f.id === id) ?? features.find((f) => f.id === 'A5')!;
export const featuresForHarness = (id: string) =>
  features.filter(
    (f) =>
      f.primary_accountable_harness === id ||
      f.contributors.some((c) => c.harness_id === id),
  );
export const relation = (f: Feature, harnessId: string) =>
  f.primary_accountable_harness === harnessId
    ? 'primary'
    : f.contributors.some((c) => c.harness_id === harnessId)
      ? 'contributor'
      : null;
export const releaseGates = [
  {
    id: 'software',
    name: 'Software correctness',
    explanation:
      'Can the declared software and contracts run, fail and recover correctly?',
    features: ['D4', 'E6', 'F9'],
  },
  {
    id: 'quality',
    name: 'AI quality',
    explanation:
      'Does the system deliver useful outcomes on representative, held-out tasks?',
    features: ['B1', 'F4', 'F10'],
  },
  {
    id: 'safety',
    name: 'Safety and governance',
    explanation:
      'Are applicable constraints enforced and approvals reconstructable?',
    features: ['A3', 'A5', 'A6'],
  },
  {
    id: 'agency',
    name: 'Agency and action control',
    explanation:
      'Are delegated actions bounded, interruptible and verified at the target?',
    features: ['A13', 'D7', 'D8'],
  },
] as const;
export const mappingProvenance = {
  version: mapping.version,
  date: mapping.date,
  status: 'Target reference model · not assessed',
  taxonomy: mapping.input_authority.harness_taxonomy_url,
  rules: mapping.mapping_rules,
};
