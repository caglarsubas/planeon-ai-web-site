import {
  briefSchema,
  type AssistantTurn,
  type Clarification,
  type JourneyBrief,
} from './contract';

export const clarificationLabels = {
  unanswered: 'Awaiting your answer',
  answered: 'Supplied answer',
  assumption: 'Assumption to validate',
  deferred: 'Not decided yet',
} as const;

/** Identity belongs to the original question, never to a model-generated paraphrase. */
export function createClarifications(questions: string[]): Clarification[] {
  const seen = new Set<string>();
  return questions
    .map((question) => question.replace(/\*\*([^*]+)\*\*/g, '$1').trim())
    .filter((question) => {
      const key = question.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((question, i) => ({
      id: `q${i + 1}`,
      question,
      answer: '',
      status: 'unanswered',
    }));
}

export function clarificationText(q: Clarification): string {
  return `${q.question}\n${clarificationLabels[q.status]}: ${q.answer || 'Not supplied'}`;
}

/** A bounded round has a deterministic completion, not a second LLM interrogation.
 * Partial answers keep the original outstanding questions. Deferred answers stay open
 * in the confirmed brief and recipe; this is not a claim that the brief is complete.
 */
export function reviewClarifications(brief: JourneyBrief): AssistantTurn {
  const checked = briefSchema.parse(brief);
  const pending = (checked.clarifications || []).filter(
    (q) => q.status === 'unanswered',
  );
  return {
    reply: pending.length
      ? 'Your answers remain attached to their questions. Answer the remaining items, or mark them “Not decided yet”.'
      : 'Your answers are ready for brief review. Open decisions remain visible; this does not mean every design requirement is known.',
    questions: pending.map((q) => q.question),
    brief: null,
    recipe: null,
    changeSummary: [],
  };
}
