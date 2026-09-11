import {
  briefSchema,
  recipeSchema,
  type JourneyBrief,
  type SolutionRecipe,
} from '../../../lib/studio/contract';

const union = (...lists: string[][]) => [...new Set(lists.flat())];

/** Only the visitor can add supplied facts. Model additions remain proposals to validate. */
export function guardProposedBrief(
  original: JourneyBrief,
  proposed: JourneyBrief,
) {
  return briefSchema.parse({
    ...proposed,
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
    assumptions: union(brief.assumptions, recipe.assumptions),
    openQuestions: union(brief.unknowns, recipe.openQuestions),
  });
}
