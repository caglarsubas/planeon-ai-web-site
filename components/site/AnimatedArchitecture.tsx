'use client';
import { useEffect, useRef, useState } from 'react';
import { harnesses, planes, ringOrder } from '@/lib/harness';
const planeGeometry = ringOrder.map((plane, index) => ({
  plane,
  label: planes[plane].name,
  inner: 70 + index * 100,
  outer: 170 + index * 100,
  items: harnesses
    .filter((h) => h.plane === plane)
    .map((h) => ({
      number: h.number,
      sourceId: h.sourceId,
      shortName: h.shortName,
    })),
}));
const planeLegend = [...planeGeometry].reverse();
function pointOnCircle(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 500 + radius * Math.cos(radians),
    y: 500 + radius * Math.sin(radians),
  };
}

export function AnimatedArchitecture() {
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const labelAngles = [-45, 45, 135, 225];

  return (
    <figure className="onion-mini" ref={ref} data-paused={paused || !visible}>
      <button
        className="onion-pause outline-button"
        onClick={() => setPaused(!paused)}
      >
        {paused
          ? 'Resume architecture animation'
          : 'Pause architecture animation'}
      </button>
      <div className="onion-visual">
        <svg
          className="onion-graphic"
          viewBox="0 0 1000 1000"
          aria-hidden="true"
          focusable="false"
        >
          {planeGeometry.map(({ plane, inner, outer, items }) => {
            const middle = (inner + outer) / 2;
            const separators = [
              { x1: 500, y1: 500 - inner, x2: 500, y2: 500 - outer },
              { x1: 500 + inner, y1: 500, x2: 500 + outer, y2: 500 },
              { x1: 500, y1: 500 + inner, x2: 500, y2: 500 + outer },
              { x1: 500 - inner, y1: 500, x2: 500 - outer, y2: 500 },
            ];

            return (
              <g key={plane} className={`onion-plane onion-plane-${plane}`}>
                <circle
                  className="onion-plane-fill"
                  cx="500"
                  cy="500"
                  r={middle}
                  strokeWidth={outer - inner}
                />
                <circle
                  className="onion-plane-edge"
                  cx="500"
                  cy="500"
                  r={outer}
                />
                <g className={`onion-slicers onion-slicers-${plane}`}>
                  {separators.map((line, index) => (
                    <line key={index} {...line} pathLength="1" />
                  ))}
                </g>
                {items.map((item, index) => {
                  const position = pointOnCircle(middle, labelAngles[index]);

                  return (
                    <g
                      key={item.number}
                      transform={`translate(${position.x} ${position.y})`}
                    >
                      <text
                        className={`onion-harness-label onion-harness-${String(item.number).padStart(2, '0')}`}
                        textAnchor="middle"
                      >
                        <tspan className="onion-harness-number" x="0" dy="-7">
                          {item.number}
                        </tspan>
                        <tspan
                          className="onion-harness-short-name"
                          x="0"
                          dy="24"
                        >
                          {item.shortName}
                        </tspan>
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {planeGeometry.map(({ plane, label }) => (
          <span
            key={plane}
            className={`onion-plane-name onion-plane-name-${plane}`}
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
        <span className="onion-core" aria-hidden="true">
          MODEL
        </span>
      </div>
      <div className="onion-harness-ledger" aria-label="Harness legend">
        {planeLegend.map(({ plane, label, items }) => (
          <section
            key={plane}
            className={`onion-ledger-plane onion-ledger-${plane}`}
          >
            <h3>{label}</h3>
            <div className="onion-legend-entries">
              {items.map((item) => {
                const harness = harnesses.find(
                  (candidate) => candidate.n === item.sourceId,
                )!;

                return (
                  <details key={item.number} className="onion-legend-entry">
                    <summary>
                      <span className="onion-legend-number">{item.number}</span>
                      <span className="onion-legend-summary-copy">
                        <strong>{item.shortName}</strong>
                        <small>{harness.q}</small>
                      </span>
                      <span className="onion-legend-toggle" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <div className="onion-legend-detail">
                      <a className="text-link" href={harness.href}>
                        Full harness detail ↗
                      </a>
                      <p>{harness.mandate}</p>
                      <h4>Ingredients</h4>
                      <ul>
                        {harness.owns.map((ingredient) => (
                          <li key={ingredient}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <figcaption className="sr-only">
        The model remains fixed at the center. Four concern planes appear from
        the inside out: Knowledge, Execution, Trust, and Runtime. Each plane
        then divides into four equal segments with shortened harness names. The
        legend provides each harness explanation and ingredients.
      </figcaption>
    </figure>
  );
}
