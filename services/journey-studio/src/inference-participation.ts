import { byId } from '../../../lib/harness';
import type { SolutionRecipe } from '../../../lib/studio/contract';

/** Endpoints are already explicit proposed participants. Derive their redundant
 * list membership, but never infer actions, controls, evidence, clocks or dependencies.
 * Keep supplied duplicates so the authoritative validator can still reject them.
 */
export function completeParticipation(recipe: SolutionRecipe): SolutionRecipe {
  const addMissing = (declared: string[], explicit: string[]) => {
    const result = [...declared];
    for (const id of explicit) if (!result.includes(id)) result.push(id);
    return result;
  };
  const steps = recipe.steps.map((step) => ({
    ...step,
    harnessIds: addMissing(
      step.harnessIds,
      [step.from, step.to].filter((id) => Boolean(byId(id))),
    ),
  }));
  return {
    ...recipe,
    steps,
    harnesses: addMissing(
      recipe.harnesses,
      steps.flatMap((step) => step.harnessIds),
    ),
  };
}
