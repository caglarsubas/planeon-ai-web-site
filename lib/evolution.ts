import { changes } from '../data/operating.v1';
import {
  learningStages,
  learningStories,
  recoveryStages,
} from '../data/evolution.v1';

/** Preserve legacy change/stage links; invalid selections have a safe default. */
export function resolveEvolution(params: URLSearchParams) {
  const change =
    changes.find((item) => item.id === params.get('change')) ?? changes[0];
  const branchValue = params.get('branch');
  const branch =
    branchValue && Object.hasOwn(recoveryStages, branchValue)
      ? (branchValue as keyof typeof recoveryStages)
      : null;
  const stageId = branch ? recoveryStages[branch] : params.get('stage');
  const stage =
    learningStages.find((item) => item.id === stageId) ?? learningStages[0];
  return { change, story: learningStories[change.id], stage, branch };
}
