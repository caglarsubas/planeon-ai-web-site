/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG harness sectors are keyboard-operable controls. */
/* oxlint-disable next/no-html-link-for-pages -- Preserve native site links. */
'use client';
import { planePaint } from '@/lib/theme';
import { Surface } from './VisualPrimitives';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  byId,
  endpointName,
  harnesses,
  planes,
  ringOrder,
  type Harness,
} from '@/lib/harness';
import {
  circleArc,
  endpointPoint,
  handoffRoute,
  motionPhases,
  onionGeometry,
  sectorFor,
  sectorPath,
} from '@/lib/journey-motion';
import { kindNames, type Frame, type Occurrence } from '@/lib/scenarios';
import type { JourneyClock } from './useJourneyClock';

type RouteEntry = {
  step: Occurrence;
  route: NonNullable<ReturnType<typeof handoffRoute>>;
};
function routesFor(frame: Frame): RouteEntry[] {
  const duplicates = new Map<string, number>();
  return frame.steps.flatMap((step) => {
    const pair = `${step.message.from}:${step.message.to}`;
    const lane = duplicates.get(pair) ?? 0;
    duplicates.set(pair, lane + 1);
    const route = handoffRoute(step.message.from, step.message.to, lane);
    return route ? [{ step, route }] : [];
  });
}

