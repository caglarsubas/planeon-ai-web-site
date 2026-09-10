/** Existing specialist URLs remain entry points; a level alone stays approachable. */
export function atlasRequested(params: URLSearchParams, hash = '') {
  return (
    params.get('atlas') === 'open' ||
    ['feature', 'harness', 'domain', 'matrix', 'gate'].some((key) =>
      params.has(key),
    ) ||
    hash === '#evidence-atlas' ||
    hash === '#evidence-atlas-title' ||
    hash === '#expected-evidence'
  );
}
