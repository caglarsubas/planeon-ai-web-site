import index from '../data/reference/selection-index.v1.json';
import { byId } from './harness';
export function reviewedContext(params: URLSearchParams) {
  const scenario = index.scenarios.find((s) => s.id === params.get('scenario'));
  const feature = index.features.find((f) => f.id === params.get('feature'));
  const harness = byId(params.get('harness') ?? '');
  return [
    scenario
      ? `Scenario: ${scenario.title} (${scenario.initiated}-initiated).`
      : '',
    harness ? `Harness: ${harness.number} · ${harness.shortName}.` : '',
    feature ? `Evidence question: ${feature.id} · ${feature.name}.` : '',
  ].filter(Boolean);
}
export function appendReviewedContext(brief: string, context: string[]) {
  const addition = context.join('\n');
  if (!addition || brief.includes(addition)) return brief;
  const result = `${brief.trim()}${brief.trim() ? '\n\n' : ''}Reviewed context:\n${addition}`;
  return result.length <= 1200 ? result : null;
}
