/* oxlint-disable next/no-html-link-for-pages -- Native links preserve the existing Vinext production navigation contract. */
'use client';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NativeSelect } from '@/components/ui/native-select';
import { SearchPicker } from './ReferenceControls';
import { ReferenceLoading } from './ReferenceLoading';
import { HarnessOnion } from './HarnessOnion';
import { JourneyStage } from './JourneyStage';
import { useJourneyClock } from './useJourneyClock';
import { useUrlState } from '@/lib/url-state';
import { byId, bySource, consultationHref, endpointName } from '@/lib/harness';
import {
  buildScenario,
  findScenario,
  industries,
  kindNames,
  resolveFrame,
  scenarios,
} from '@/lib/scenarios';
const Sequence = lazy(() =>
  import('./ScenarioDiagrams').then((m) => ({ default: m.SequenceDiagram })),
);
const Waterfall = lazy(() =>
  import('./ScenarioDiagrams').then((m) => ({ default: m.WaterfallDiagram })),
);
const Flow = lazy(() =>
  import('./ScenarioDiagrams').then((m) => ({ default: m.LayeredFlow })),
);

export function ScenarioWorkbench({
  technical = false,
}: {
  technical?: boolean;
}) {
  const { params, hash, update } = useUrlState();
  const scenario = findScenario(params.get('scenario'));
  const frames = useMemo(() => buildScenario(scenario), [scenario]);
  const index = resolveFrame(frames, params.get('occurrence'), hash);
  const frame = frames[index];
  const active =
    frame.steps.find((s) => s.id === params.get('occurrence')) ??
    frame.steps[0];
  const legacyHarness = hash.match(/^#harness-(\d+)$/)?.[1];
  const harness =
    byId(params.get('harness') ?? '') ??
    (legacyHarness ? bySource(Number(legacyHarness)) : undefined);
  const view = ['onion', 'sequence', 'flat', 'tree', 'flow'].includes(
    params.get('view') ?? '',
  )
    ? params.get('view')!
    : 'onion';
  const [playing, setPlaying] = useState(false);
  const [manualRevision, setManualRevision] = useState(0);
  const [resetRevision, setResetRevision] = useState(0);
  const speed = ['0.5', '0.75', '1', '1.5'].includes(params.get('speed') ?? '')
    ? Number(params.get('speed'))
    : 0.75;
  const industry = industries.includes(params.get('industry') ?? '')
    ? params.get('industry')!
    : 'all';
  const presentation = ['fit', 'wide'].includes(params.get('mode') ?? '')
    ? params.get('mode')!
    : 'scroll';
  const waiting =
    frame.kind === 'wait' ||
    (['clarification', 'dialogue'].includes(frame.kind) &&
      active.message.from === 'user');
  const journeyClock = useJourneyClock({
    enabled: !technical,
    frame,
    playing,
    speed,
    manualRevision,
    resetRevision,
    canAdvance: !waiting && frame.clock === 'task' && index < frames.length - 1,
    onAdvance: () =>
      update({ occurrence: frames[index + 1].steps[0].id }, true),
    onStop: () => setPlaying(false),
  });
  useEffect(() => {
    const pause = () => setPlaying(false);
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('popstate', pause);
    window.addEventListener('hashchange', pause);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('popstate', pause);
      window.removeEventListener('hashchange', pause);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  useEffect(() => {
    if (!playing || !technical) return;
    if (waiting || frame.clock !== 'task' || index === frames.length - 1) {
      const stop = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(stop);
    }
    const timer = setTimeout(
      () => update({ occurrence: frames[index + 1].steps[0].id }, true),
      2100 / speed,
    );
    return () => clearTimeout(timer);
  }, [playing, technical, waiting, frame, index, frames, speed, update]);
  const selectOccurrence = (id: string) => {
    setPlaying(false);
    setManualRevision((r) => r + 1);
    update({ occurrence: id });
  };
  const move = (delta: number) =>
    selectOccurrence(
      frames[Math.max(0, Math.min(frames.length - 1, index + delta))].steps[0]
        .id,
    );
  const selectScenario = (id: string) => {
    setPlaying(false);
    setResetRevision((r) => r + 1);
    update({ scenario: id, occurrence: null, harness: null });
  };
  const liveCount = frames
    .flatMap((f) => f.steps)
    .filter(
      (s) => s.clock === 'task' && !s.skipped && !s.branchNotTaken,
    ).length;
  const picks = scenarios.filter(
    (s) =>
      s.initiated === scenario.initiated &&
      (industry === 'all' || s.industry === industry),
  );
  const selectedPick = picks.some((s) => s.id === scenario.id)
    ? picks
    : [scenario, ...picks];
  return (
    <section
      className={`scenario-workbench section-shell presentation-${presentation}${technical ? '' : ' journey-workbench'}`}
    >
      <div className="surface-shell selector-surface">
        <div className="surface-core scenario-selectors">
          <label htmlFor="scenario-industry">
            <span className="control-label">Industry</span>
            <NativeSelect
              id="scenario-industry"
              value={industry}
              onChange={(e) => {
                setPlaying(false);
                update({
                  industry: e.target.value === 'all' ? null : e.target.value,
                });
              }}
            >
              <option value="all">All nine industries</option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </NativeSelect>
          </label>
          <SearchPicker
            label="Search 36 use cases"
            items={selectedPick.map((s) => ({
              value: s.id,
              label: `${s.title} · ${s.industry}`,
            }))}
            value={scenario.id}
            onChange={selectScenario}
          />
          <label htmlFor="scenario-initiator">
            <span className="control-label">Initiated by</span>
            <NativeSelect
              id="scenario-initiator"
              value={scenario.initiated}
              onChange={(e) =>
                selectScenario(
                  scenarios.find(
                    (s) =>
                      s.pair === scenario.pair &&
                      s.initiated === e.target.value,
                  )!.id,
                )
              }
            >
              <option value="human">Human request</option>
              <option value="agent">Agent / event</option>
            </NativeSelect>
          </label>
        </div>
      </div>
      <header className="scenario-heading">
        <div>
          <p className="scenario-purpose">
            {technical
              ? 'Explorer / Inspect the actions, interfaces and evidence behind a workflow.'
              : 'Journey / Follow a business request from understanding to authorization and a verified outcome.'}
          </p>
          <p className="eyebrow">
            {scenario.industry} / {scenario.initiated}-initiated
          </p>
          <h1>{scenario.title}</h1>
          <p>{scenario.intro}</p>
        </div>
        <a
          className="text-link"
          href={consultationHref({ scenario: scenario.id })}
        >
          Review this workflow with Planeon ↗
        </a>
      </header>
      <p className="reference-caveat">
        Illustrative reference scenario, not a live run. Named people, results,
        scores and durations are teaching examples. {liveCount} live handoffs in
        this variant, including additional dialogue or repeated work; omitted
        branches remain inspectable.
      </p>
      <div className="playback-controls" aria-label="Scenario playback">
        <button
          onClick={() => move(-1)}
          disabled={index === 0}
          aria-label="Previous step"
        >
          ← Previous
        </button>
        <button
          className="play-toggle"
          aria-pressed={playing}
          disabled={index === frames.length - 1}
          onClick={() => {
            if (waiting || frame.clock !== 'task') move(1);
            setPlaying(!playing);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => move(1)}
          disabled={index === frames.length - 1}
          aria-label="Next step"
        >
          Next →
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setResetRevision((r) => r + 1);
            update({ occurrence: null });
          }}
        >
          Reset
        </button>
        <label htmlFor="scenario-speed">
          <span className="sr-only">Playback speed</span>
          <NativeSelect
            id="scenario-speed"
            aria-label="Playback speed"
            value={speed}
            onChange={(e) => update({ speed: e.target.value })}
          >
            {[0.5, 0.75, 1, 1.5].map((v) => (
              <option key={v} value={v}>
                {v}×
              </option>
            ))}
          </NativeSelect>
        </label>
        <span className="frame-counter">
          {index + 1} / {frames.length} frames
        </span>
        <label className="presentation-select" htmlFor="scenario-mode">
          <span className="sr-only">Presentation mode</span>
          <NativeSelect
            id="scenario-mode"
            aria-label="Presentation mode"
            value={presentation}
            onChange={(e) =>
              update({
                mode: e.target.value === 'scroll' ? null : e.target.value,
              })
            }
          >
            <option value="scroll">Normal scrolling</option>
            <option value="fit">Fit workspace</option>
            <option value="wide">16:9 presentation</option>
          </NativeSelect>
        </label>
      </div>
      {technical && (
        <div
          className="scenario-current"
          aria-live={playing ? 'off' : 'polite'}
        >
          <p className="eyebrow">
            {frame.clock === 'task'
              ? `Live task · pass ${frame.pass}`
              : frame.clock === 'offline'
                ? 'Offline improvement · hours to days later'
                : 'Continuous monitoring · across all live work'}
          </p>
          <div className="current-exchange">
            <span>{endpointName(active.message.from)}</span>
            <span className="straight-arrow" aria-hidden="true">
              →
            </span>
            <span>{active.fan ?? endpointName(active.message.to)}</span>
          </div>
          <h2>{active.message.label}</h2>
          <p>
            {active.skipped
              ? `Omitted: ${active.skipped}`
              : active.branchNotTaken
                ? 'Alternative branch not taken in this run. The inspected path requires approval.'
                : active.story}
          </p>
          {frame.kind && (
            <p className="scenario-kind">
              <b>{kindNames[frame.kind] ?? frame.kind}.</b> {frame.note}
            </p>
          )}
          {frame.steps.length > 1 && (
            <div className="sibling-picker" aria-label="Parallel siblings">
              {frame.steps.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={s.id === active.id}
                  onClick={() => selectOccurrence(s.id)}
                >
                  {s.fan ?? s.message.label}
                  {s.skipped ? ' · omitted' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!technical && (
        <JourneyStage
          frame={frame}
          frames={frames}
          index={index}
          active={active}
          scenarioId={scenario.id}
          playing={playing}
          clock={journeyClock}
          onPause={() => setPlaying(false)}
          harness={harness}
          onSelectOccurrence={selectOccurrence}
          onSelectHarness={(id) => {
            setPlaying(false);
            update({ harness: id });
          }}
        />
      )}
      {technical && view !== 'onion' && (
        <details className="selected-contract">
          <summary>
            Selected exchange contract · {active.message.contract}
          </summary>
          <p>{active.message.carries}</p>
          <p>{active.message.how}</p>
          <p>{active.message.wire}</p>
          <ul>
            {active.message.watch.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="small-copy">
            Reference conditions, not evidence that this example has passed.
            Technology names are illustrative options.
          </p>
        </details>
      )}
      {technical && (
        <Tabs
          value={technical ? view : 'onion'}
          onValueChange={(v) => {
            setPlaying(false);
            update({ view: String(v) });
          }}
          className="reference-tabs"
        >
          {technical && (
            <TabsList variant="line" aria-label="Scenario view">
              {[
                ['onion', 'Onion'],
                ['sequence', 'Sequence'],
                ['flat', 'Flat waterfall'],
                ['tree', 'Tree waterfall'],
                ['flow', 'Layered flow'],
              ].map(([v, label]) => (
                <TabsTrigger key={v} value={v}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          <TabsContent value="onion">
            <div className="scenario-onion-layout">
              <HarnessOnion
                idPrefix="explorer-onion"
                active={frame.steps}
                selected={harness?.id}
                onSelect={(id) => {
                  setPlaying(false);
                  update({ harness: id });
                }}
              />
              <aside className="inline-evidence">
                {harness ? (
                  <>
                    <p className="eyebrow">
                      Selected harness / {harness.number}
                    </p>
                    <h3>{harness.shortName}</h3>
                    <p>{harness.mandate}</p>
                    <a className="text-link" href={harness.href}>
                      Purpose and responsibilities ↗
                    </a>
                    <a
                      className="text-link"
                      href={`/maturity?harness=${harness.id}&scenario=${scenario.id}`}
                    >
                      Accountability and evidence ↗
                    </a>
                    <button onClick={() => update({ harness: null })}>
                      Return to exchange evidence
                    </button>
                  </>
                ) : (
                  <>
                    <p className="eyebrow">Exchange evidence</p>
                    <h3>{active.message.contract}</h3>
                    <p>{active.message.carries}</p>
                    <details>
                      <summary>Implementation and failure conditions</summary>
                      <p>{active.message.how}</p>
                      <p>{active.message.wire}</p>
                      <ul>
                        {active.message.watch.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                      <p className="small-copy">
                        Technology names are illustrative options, not required
                        dependencies or current product recommendations.
                      </p>
                    </details>
                    <div className="reference-links">
                      <a href={`/maturity?feature=A5&scenario=${scenario.id}`}>
                        A5 · Exact-action authority ↗
                      </a>
                      <a href={`/maturity?feature=D7&scenario=${scenario.id}`}>
                        D7 · Transactional integrity ↗
                      </a>
                      <a href={`/maturity?feature=D8&scenario=${scenario.id}`}>
                        D8 · Verified outcomes ↗
                      </a>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </TabsContent>
          <Suspense
            fallback={<ReferenceLoading label="Loading reference view…" />}
          >
            <TabsContent value="sequence">
              <Sequence
                frames={frames}
                activeId={active.id}
                onSelect={selectOccurrence}
              />
            </TabsContent>
            <TabsContent value="flat">
              <Waterfall
                frames={frames}
                tree={false}
                activeId={active.id}
                onSelect={selectOccurrence}
              />
            </TabsContent>
            <TabsContent value="tree">
              <Waterfall
                frames={frames}
                tree
                activeId={active.id}
                onSelect={selectOccurrence}
              />
            </TabsContent>
            <TabsContent value="flow">
              <Flow />
            </TabsContent>
          </Suspense>
        </Tabs>
      )}
      <details className="frame-ledger">
        <summary>All exchanges and omitted work</summary>
        <ol>
          {frames.map((f, i) => (
            <li key={f.id}>
              <button
                aria-current={index === i ? 'step' : undefined}
                onClick={() => selectOccurrence(f.steps[0].id)}
              >
                <b>{i + 1}</b>
                <span>
                  {f.steps.map((s) => s.message.label).join(' + ')}
                  <small>
                    {f.clock} · pass {f.pass}
                    {f.kind ? ` · ${kindNames[f.kind] ?? f.kind}` : ''}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </details>
      <div className="operating-notes">
        <section>
          <h3>Record what can be verified.</h3>
          <p>
            Preserve supplied inputs, applied policies, tool actions, approval
            records and state changes. A useful audit trail reconstructs the
            operation; it does not expose private chain-of-thought.
          </p>
        </section>
        <section>
          <h3>Recovery has three different jobs.</h3>
          <p>
            Stop future actions; restore a compatible release; compensate for
            external effects where possible. Restoring software cannot unsend an
            email or undo every transaction.
          </p>
          <a className="text-link" href="/blueprint#release-bundle">
            Inspect the release bundle ↗
          </a>
        </section>
      </div>
      <p className="reference-caveat">
        In the canonical reference, messages 16 and 17 are one reasoning
        request/response pair crossing the model core—not two invocations. Other
        scenarios may add intent calls, repeat the reasoning loop or omit it.{' '}
        <a
          href={
            technical
              ? `/journey?scenario=${scenario.id}`
              : `/explorer?scenario=${scenario.id}`
          }
        >
          {technical
            ? 'Open the guided Journey'
            : 'Inspect this scenario in Explorer'}{' '}
          ↗
        </a>
      </p>
    </section>
  );
}
