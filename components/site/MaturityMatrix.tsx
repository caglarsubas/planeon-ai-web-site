/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Scroll regions must be keyboard-scrollable. */
'use client';
import { features, relation } from '@/lib/aml';
import { harnesses } from '@/lib/harness';
export default function MaturityMatrix({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section
      className="matrix-scroll"
      tabIndex={0}
      aria-label="All AML feature and harness relationships, scroll in either direction"
    >
      <table className="maturity-matrix">
        <caption>Target reference mapping · 57 families × 16 harnesses</caption>
        <thead>
          <tr>
            <th scope="col">Feature family</th>
            {harnesses.map((h) => (
              <th key={h.id} scope="col">
                <span>{h.number}</span>
                {h.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.id} className={selected === f.id ? 'selected' : ''}>
              <th scope="row">
                <button onClick={() => onSelect(f.id)}>
                  {f.id} · {f.name}
                </button>
              </th>
              {harnesses.map((h) => {
                const r = relation(f, h.id);
                return (
                  <td key={h.id} className={r ?? ''}>
                    <span aria-label={r ?? 'No mapped relationship'}>
                      {r === 'primary' ? '◆' : r === 'contributor' ? '○' : '—'}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
