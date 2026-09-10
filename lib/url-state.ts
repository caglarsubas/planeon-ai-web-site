'use client';
import { useCallback, useEffect, useState } from 'react';

// Browser history is owned by the page. Manual selections push; playback replaces.
// Initialization is deferred to hydration so server and client markup agree.
export function useUrlState() {
  const [params, setParams] = useState(() => new URLSearchParams());
  const [hash, setHash] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => {
      setParams(new URLSearchParams(location.search));
      setHash(location.hash);
      setReady(true);
    };
    read();
    window.addEventListener('popstate', read);
    window.addEventListener('hashchange', read);
    return () => {
      window.removeEventListener('popstate', read);
      window.removeEventListener('hashchange', read);
    };
  }, []);
  const update = useCallback(
    (values: Record<string, string | null>, replace = false) => {
      const url = new URL(location.href);
      for (const [key, value] of Object.entries(values)) {
        if (value === null) url.searchParams.delete(key);
        else url.searchParams.set(key, value);
      }
      // A speed/view change must not discard an old #step-N selection.
      // Explicit cursor/scenario changes replace it; harness updates replace
      // only the old harness anchor, not the selected scenario exchange.
      if (
        'occurrence' in values ||
        'scenario' in values ||
        ('harness' in values && url.hash.startsWith('#harness-'))
      )
        url.hash = '';
      history[replace ? 'replaceState' : 'pushState'](null, '', url);
      setParams(new URLSearchParams(url.search));
      setHash(url.hash);
    },
    [],
  );
  return { params, hash, ready, update };
}
