import {
  briefSchema,
  recipeSchema,
  type JourneyBrief,
  type SolutionRecipe,
} from '../../../lib/studio/contract';
import { clarificationText } from '../../../lib/studio/clarification';

const union = (...lists: string[][]) => [...new Set(lists.flat())];

/** Only the visitor can add supplied facts. Model additions remain proposals to validate. */
export function guardProposedBrief(
  original: JourneyBrief,
  proposed: JourneyBrief,
) {
  const { clarifications: _modelAnswers, ...proposedFields } = proposed;
  return briefSchema.parse({
    ...proposedFields,
    // Even a plausible model rewrite cannot change the visitor's matched answers.
    ...(original.clarifications
      ? { clarifications: original.clarifications }
      : {}),
    facts: original.facts,
    assumptions: union(
      original.assumptions,
      proposed.assumptions,
      proposed.facts.filter((fact) => !original.facts.includes(fact)),
    ),
    unknowns: union(original.unknowns, proposed.unknowns),
  });
}

/** A model may add qualifications, but cannot silently drop the confirmed brief's caveats. */
export function preserveBriefQualifications(
  brief: JourneyBrief,
  recipe: SolutionRecipe,
) {
  return recipeSchema.parse({
    ...recipe,
    assumptions: union(
      brief.assumptions,
      recipe.assumptions,
      (brief.clarifications || [])
        .filter((q) => q.status === 'assumption')
        .map(clarificationText),
    ),
    openQuestions: union(
      brief.unknowns,
      recipe.openQuestions,
      (brief.clarifications || [])
        .filter((q) => q.status === 'deferred' || q.status === 'unanswered')
        .map(clarificationText),
    ),
  });
}
