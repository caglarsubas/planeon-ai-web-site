import { byId } from '../harness';
import type { Frame, Occurrence } from '../scenarios';
import type { SolutionRecipe } from './contract';

/** A selected parallel branch must not inherit another branch's evidence. */
export function recipeStageEvidence(
  recipe: SolutionRecipe,
  stepId: string,
  harness: string | null = null,
) {
  const step = recipe.steps.find((item) => item.id === stepId);
  return recipe.evidence.filter((e) =>
    harness
      ? e.harnessId === harness
      : step?.featureIds.includes(e.featureId) &&
        step.harnessIds.includes(e.harnessId),
  );
}

/** Custom IDs never enter the curated scenario engine or reuse canonical exchange numbers. */
export function recipeFrames(recipe: SolutionRecipe): Frame[] {
  const frames: Frame[] = [];
  const completed = new Map<string, number>();
  const handled = new Set<string>();
  const endpoint = (id: string) => byId(id)?.sourceId ?? id;
  for (const step of recipe.steps) {
    if (handled.has(step.id)) continue;
    const siblings = step.parallelGroup
      ? recipe.steps.filter((s) => s.parallelGroup === step.parallelGroup)
      : [step];
    const start = Math.max(
      0,
      ...step.dependsOn.map((id) => completed.get(id) ?? 0),
    );
    const joinDuration = Math.max(
      ...siblings.map((s) => (s.kind === 'omitted' ? 0 : s.durationMs)),
    );
    const steps: Occurrence[] = siblings.map((s) => {
      handled.add(s.id);
      completed.set(s.id, start + joinDuration);
      return {
        id: `draft:${s.id}`,
        canonicalId: null,
        pass: s.repeatOf ? 2 : 1,
        story: s.description,
        branchNotTaken: false,
        skipped: s.kind === 'omitted' ? s.description : undefined,
        clock: s.clock,
        start,
        duration: s.kind === 'omitted' ? 0 : s.durationMs,
        fan: s.parallelGroup || undefined,
        message: {
          key: s.id,
          from: endpoint(s.from),
          to: endpoint(s.to),
          label: s.title,
          reply: false,
          phase: 'Proposal',
          carries: s.inputs,
          contract: s.authorization,
          watch: s.featureIds,
          how: s.description,
          wire: s.outputs,
          stack: s.harnessIds,
        },
      };
    });
    frames.push({
      id: `draft-frame:${step.id}`,
      steps,
      kind:
        (
          {
            approval: 'wait',
            parallel: 'par',
            omitted: 'skip',
            monitoring: 'cont',
            offline: 'off',
            clarification: 'clarification',
          } as Record<string, string>
        )[step.kind] ?? '',
      note: step.timingAssumption,
      pass: steps[0].pass,
      clock: step.clock,
      start,
      duration: joinDuration,
    });
  }
  return frames;
}
