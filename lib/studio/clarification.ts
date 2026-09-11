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

/** Receipt state refers to the exact normalized brief sent, never an optimistic success. */
export function clarificationSubmission(
  brief: JourneyBrief,
  received?: string,
) {
  const parsed = briefSchema.safeParse(brief);
  const questions = brief.clarifications || [];
  const addressed = questions.filter(
    (q) =>
      q.status !== 'unanswered' && (q.status === 'deferred' || q.answer.trim()),
  ).length;
  const valid = parsed.success && brief.workflow.trim().length >= 10;
  const snapshot = valid ? JSON.stringify(parsed.data) : undefined;
  const sent = Boolean(snapshot && snapshot === received);
  return {
    addressed,
    total: questions.length,
    snapshot,
    sent,
    complete: questions.length > 0 && addressed === questions.length,
    canSend: valid && addressed > 0 && !sent,
    label: sent
      ? 'Answers sent'
      : received
        ? 'Send updated answers'
        : 'Send answers',
    help: !addressed
      ? 'Answer at least one question, or choose “Not decided yet”, to send.'
      : !valid
        ? 'Check your brief and any empty assumption fields before sending.'
        : sent
          ? 'Answers received. They stay in this tab, not in server storage.'
          : 'Send what you have answered so far; you do not need to finish all questions first.',
  };
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