export function JourneyStage({
  frame,
  frames,
  index,
  active,
  scenarioId,
  playing,
  clock,
  harness,
  onSelectHarness,
  onSelectOccurrence,
  onPause,
  detailPanel,
  customProposal = false,
}: {
  frame: Frame;
  frames: Frame[];
  index: number;
  active: Occurrence;
  scenarioId: string;
  playing: boolean;
  clock: JourneyClock;
  harness?: Harness;
  onSelectHarness: (id: string | null) => void;
  onSelectOccurrence: (id: string) => void;
  onPause: () => void;
  detailPanel: ReactNode;
  customProposal?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const [trail, setTrail] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const phase = customProposal
    ? {
        short: 'Proposed workflow',
        title: 'Custom design proposal',
        color: planes.runtime.color,
      }
    : (motionPhases[active.message.phase as keyof typeof motionPhases] ??
      motionPhases.PH2);
  const paths = useMemo(() => routesFor(frame), [frame]);
  const earlier = useMemo(
    () =>
      frames
        .slice(trail ? 0 : Math.max(0, index - 2), index)
        .filter((f) => f.clock === frame.clock && f.pass === frame.pass)
        .flatMap(routesFor)
        .filter((x) => !x.step.skipped && !x.step.branchNotTaken),
    [frames, index, trail, frame.clock, frame.pass],
  );
  const involved = frame.steps
    .filter((s) => !s.skipped && !s.branchNotTaken)
    .flatMap((s) => [s.message.from, s.message.to]);
  const hovered = hover ? byId(hover) : null;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const surface = svg.current;
    if (!surface) return;
    const visuals = paths.map(({ step }, i) => {
      const path = surface.querySelector<SVGPathElement>(
        `[data-motion-path="${i}"]`,
      );
      const mask = surface.querySelector<SVGPathElement>(
        `[data-motion-mask="${i}"]`,
      );
      const packet = surface.querySelector<SVGGElement>(`[data-packet="${i}"]`);
      const arrival = surface.querySelector<SVGGElement>(
        `[data-arrival="${i}"]`,
      );
      return {
        step,
        path,
        mask,
        packet,
        arrival,
        length: path?.getTotalLength() ?? 0,
      };
    });
    const maxDuration = Math.max(1, ...frame.steps.map((s) => s.duration));
    const corePulse = surface.querySelector<SVGGElement>('.journey-core-pulse');
    const coreActive = paths.some(
      (p) => p.route.core && !p.step.skipped && !p.step.branchNotTaken,
    );
    let latest: {
      elapsed: number;
      travel: number;
      total: number;
      running: boolean;
    } | null = null;
    const draw = (tick: NonNullable<typeof latest>) => {
      latest = tick;
      const { elapsed, travel, total, running } = tick;
      if (corePulse) {
        const t = Math.min(1, elapsed / Math.max(1, travel));
        corePulse.style.opacity =
          coreActive && !media.matches
            ? String(Math.sin(Math.PI * t) * 0.65)
            : '0';
        const circle = corePulse.firstElementChild as SVGCircleElement | null;
        if (circle) circle.style.transform = `scale(${1 + t * 0.12})`;
      }
      if (progress.current)
        progress.current.style.transform = `scaleX(${Math.min(1, elapsed / total)})`;
      if (root.current)
        root.current.dataset.beat =
          travel === 0
            ? 'omitted'
            : elapsed < travel
              ? 'travelling'
              : 'delivered';
      for (const v of visuals) {
        const skip = v.step.skipped || v.step.branchNotTaken;
        const duration = travel * Math.max(0.45, v.step.duration / maxDuration);
        const t = media.matches
          ? 1
          : Math.min(1, elapsed / Math.max(1, duration));
        const eased = t * t * (3 - 2 * t);
        v.mask?.setAttribute('stroke-dashoffset', String(1 - eased));
        if (v.packet && v.path) {
          const p = v.path.getPointAtLength(v.length * eased);
          v.packet.style.transform = `translate(${p.x}px,${p.y}px)`;
          v.packet.style.opacity =
            !skip && !media.matches && t > 0 && t < 1 ? '1' : '0';
        }
        if (v.arrival) {
          const amount = media.matches
            ? 1
            : Math.max(0, Math.min(1, (elapsed - duration) / 520));
          v.arrival.style.opacity =
            !skip && t >= 1 ? String((1 - amount) * 0.7) : '0';
          const pulse = v.arrival.firstElementChild as SVGCircleElement | null;
          if (pulse) pulse.style.transform = `scale(${1 + amount * 1.4})`;
        }
      }
      surface.dataset.moving = String(
        running && !media.matches && elapsed < travel,
      );
    };
    const unsubscribe = clock.subscribe(draw);
    const changed = () => {
      if (latest) draw(latest);
    };
    media.addEventListener('change', changed);
    return () => {
      unsubscribe();
      media.removeEventListener('change', changed);
    };
  }, [clock, paths, frame]);

  const phaseTargets = Object.entries(motionPhases)
    .map(([key, value]) => ({
      key,
      ...value,
      index: frames.findIndex((f) => f.steps[0].message.phase === key),
    }))
    .filter((p) => p.index >= 0);
  return (
    <div
      ref={root}
      className="journey-stage"
      style={{ '--journey-signal': phase.color } as CSSProperties}
    >
      {!customProposal && (
        <nav className="journey-chapters" aria-label="Journey chapters">
          {phaseTargets.map((p, i) => (
            <button
              key={p.key}
              aria-current={active.message.phase === p.key ? 'step' : undefined}
              onClick={() => onSelectOccurrence(frames[p.index].steps[0].id)}
            >
              <span>0{i + 1}</span>
              {p.short}
            </button>
          ))}
        </nav>
      )}
      <div className="journey-stage-layout">
        <Surface className="journey-visual">
          <div className="journey-diagram-heading">
            <span>
              {frame.clock === 'task'
                ? `Pass ${frame.pass} · ${phase.short}`
                : frame.clock === 'offline'
                  ? 'Offline improvement'
                  : 'Continuous evidence'}
            </span>
            <button
              className="journey-trail-toggle"
              aria-pressed={trail}
              onClick={() => setTrail(!trail)}
            >
              Keep trail
            </button>
          </div>
          <svg
            ref={svg}
            className="journey-onion"
            viewBox="0 0 1100 1180"
            role="group"
            aria-label="Animated task handoffs across sixteen named harnesses. Runtime is the outer plane; only model exchanges reach the stationary core."
          >
            <defs>
              <marker
                id={`${id}-arrow`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="9"
                markerHeight="9"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
              </marker>
              {harnesses.map((h) => {
                const s = sectorFor(h.sourceId);
                return (
                  <path
                    key={h.id}
                    id={`${id}-label-${h.number}`}
                    d={circleArc(
                      s.radius,
                      s.angle - s.direction * 41,
                      s.angle + s.direction * 41,
                    )}
                  />
                );
              })}
              {paths.map(({ route }, i) => (
                <mask
                  key={i}
                  id={`${id}-reveal-${i}`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="1100"
                  height="1180"
                >
                  <path
                    data-motion-mask={i}
                    d={route.d}
                    fill="none"
                    stroke="white"
                    strokeWidth="14"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="0"
                  />
                </mask>
              ))}
            </defs>
            {harnesses.map((h) => {
              const lit =
                  involved.includes(h.sourceId) || involved.includes('all'),
                selected = harness?.id === h.id;
              return (
                <g
                  key={h.id}
                  className={`journey-sector${lit ? ' is-involved' : ''}${selected ? ' is-selected' : ''}${hovered && hovered.id !== h.id ? ' is-muted' : ''}`}
                  style={
                    {
                      '--sector-color': planePaint(h.plane).color,
                      '--sector-tint': planePaint(h.plane).tint,
                    } as CSSProperties
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`${h.number} ${h.shortName}, ${planes[h.plane].name}`}
                  aria-pressed={selected}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(h.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelectHarness(selected ? null : h.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectHarness(selected ? null : h.id);
                    }
                  }}
                >
                  <path className="journey-wedge" d={sectorPath(h.sourceId)} />
                  <path
                    className="journey-wedge-focus"
                    d={sectorPath(h.sourceId)}
                  />
                  <title>{`${h.number} ${h.shortName}: ${h.mandate}`}</title>
                </g>
              );
            })}
            <circle
              cx="550"
              cy="600"
              r={onionGeometry.core - 3}
              fill="var(--ink)"
            />
            <text className="journey-core-overline" x="550" y="570">
              THE MODEL
            </text>
            <text className="journey-core-title" x="550" y="613">
              Intelligence
            </text>
            <text className="journey-core-note" x="550" y="642">
              One part of the system
            </text>
            <g
              className="journey-core-pulse"
              transform="translate(550,600)"
              style={{ opacity: 0 }}
              aria-hidden="true"
            >
              <circle r={onionGeometry.core} />
            </g>
            {earlier.map(({ step, route }, i) => (
              <path
                key={`${step.id}-${i}`}
                className="journey-route-trail"
                d={route.d}
                strokeDasharray={step.message.reply ? '7 5' : undefined}
              />
            ))}
            <g className="journey-routes" key={frame.id}>
              {paths.map(({ step, route }, i) => {
                const omitted = Boolean(step.skipped || step.branchNotTaken);
                return (
                  <g
                    key={step.id}
                    className={
                      omitted ? 'journey-route is-omitted' : 'journey-route'
                    }
                    data-occurrence={step.id}
                  >
                    <path
                      data-motion-path={i}
                      className="journey-route-underlay"
                      d={route.d}
                      strokeDasharray={step.message.reply ? '8 6' : undefined}
                    />
                    {!omitted && (
                      <path
                        className="journey-route-ink"
                        d={route.d}
                        strokeDasharray={step.message.reply ? '8 6' : undefined}
                        markerEnd={`url(#${id}-arrow)`}
                        mask={`url(#${id}-reveal-${i})`}
                      />
                    )}
                    <g
                      data-packet={i}
                      className="journey-packet"
                      style={{ opacity: 0 }}
                    >
                      <circle r="11" fill="var(--paper)" />
                      <circle r="6" fill="currentColor" />
                    </g>
                    <g
                      data-arrival={i}
                      transform={`translate(${route.end.x},${route.end.y})`}
                      className="journey-arrival"
                      style={{ opacity: 0 }}
                    >
                      <circle r="16" />
                    </g>
                  </g>
                );
              })}
            </g>
            <g aria-hidden="true" pointerEvents="none">
              {harnesses.map((h) => {
                const s = sectorFor(h.sourceId);
                return (
                  <g key={h.id}>
                    <circle
                      cx={s.point.x}
                      cy={s.point.y}
                      r="16"
                      fill={planePaint(h.plane).color}
                    />
                    <text
                      className="journey-node-number"
                      x={s.point.x}
                      y={s.point.y + 6}
                    >
                      {h.number}
                    </text>
                    <text className="journey-node-label">
                      <textPath
                        href={`#${id}-label-${h.number}`}
                        startOffset="29%"
                      >
                        {h.shortName}
                      </textPath>
                    </text>
                  </g>
                );
              })}
            </g>
            {(['user', 'trig', 'ext'] as const).map((key) => {
              const p = endpointPoint(key)!;
              const lit = involved.includes(key);
              return (
                <g
                  key={key}
                  className={`journey-peripheral${lit ? ' is-involved' : ''}`}
                >
                  <rect
                    x={p.x - (key === 'ext' ? 164 : 105)}
                    y={p.y - 22}
                    width={key === 'ext' ? 328 : 210}
                    height="44"
                    rx="3"
                  />
                  <text x={p.x} y={p.y + 8}>
                    {key === 'user'
                      ? 'User / channel'
                      : key === 'ext'
                        ? 'External systems'
                        : 'Event / trigger'}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="journey-plane-key">
            {ringOrder
              .slice()
              .reverse()
              .map((p) => (
                <span key={p}>
                  <i style={{ background: planePaint(p).color }} />
                  {planes[p].name}
                </span>
              ))}
          </div>
          <div className="journey-path-key">
            <span>
              <i />
              Request
            </span>
            <span>
              <i className="is-return" />
              Response
            </span>
            <span className="journey-recording">
              <i />
              {frame.clock === 'task'
                ? 'Evidence across the live task'
                : frame.clock === 'offline'
                  ? 'A separate improvement clock'
                  : 'Continuous monitoring'}
            </span>
          </div>
          <p className="journey-diagram-note">
            Ring position groups concerns, not deployment dependencies.
            Animation pace is for reading, not measured latency.
          </p>
          <details
            className="journey-mobile-harnesses"
            onToggle={(e) => {
              if (e.currentTarget.open) onPause();
            }}
          >
            <summary>Select a named harness</summary>
            <div>
              {harnesses.map((h) => (
                <button
                  key={h.id}
                  aria-pressed={harness?.id === h.id}
                  onClick={() => onSelectHarness(h.id)}
                >
                  {h.number} {h.shortName}
                </button>
              ))}
            </div>
          </details>
        </Surface>
        <aside
          className="journey-narration"
          aria-live={playing ? 'off' : 'polite'}
        >
          <Surface>
            <div className="journey-chapter-title">
              <span>{phase.title}</span>
              <span>
                {String(index + 1).padStart(2, '0')} / {frames.length}
              </span>
            </div>
            <div className="journey-reading-progress" aria-hidden="true">
              <span ref={progress} />
            </div>
            <div key={active.id} className="journey-exchange-story">
              <p className="journey-occurrence-type">
                {frame.clock === 'offline'
                  ? customProposal
                    ? 'Offline · separate improvement activity'
                    : 'Offline · hours to days later'
                  : frame.clock === 'continuous'
                    ? 'Continuous · separate from task completion'
                    : `${kindNames[frame.kind] ?? 'Task handoff'} · pass ${frame.pass}`}
              </p>
              <p className="journey-endpoints">
                <span>{endpointName(active.message.from)}</span>
                <span aria-hidden="true">→</span>
                <span>{active.fan ?? endpointName(active.message.to)}</span>
              </p>
              <h2>{active.message.label}</h2>
              <p className="journey-story">
                {active.skipped
                  ? `Omitted: ${active.skipped}`
                  : active.branchNotTaken
                    ? 'This alternative branch is not taken. No action travels along the ghost path.'
                    : active.story}
              </p>
              {frame.note && (
                <p className="journey-context-note">{frame.note}</p>
              )}
              {frame.kind === 'wait' && (
                <p className="journey-wait-note">
                  <span aria-hidden="true">Ⅱ</span> Waiting for a human
                  decision. Playback stops here; continue when you are ready.
                </p>
              )}
              {frame.steps.length > 1 && (
                <div
                  className="journey-parallel-list"
                  aria-label="Parallel siblings"
                >
                  {frame.steps.map((s) => (
                    <button
                      key={s.id}
                      aria-pressed={s.id === active.id}
                      onClick={() => onSelectOccurrence(s.id)}
                    >
                      <span>{s.fan ?? endpointName(s.message.to)}</span>
                      <small>
                        {s.skipped
                          ? 'Omitted'
                          : s.branchNotTaken
                            ? 'Not taken'
                            : s.message.label}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <section className="journey-contract">
              <details
                key={active.id}
                onToggle={(event) => {
                  if (event.currentTarget.open) onPause();
                }}
              >
                <summary>Handoff contract and failure conditions</summary>
                <h3>{active.message.contract}</h3>
                <p>{active.message.carries}</p>
                <p>{active.message.how}</p>
                <p>{active.message.wire}</p>
                <ul>
                  {active.message.watch.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <p className="small-copy">
                  Reference conditions, not a passed control. Technology names
                  are illustrative options.
                </p>
                <a
                  href={`/explorer?${new URLSearchParams({ scenario: scenarioId, occurrence: active.id })}`}
                >
                  Inspect this exchange in Explorer ↗
                </a>
              </details>
            </section>
            {detailPanel}
          </Surface>
        </aside>
      </div>
    </div>
  );
}
