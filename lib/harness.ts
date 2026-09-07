import content from '../data/content.json';

export const contentVersion = '2026-09-07.1';
export const planes = {
  runtime: { name: 'Runtime plane', color: '#3E5F70', tint: '#E7EEF2' },
  trust: { name: 'Trust plane', color: '#7B3F63', tint: '#F1E5EC' },
  execution: { name: 'Execution plane', color: '#C6712A', tint: '#F9ECDF' },
  knowledge: { name: 'Knowledge plane', color: '#2F7F6E', tint: '#E3F1EC' },
} as const;
export type Plane = keyof typeof planes;
const identities = [
  ['runtime.infrastructure', 1, 1, 'Compute', 'INF'],
  ['runtime.model-inference', 2, 2, 'Model', 'MOD'],
  ['runtime.ai-gateway', 3, 3, 'Gateway', 'GW'],
  ['runtime.experience', 4, 4, 'Interaction', 'UX'],
  ['trust.security-safety', 13, 5, 'Secure&Safe', 'SEC'],
  ['trust.governance-agentops', 14, 6, 'Governance', 'GOV'],
  ['trust.observability-finops', 15, 7, 'Observability', 'OBS'],
  ['trust.evaluation-assurance', 16, 8, 'Evaluation', 'EVAL'],
  ['execution.protocol-interoperability', 9, 9, 'Protocol', 'PROTO'],
  ['execution.orchestration', 10, 10, 'Orchestration', 'ORCH'],
  ['execution.tool-skill-sandbox', 11, 11, 'Action', 'TOOL'],
  ['execution.ml-decision', 12, 12, 'ML', 'DEC'],
  ['knowledge.domain-semantic', 5, 13, 'Domain', 'DOM'],
  ['knowledge.data-integration', 6, 14, 'Data', 'DATA'],
  ['knowledge.retrieval-context', 7, 15, 'Retrieval', 'RET'],
  ['knowledge.memory-state', 8, 16, 'Memory', 'MEM'],
] as const;
export const harnesses = identities.map(
  ([id, sourceId, number, shortName, alias]) => {
    const original = Object.values(content.harnesses).find(
      (h) => h.n === sourceId,
    )!;
    return {
      ...original,
      id,
      sourceId,
      number,
      shortName,
      alias,
      plane: original.plane as Plane,
      href: `/blueprint/${sourceId}`,
    };
  },
);
export type Harness = (typeof harnesses)[number];
export const byId = (id: string) => harnesses.find((h) => h.id === id);
export const bySource = (id: number) =>
  harnesses.find((h) => h.sourceId === id);
export const ringOrder: Plane[] = [
  'knowledge',
  'execution',
  'trust',
  'runtime',
];
export const endpointName = (id: string | number) =>
  typeof id === 'number'
    ? (bySource(id)?.shortName ?? `Unknown ${id}`)
    : ({
        user: 'User',
        core: 'Model core',
        ext: 'External system',
        trig: 'Trigger',
        all: 'All harnesses',
      }[id] ?? id);
export function consultationHref(context: {
  scenario?: string;
  harness?: string;
  feature?: string;
}) {
  return `/assessment?${new URLSearchParams(Object.entries(context).filter((entry): entry is [string, string] => Boolean(entry[1])))}#professional-assessment`;
}
