import { briefSchema, type Clarification, type JourneyBrief } from './contract';

export const clarificationLabels = {
  unanswered: 'Awaiting your answer',
  answered: 'Supplied answer',
  assumption: 'Assumption to validate',
  deferred: 'Not decided yet',
} as const;

export const MAX_CLARIFICATION_ROUNDS = 5;
export function clarificationRound(brief: JourneyBrief) {
  return Math.max(0, ...(brief.clarifications || []).map((q) => q.round || 1));
}
const questionKey = (question: string) =>
  question.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/** Identity belongs to the original question, never to a model-generated paraphrase. */
export function createClarifications(
  questions: string[],
  previous: Clarification[] = [],
  round?: number,
): Clarification[] {
  const seen = new Set(previous.map((q) => questionKey(q.question)));
  const lastId = Math.max(0, ...previous.map((q) => Number(q.id.slice(1))));
  return questions
    .map((question) => question.replace(/\*\*([^*]+)\*\*/g, '$1').trim())
    .filter((question) => {
      const key = questionKey(question);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, Math.min(5, 25 - lastId))
    .map((question, i) => ({
      id: `q${lastId + i + 1}`,
      ...(round ? { round } : {}),
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
  ready = true,
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
    ready,
    label: sent
      ? ready
        ? 'Answers reviewed'
        : 'Waiting for your answers'
      : received
        ? 'Send updated answers'
        : 'Send answers',
    help: !addressed
      ? 'Answer at least one question, or choose “Not decided yet”, to send.'
      : !valid
        ? 'Check your brief and any empty assumption fields before sending.'
        : sent
          ? ready
            ? 'Answers reviewed. Check the proposed brief and its assumptions before continuing.'
            : 'The assistant has follow-up questions. Answer them below, then send again.'
          : 'Send what you have answered so far; you do not need to finish all questions first.',
  };
}
