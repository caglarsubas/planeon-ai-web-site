/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Scroll regions must be keyboard-scrollable. */
'use client';
import { useState } from 'react';
import content from '@/data/content.json';
import { endpointName } from '@/lib/harness';
import type { Frame, Occurrence } from '@/lib/scenarios';

export function SequenceDiagram({
  frames,
  activeId,
  onSelect,
}: {
  frames: Frame[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const participants = [
    ...new Set(
      frames
        .flatMap((f) => f.steps)
        .flatMap((s) => [s.message.from, s.message.to]),
    ),
  ];
  const width = participants.length * 150;
  return (
    <section
      className="sequence-scroll"
      tabIndex={0}
      aria-label="Sequence diagram, scroll horizontally to follow participant columns"
    >
      <div className="sequence-mobile-list">
        <p className="reference-caveat">
          Compact sequence: each row names its sender and receiver. Select an
          exchange to inspect its narration and contract above.
        </p>
        {frames.map((frame) => (
          <div key={frame.id}>
            <p className="small-copy">
              {frame.clock} · pass {frame.pass}
              {frame.steps.length > 1 ? ' · parallel siblings' : ''}
            </p>
            {frame.steps.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                aria-pressed={activeId === s.id}
              >
                <b>
                  {s.canonicalId?.replace('m', '') ?? s.message.key} ·{' '}
                  {s.message.label}
                </b>
                <span>
                  {endpointName(s.message.from)} →{' '}
                  {s.fan ?? endpointName(s.message.to)}
                </span>
                {(s.skipped || s.branchNotTaken) && (
                  <small>Omitted / branch not taken</small>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ width: width + 290 }} className="aligned-sequence">
        <div className="aligned-sequence-header">
          <div className="sequence-gutter">Exchange / select for details</div>
          <div
            className="participant-columns"
            style={{
              gridTemplateColumns: `repeat(${participants.length}, 150px)`,
            }}
          >
            {participants.map((id) => (
              <div key={id}>{endpointName(id)}</div>
            ))}
          </div>
        </div>
        {frames.map((frame) => (
          <div key={frame.id}>
            {(frame.kind || frame.pass > 1) && (
              <div className="sequence-divider">
                {frame.clock === 'task'
                  ? `Pass ${frame.pass}`
                  : frame.clock === 'offline'
                    ? 'OFFLINE · separate clock'
                    : 'CONTINUOUS · across the task'}
                {frame.kind === 'par' ? ' · simultaneous siblings' : ''}
              </div>
            )}
            {frame.steps.map((s) => {
              const a = participants.indexOf(s.message.from) * 150 + 75,
                b = participants.indexOf(s.message.to) * 150 + 75;
              const dim = Boolean(s.skipped || s.branchNotTaken);
              return (
                <button
                  key={s.id}
                  className={`aligned-sequence-row${activeId === s.id ? ' selected' : ''}${dim ? ' omitted' : ''}`}
                  onClick={() => onSelect(s.id)}
                  aria-pressed={activeId === s.id}
                >
                  <span className="sequence-gutter">
                    <b>
                      {s.canonicalId?.replace('m', '') ?? s.message.key} ·{' '}
                      {s.message.label}
                    </b>
                    <small>
                      {s.fan ??
                        `${endpointName(s.message.from)} → ${endpointName(s.message.to)}`}
                      {dim ? ' · omitted' : ''}
                    </small>
                  </span>
                  <svg width={width} height="84" aria-hidden="true">
                    {participants.map((p, i) => (
                      <line
                        key={p}
                        x1={i * 150 + 75}
                        x2={i * 150 + 75}
                        y1="0"
                        y2="84"
                        stroke="var(--line)"
                        strokeDasharray="3 5"
                      />
                    ))}
                    <line
                      x1={a}
                      x2={b}
                      y1="42"
                      y2="42"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={
                        dim || s.message.reply ? '5 4' : undefined
                      }
                    />
                    <path
                      d={`M ${b + (b > a ? -8 : 8)} 37 L ${b} 42 L ${b + (b > a ? -8 : 8)} 47`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx={a} cy="42" r="4" fill="currentColor" />
                  </svg>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
function TimeRow({
  step,
  max,
  activeId,
  onSelect,
}: {
  step: Occurrence;
  max: number;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const omitted = step.skipped || step.branchNotTaken;
  return (
    <button
      className={`waterfall-row${step.id === activeId ? ' selected' : ''}${omitted ? ' omitted' : ''}`}
      onClick={() => onSelect(step.id)}
      aria-pressed={step.id === activeId}
    >
      <span>
        <b>
          {step.canonicalId ?? step.message.key} · {step.message.label}
        </b>
        <small>
          {step.fan ??
            `${endpointName(step.message.from)} → ${endpointName(step.message.to)}`}
        </small>
      </span>
      <span className="waterfall-track">
        <i
          style={{
            left: `${(step.start / max) * 100}%`,
            width: `${Math.max(0.3, (step.duration / max) * 100)}%`,
          }}
        />
      </span>
      <span className="time-value">
        {omitted
          ? 'Omitted'
          : step.clock === 'continuous'
            ? 'Continuous'
            : step.duration >= 3600000
              ? `${step.duration / 3600000} h`
              : `${step.duration.toLocaleString()} ms`}
      </span>
    </button>
  );
}
export function WaterfallDiagram({
  frames,
  tree,
  activeId,
  onSelect,
}: {
  frames: Frame[];
  tree: boolean;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="waterfall-diagram">
      <p className="reference-caveat">
        Illustrative timing model, not a recorded trace. Ordinary hop 40 ms;
        retrieval 120 ms; reasoning 900 ms; external operation 600 ms; human
        wait 15 s; offline batch 1 h. Sibling work starts together and joins at
        the latest completion. Human waits can be much longer.
      </p>
      {(['task', 'continuous', 'offline'] as const).map((clock) => {
        const group = frames.filter((f) => f.clock === clock);
        const max = Math.max(1, ...group.map((f) => f.start + f.duration));
        return (
          <section key={clock} className="waterfall-clock">
            <h3>
              {clock === 'task'
                ? 'Live task'
                : clock === 'continuous'
                  ? 'Continuous signals — throughout the task'
                  : 'Offline improvement — separate time axis'}
            </h3>
            <p className="small-copy">
              {clock !== 'continuous'
                ? `Linear axis · 0 to ${(max / 1000).toLocaleString()} illustrative seconds. Narrow events retain a minimum visible marker.`
                : 'No added critical-path duration.'}
            </p>
            {group.map((f) =>
              tree ? (
                <details key={f.id} open className="trace-tree-group">
                  <summary>
                    Pass {f.pass} / {f.steps[0].message.phase} ·{' '}
                    {f.steps.length > 1
                      ? `Parallel group · ${f.steps.length} siblings`
                      : f.steps[0].message.label}{' '}
                    <span>
                      {f.kind === 'wait'
                        ? 'Checkpointed wait'
                        : `${f.duration.toLocaleString()} ms`}
                    </span>
                  </summary>
                  {f.steps.map((s) => (
                    <TimeRow
                      key={s.id}
                      step={s}
                      max={max}
                      activeId={activeId}
                      onSelect={onSelect}
                    />
                  ))}
                </details>
              ) : (
                f.steps.map((s) => (
                  <TimeRow
                    key={s.id}
                    step={s}
                    max={max}
                    activeId={activeId}
                    onSelect={onSelect}
                  />
                ))
              ),
            )}
          </section>
        );
      })}
    </div>
  );
}
export function LayeredFlow() {
  const [selected, setSelected] = useState<{
    title: string;
    body: string;
    contract?: string;
    watch: string[];
  } | null>(null);
  return (
    <div className="canonical-flow">
      <p className="reference-caveat">
        Canonical architecture reference: 24 nodes and 29 typed handoffs. This
        view is not the selected scenario’s execution trace.
      </p>
      <div className="canonical-flow-planes">
        {Object.entries(content.sequence.phases).map(([id, phase]) => (
          <section key={id}>
            <h3>{phase.name}</h3>
            {Object.entries(content.layeredFlow.nodes)
              .filter(([, n]) => n.cluster === id)
              .map(([key, node]) => (
                <button
                  key={key}
                  onClick={() =>
                    setSelected({
                      title: node.title,
                      body: node.role,
                      watch: node.watch,
                    })
                  }
                >
                  {node.title}
                </button>
              ))}
          </section>
        ))}
      </div>
      {selected && (
        <aside className="inline-evidence">
          <h3>{selected.title}</h3>
          <p>{selected.body}</p>
          {selected.contract && (
            <p>
              <b>Contract:</b> {selected.contract}
            </p>
          )}
          <ul>
            {selected.watch.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </aside>
      )}
      <details>
        <summary>Inspect all 29 typed handoffs</summary>
        <div className="flow-contracts">
          {Object.entries(content.layeredFlow.edgeMeta).map(([id, raw]) => {
            const edge = raw as { from: string; to: string; text: string };
            const detail = (
              content.layeredFlow.edges as Record<
                string,
                { carries: string; contract: string; watch: string[] }
              >
            )[id];
            return (
              <button
                key={id}
                onClick={() =>
                  setSelected({
                    title: `${edge.from} → ${edge.to}`,
                    body: detail.carries,
                    contract: detail.contract,
                    watch: detail.watch,
                  })
                }
              >
                <b>{id}</b> {edge.text}
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
