import {
  briefSchema,
  turnSchema,
  type JourneyBrief,
  type AssistantTurn,
} from '../../../lib/studio/contract';
import {
  clarificationRound,
  createClarifications,
  MAX_CLARIFICATION_ROUNDS,
} from '../../../lib/studio/clarification';

export function clarificationInstructions(brief: JourneyBrief) {
  const round = clarificationRound(brief);
  return `Clarification progress: ${round} question rounds already issued; maximum ${MAX_CLARIFICATION_ROUNDS}.
Review ALL matched question-answer pairs, not just the latest chat messages. Their IDs are stable and their statuses distinguish decisions, assumptions and unknowns. Summarize your current understanding in reply without repeating questions there.
Ask only essential NEW missing decisions needed for a useful draft. Do not paraphrase answered questions. A follow-up must add a genuinely new decision; if an answer conflicts, name the two conflicting choices in the question. Never re-ask a deferred decision. Carry it into unknowns instead. Do not ask for implementation trivia when the demand is already clear enough.
If clear enough to draft, return questions=[] and a proposed brief. This means draft-ready, not fully specified or certified. Preserve every supplied constraint and prohibition; leave supplied facts unchanged. Proposed additions belong under assumptions, not facts. Keep substantive assumptions and unknowns to at most five NEW items each. Return brief=null while asking questions: do not write a premature design. Do not assume regulatory compliance, approval, access rights, or absence of risk at ANY round. Do not put already answered decisions under unknowns or contradict them in assumptions. Do not invent new product requirements such as a session lifetime.
${
  round >= MAX_CLARIFICATION_ROUNDS
    ? 'HARD STOP: round five has been answered. Return questions=[] and a proposed brief now, even if uncertain. Make rough, explicitly provisional assumptions for non-sensitive gaps. Do not guess permissions, legal obligations, jurisdiction, approval authority, or access rights: leave these as unknowns and implementation hold conditions. Never claim that the demand is fully clear just because the limit was reached.'
    : `If essential gaps remain, return at most ${round ? 3 : 5} focused questions for round ${round + 1}. Retain earlier unanswered questions in context without repeating them in the questions array. If only existing unanswered questions remain, return questions=[] and brief=null; the application keeps the current round open so the visitor can answer or explicitly defer them.`
}
Return recipe=null and changeSummary=[]. Never generate clarification progress or rewrite the question ledger.`;
}

/** Runs AFTER real inference. The application, not the model, enforces five rounds. */
export function finishClarification(
  brief: JourneyBrief,
  proposed: AssistantTurn,
): AssistantTurn {
  const previous = brief.clarifications || [];
  const round = clarificationRound(brief);
  const atLimit = round >= MAX_CLARIFICATION_ROUNDS;
  const added = atLimit
    ? []
    : createClarifications(proposed.questions, previous, round + 1);
  if (!atLimit && proposed.questions.length && !added.length)
    throw new Error(
      'Repeated clarification questions. Ask genuinely new essential decisions, or return questions=[] and a proposed brief with remaining gaps as unknowns.',
    );
  const pending = previous.some((q) => q.status === 'unanswered');
  const complete = atLimit || (added.length === 0 && !pending);
  const nextRound = added.length ? round + 1 : Math.max(1, round);
  // Unanswered entries are retained as explicit open decisions, never filled by the model.
  const ledger = [...previous, ...added].map((q) =>
    complete && q.status === 'unanswered'
      ? { ...q, status: 'deferred' as const }
      : q,
  );
  let nextBrief = proposed.brief;
  if (complete) {
    nextBrief = briefSchema.parse({
      ...(nextBrief || brief),
      ...(ledger.length ? { clarifications: ledger } : {}),
    });
    if (atLimit && !nextBrief.assumptions.length) {
      nextBrief.assumptions = [
        'Rough planning assumption: begin with a bounded pilot of the stated workflow; scope and effort remain subject to validation.',
      ];
    }
    if (atLimit && !nextBrief.unknowns.length) {
      nextBrief.unknowns = [
        'Any unspecified access rights, approval authority and applicable regulatory obligations remain open; confirm them before implementation.',
      ];
    }
  }
  return turnSchema.parse({
    ...proposed,
    // Suppress accidental question lists in the prose; the matched controls own them.
    reply: atLimit
      ? 'Five clarification rounds are complete. Review the draft with rough assumptions below. Unresolved permissions, approvals and regulatory matters are not authorized or settled.'
      : complete
        ? 'The assistant is ready to draft from your answers. Review the proposed brief, assumptions and open decisions before confirming.'
        : !added.length
          ? 'Your partial answers have been reviewed. Answer the remaining questions below, or mark them “Not decided yet”. This stays in the same round.'
          : round
            ? `Your answers have been reviewed. Round ${round + 1} focuses on the remaining decisions; earlier answers are kept below.`
            : 'Start with these questions. Your answers will guide any follow-up rounds, up to a maximum of five.',
    questions: added.map((q) => q.question),
    brief: complete ? nextBrief : null,
    clarification: {
      round: nextRound,
      status: atLimit ? 'limit' : complete ? 'ready' : 'questions',
      ledger,
    },
  });
}
