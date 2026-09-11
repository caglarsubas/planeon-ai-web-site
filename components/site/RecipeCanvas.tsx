'use client';
import { lazy, Suspense, useMemo, useState } from 'react';
import { recipeFrames } from '@/lib/studio/frames';
import type { SolutionRecipe } from '@/lib/studio/contract';
import { JourneyStage } from './JourneyStage';
import { useJourneyClock } from './useJourneyClock';
import { byId, planes } from '@/lib/harness';
import { features, relation } from '@/lib/aml';
import { RecipeQualifications } from './RecipeQualifications';
const Sequence = lazy(() =>
  import('./ScenarioDiagrams').then((m) => ({ default: m.SequenceDiagram })),
);
const Waterfall = lazy(() =>
  import('./ScenarioDiagrams').then((m) => ({ default: m.WaterfallDiagram })),
);

export function RecipeCanvas({ recipe }: { recipe: SolutionRecipe }) {
  const frames = useMemo(() => recipeFrames(recipe), [recipe]);
  const [index, setIndex] = useState(0);
  const [view, setView] = useState('onion');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.75);
  const [revision, setRevision] = useState(0);
  const [harness, setHarness] = useState<string | null>(null);
  const [occurrence, setOccurrence] = useState<string | null>(null);
  const frame = frames[index];
  const active =
    frame.steps.find((step) => step.id === occurrence) || frame.steps[0];
  const selectedStep = recipe.steps.find((s) => `draft:${s.id}` === active.id)!;
  const waiting =
    ['wait', 'clarification'].includes(frame.kind) || frame.clock !== 'task';
  const clock = useJourneyClock({
    enabled: true,
    frame,
    playing,
    speed,
    manualRevision: revision,
    resetRevision: 0,
    canAdvance: !waiting && index < frames.length - 1,
    onAdvance: () => setIndex((i) => Math.min(i + 1, frames.length - 1)),
    onStop: () => setPlaying(false),
  });
  const select = (id: string) => {
    setOccurrence(id);
    setPlaying(false);
    setRevision((x) => x + 1);
    setIndex(
      Math.max(
        0,
        frames.findIndex((f) => f.steps.some((s) => s.id === id)),
      ),
    );
    setHarness(null);
  };
  const mapped = recipe.evidence.filter((e) =>
    harness
      ? e.harnessId === harness
      : frame.steps.some((s) =>
          recipe.steps
            .find((x) => `draft:${x.id}` === s.id)
            ?.featureIds.includes(e.featureId),
        ),
  );
  const detail = (
    <div className="studio-step-detail">
      <span className="eyebrow">
        Proposed step {index + 1} / {frames.length}
      </span>
      <h3>{selectedStep.title}</h3>
      <p>{selectedStep.description}</p>
      {frame.steps.length > 1 && (
        <p>
          Parallel branches join after the slowest sibling completes. Select the
          sequence or tree to inspect each branch.
        </p>
      )}
      {waiting && (
        <p className="studio-fine">
          {frame.clock === 'task'
            ? 'Playback pauses here for clarification or approval. Use Next when ready.'
            : 'This activity is separate from the live task timeline. Use Next to continue.'}
        </p>
      )}
      <details
        onToggle={(e) => {
          if (e.currentTarget.open) setPlaying(false);
        }}
      >
        <summary>Inputs, authorization and recovery</summary>
        <p>
          <strong>Inputs:</strong> {selectedStep.inputs}
        </p>
        <p>
          <strong>Outputs:</strong> {selectedStep.outputs}
        </p>
        <p>
          <strong>Authorization:</strong> {selectedStep.authorization}
        </p>
        <p>
          <strong>Recovery:</strong> {selectedStep.recovery}
        </p>
      </details>
    </div>
  );
  return (
    <section className="studio-canvas" aria-label="Proposed solution recipe">
      <div className="studio-canvas-heading">
        <div>
          <span className="eyebrow">Design proposal / Not an assessment</span>
          <h2>{recipe.title}</h2>
        </div>
        <span className="studio-fine">
          {recipe.harnesses.length} harnesses · {recipe.steps.length} proposed
          steps
        </span>
      </div>
      <p>{recipe.objective}</p>
      <div className="studio-controls" aria-label="Recipe presentation">
        <label>
          Diagram
          <select
            value={view}
            onChange={(e) => {
              setPlaying(false);
              setView(e.target.value);
            }}
          >
            <option value="onion">Onion walkthrough</option>
            <option value="sequence">Sequence</option>
            <option value="flat">Flat waterfall</option>
            <option value="tree">Tree waterfall</option>
          </select>
        </label>
        <label>
          Speed
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </label>
        <button
          onClick={() => {
            setPlaying(false);
            setIndex(0);
            setOccurrence(null);
            setHarness(null);
            setRevision((x) => x + 1);
          }}
        >
          Reset
        </button>
        <button
          disabled={index === 0}
          onClick={() => select(frames[index - 1].steps[0].id)}
        >
          Previous
        </button>
        <button onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          disabled={index === frames.length - 1}
          onClick={() => select(frames[index + 1].steps[0].id)}
        >
          Next
        </button>
      </div>
      <p className="studio-fine">
        Custom proposal, separate from the curated 43-exchange example. Timings
        are illustrative, not measured. Reference relationships never mean a
        control passed.
      </p>
      {view === 'onion' ? (
        <JourneyStage
          frame={frame}
          frames={frames}
          index={index}
          active={active}
          scenarioId="custom-proposal"
          customProposal
          playing={playing}
          clock={clock}
          harness={harness ? byId(harness) : undefined}
          onSelectHarness={(id) => {
            setPlaying(false);
            setHarness(id);
          }}
          onSelectOccurrence={select}
          onPause={() => setPlaying(false)}
          detailPanel={detail}
        />
      ) : (
        <>
          <Suspense fallback={<p>Loading diagram…</p>}>
            {view === 'sequence' ? (
              <Sequence
                frames={frames}
                activeId={active.id}
                onSelect={select}
              />
            ) : (
              <Waterfall
                frames={frames}
                tree={view === 'tree'}
                activeId={active.id}
                onSelect={select}
                timingDescription="Custom proposal timing assumptions. Durations are illustrative, not a recorded trace. Each step's assumptions are in the specification; approval waits can be much longer."
              />
            )}
          </Suspense>
          {detail}
        </>
      )}
      <div className="studio-evidence">
        <div>
          <h3>
            {harness
              ? `${byId(harness)?.shortName} reference`
              : 'Evidence needs for this stage'}
          </h3>
          <p>
            Proposed relevance, anchored to the existing AML catalog. Evidence
            still needs to be collected and evaluated.
          </p>
          {harness && (
            <button onClick={() => setHarness(null)}>
              Return to active stage
            </button>
          )}
        </div>
        <div>
          {mapped.length ? (
            mapped.map((e) => {
              const f = features.find((f) => f.id === e.featureId)!;
              const h = byId(e.harnessId)!;
              return (
                <details
                  key={`${e.featureId}:${e.harnessId}`}
                  onToggle={(event) => {
                    if (event.currentTarget.open) setPlaying(false);
                  }}
                >
                  <summary>
                    {f.id} · {f.name} / {h.shortName}
                  </summary>
                  <p>
                    {relation(f, h.id) === 'primary'
                      ? 'Primary accountability'
                      : 'Contributing responsibility'}{' '}
                    · {planes[h.plane].name}
                  </p>
                  <p>{e.rationale}</p>
                  <p>
                    <strong>Expected evidence:</strong> {e.expectedEvidence}
                  </p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/maturity?feature=${f.id}&harness=${h.id}#expected-evidence`}
                  >
                    Read canonical requirements (new tab) ↗
                  </a>{' '}
                  <a href={h.href} target="_blank" rel="noopener noreferrer">
                    Harness responsibilities (new tab) ↗
                  </a>
                </details>
              );
            })
          ) : (
            <p>
              No AML requirement was selected for this stage. This is not an
              exemption or evidence that controls pass.
            </p>
          )}
        </div>
      </div>
      <details
        onToggle={(e) => {
          if (e.currentTarget.open) setPlaying(false);
        }}
      >
        <summary>Implementation phases and recovery</summary>
        <div className="studio-phase-list">
          {recipe.phases.map((p) => (
            <section key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.deliverable}</p>
              <p>
                <strong>Prerequisite:</strong> {p.prerequisite}
              </p>
              <p>
                <strong>Evidence:</strong> {p.evidence}
              </p>
              <p>
                <strong>Advance / hold:</strong> {p.advanceOrHold}
              </p>
            </section>
          ))}
        </div>
        <p>
          <strong>Stop future actions:</strong>{' '}
          {recipe.recovery.stopFutureActions}
        </p>
        <p>
          <strong>Restore a version:</strong> {recipe.recovery.restoreVersion}
        </p>
        <p>
          <strong>Compensate effects:</strong>{' '}
          {recipe.recovery.compensateEffects}
        </p>
      </details>
      <RecipeQualifications recipe={recipe} />
    </section>
  );
}
