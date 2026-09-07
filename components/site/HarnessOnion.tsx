/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG contains individually keyboard-operable harness groups. */
'use client';
import { useId } from 'react';
import { harnesses, planes, ringOrder, endpointName } from '@/lib/harness';
import type { Endpoint, Occurrence } from '@/lib/scenarios';

export function HarnessOnion({
  active = [],
  selected,
  onSelect,
}: {
  active?: Occurrence[];
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const marker = useId().replace(/:/g, '');
  const positions: Record<string, { x: number; y: number }> = {
    core: { x: 500, y: 500 },
    user: { x: 170, y: 25 },
    ext: { x: 830, y: 25 },
    trig: { x: 500, y: 20 },
  };
  ringOrder.forEach((plane, ring) =>
    harnesses
      .filter((h) => h.plane === plane)
      .forEach((h, i) => {
        const angle = ((-45 + i * 90) * Math.PI) / 180;
        const radius = 120 + ring * 100;
        positions[h.sourceId] = {
          x: 500 + radius * Math.cos(angle),
          y: 500 + radius * Math.sin(angle),
        };
      }),
  );
  const endpoints: Endpoint[] = active
    .filter((s) => !s.skipped && !s.branchNotTaken)
    .flatMap((s) => [s.message.from, s.message.to]);
  return (
    <div className="harness-onion-reference">
      <svg
        viewBox="0 0 1000 1000"
        className="reference-onion"
        role="group"
        aria-label="Four concern planes, from Knowledge through Execution and Trust to outer Runtime. Select a named harness."
      >
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 1 1 L 9 5 L 1 9"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        {ringOrder.map((plane, ring) => (
          <g key={plane}>
            <circle
              cx="500"
              cy="500"
              r={120 + ring * 100}
              fill="none"
              stroke={planes[plane].tint}
              strokeWidth="98"
            />
            <circle
              cx="500"
              cy="500"
              r={170 + ring * 100}
              fill="none"
              stroke={planes[plane].color}
              strokeWidth="1.4"
            />
            {[0, 90, 180, 270].map((a) => {
              const rad = (a * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={500 + (70 + ring * 100) * Math.cos(rad)}
                  y1={500 + (70 + ring * 100) * Math.sin(rad)}
                  x2={500 + (170 + ring * 100) * Math.cos(rad)}
                  y2={500 + (170 + ring * 100) * Math.sin(rad)}
                  stroke="var(--paper)"
                  strokeWidth="4"
                />
              );
            })}
          </g>
        ))}
        {active
          .filter((s) => !s.skipped && !s.branchNotTaken)
          .map((s) => {
            const a = positions[s.message.from],
              b = positions[s.message.to];
            if (!a || !b) return null;
            const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const ux = (b.x - a.x) / distance,
              uy = (b.y - a.y) / distance;
            const inset = (endpoint: Endpoint) =>
              Math.min(
                distance * 0.44,
                endpoint === 'core'
                  ? 64
                  : typeof endpoint === 'number'
                    ? Math.min(
                        97 / Math.abs(ux || 0.0001),
                        39 / Math.abs(uy || 0.0001),
                      )
                    : 22,
              );
            const start = inset(s.message.from),
              end = inset(s.message.to);
            return (
              <line
                key={s.id}
                x1={a.x + ux * start}
                y1={a.y + uy * start}
                x2={b.x - ux * end}
                y2={b.y - uy * end}
                stroke="var(--ink)"
                strokeWidth="3"
                strokeDasharray={s.message.reply ? '8 5' : undefined}
                markerEnd={`url(#${marker})`}
              />
            );
          })}
        <circle cx="500" cy="500" r="56" fill="var(--ink)" />
        <text
          x="500"
          y="507"
          textAnchor="middle"
          fill="var(--paper)"
          fontSize="22"
          fontWeight="700"
        >
          MODEL
        </text>
        {harnesses.map((h) => {
          const p = positions[h.sourceId];
          const emphasized =
            endpoints.includes(h.sourceId) || selected === h.id;
          return (
            <g
              key={h.id}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${h.number} ${h.shortName}, ${planes[h.plane].name}`}
              aria-pressed={onSelect ? selected === h.id : undefined}
              onClick={() => onSelect?.(h.id)}
              onKeyDown={(e) => {
                if (onSelect && ['Enter', ' '].includes(e.key)) {
                  e.preventDefault();
                  onSelect(h.id);
                }
              }}
              className={`onion-selectable${emphasized ? ' is-emphasized' : ''}`}
            >
              <rect
                x={p.x - (h.plane === 'knowledge' ? 64 : 91)}
                y={p.y - 30}
                width={h.plane === 'knowledge' ? 128 : 182}
                height="60"
                rx="3"
                fill={planes[h.plane].tint}
                stroke={emphasized ? planes[h.plane].color : 'none'}
                strokeWidth="4"
              />
              <text
                x={p.x}
                y={p.y - 5}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="19"
              >
                {h.number}
              </text>
              <text
                x={p.x}
                y={p.y + 22}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize={h.shortName.length > 12 ? 21 : 23}
                fontWeight="600"
              >
                {h.shortName}
              </text>
            </g>
          );
        })}
        {(['user', 'ext', 'trig'] as const)
          .filter((id) => endpoints.includes(id))
          .map((id) => (
            <text
              key={id}
              x={positions[id].x}
              y={positions[id].y + 4}
              fontSize="20"
              textAnchor="middle"
              fill="var(--ink)"
            >
              {endpointName(id)}
            </text>
          ))}
      </svg>
      <div className="plane-key">
        {Object.entries(planes).map(([id, p]) => (
          <span key={id}>
            <i style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
      <div className="onion-mobile-controls">
        {ringOrder.map((plane) => (
          <div key={plane}>
            <b>{planes[plane].name}</b>
            <div>
              {harnesses
                .filter((h) => h.plane === plane)
                .map((h) => (
                  <button
                    key={h.id}
                    onClick={() => onSelect?.(h.id)}
                    aria-pressed={selected === h.id}
                    className={
                      endpoints.includes(h.sourceId) ? 'active-boundary' : ''
                    }
                  >
                    {h.number} · {h.shortName}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
