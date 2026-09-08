import {
  maturityLevels,
  type MaturityLevelId,
} from '../data/maturity-levels.v1';

export function findMaturityLevel(value: string | null | undefined) {
  return (
    maturityLevels.find((level) => level.id === value) ?? maturityLevels[0]
  );
}

// Evidence is inspected independently of level selection. Clear competing Atlas
// filters, but retain scenario, matrix and other shareable reading context.
export function maturityEvidenceHref(
  params: URLSearchParams,
  level: MaturityLevelId,
  feature: string,
) {
  const query = new URLSearchParams(params);
  query.set('level', level);
  query.set('feature', feature);
  query.delete('harness');
  query.delete('domain');
  return `/maturity?${query.toString()}#evidence-atlas`;
}
