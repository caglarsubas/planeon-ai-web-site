'use client';
import { useState } from 'react';
import { searchStudioReferences } from '@/lib/studio/reference';
export function StudioReferenceSearch() {
  const [query, setQuery] = useState('');
  const results = searchStudioReferences(query);
  return (
    <details className="studio-reference-search">
      <summary>Find a harness, AML feature or example</summary>
      <label>
        Reference search
        <input
          type="search"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try authorization, retrieval or retail"
        />
      </label>
      {query && (
        <output className="studio-fine">
          {results.length
            ? `${results.length} matching references`
            : 'No matches. Try a shorter term.'}
        </output>
      )}
      <ul>
        {results.map((r) => (
          <li key={`${r.kind}:${r.id}`}>
            <span className="studio-fine">{r.kind}</span>
            <a href={r.href}>{r.title}</a>
            <a href={r.designHref}>Use in my journey →</a>
          </li>
        ))}
      </ul>
    </details>
  );
}
