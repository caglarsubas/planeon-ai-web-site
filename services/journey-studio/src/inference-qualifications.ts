import {
  briefSchema,
  recipeSchema,
  type JourneyBrief,
  type SolutionRecipe,
} from '../../../lib/studio/contract';
import { clarificationText } from '../../../lib/studio/clarification';

const union = (...lists: string[][]) => [...new Set(lists.flat())];
const regulatoryClaim =
  /\b(regulat\w*|jurisdiction\w*|complian\w*|gdpr|hipaa|pci|legal)\b/i;
const authorityClaim =
  /\b(consent|authori[sz]\w*|approv\w*|access rights?|permission\w*|pii)\b/i;

/** Only the visitor can add supplied facts. Model additions remain proposals to validate. */
export function guardProposedBrief(
  original: JourneyBrief,
  proposed: JourneyBrief,
) {
  const { clarifications: _modelAnswers, ...proposedFields } = proposed;
  const additions = union(
    proposed.assumptions,
    proposed.facts.filter((fact) => !original.facts.includes(fact)),
  ).filter((item) => !original.assumptions.includes(item));
  const regulatoryUnknown = additions.some((item) =>
    regulatoryClaim.test(item),
  );
  const authorityUnknown = additions.some((item) => authorityClaim.test(item));
  return briefSchema.parse({
    ...proposedFields,
    // Even a plausible model rewrite cannot change the visitor's matched answers.
    ...(original.clarifications
      ? { clarifications: original.clarifications }
      : {}),
    facts: original.facts,
    // A model-generated brief may not establish rights or legal scope. Decisions
    // supplied in matched answers remain there for explicit visitor review.
    permissions:
      original.permissions ||
      'Not supplied. Confirm permitted access and actions before implementation.',
    regulation:
      original.regulation ||
      'Not supplied. Confirm applicable jurisdiction and regulatory obligations before implementation.',
    assumptions: union(
      original.assumptions,
      additions.filter(
        (item) => !regulatoryClaim.test(item) && !authorityClaim.test(item),
      ),
    ),
    unknowns: union(
      original.unknowns,
      proposed.unknowns,
      regulatoryUnknown
        ? [
            'Confirm applicable jurisdictions and regulatory obligations with the responsible owner; do not assume compliance or an exemption.',
          ]
        : [],
      authorityUnknown
        ? [
            'Confirm consent, permitted access and approval authority with the responsible owner before implementation.',
          ]
        : [],
    ),
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
