import reference from '../data/reference/scenarios.v1.json';

export type Endpoint = number | string;
export type Message = {
  n?: number;
  key?: string;
  from: Endpoint;
  to: Endpoint;
  label: string;
  reply: boolean;
  phase: string;
  carries: string;
  contract: string;
  watch: string[];
  how: string;
  wire: string;
  stack: string[];
};
export type Scenario = {
  id: string;
  pair: string;
  initiated: 'human' | 'agent';
  industry: string;
  title: string;
  user: string;
  intro: string;
  stories: string[];
  prologue?: string;
  dialogue?: string[];
  trigger?: { source: string };
  intent?: { ask: string; back: string };
  path?: {
    skip?: Record<string, string>;
    passes?: number;
    autonomous?: boolean;
    fanout?: Record<string, string[]>;
    clarify?: { ask: string; shown: string; answer: string; back: string };
  };
  pass2?: {
    why?: string;
    skip?: Record<string, string>;
    story?: Record<string, string>;
  };
  simplicity?: { why: string };
  wires?: Record<string, string>;
};
export type Occurrence = {
  id: string;
  canonicalId: string | null;
  message: Message;
  story: string;
  pass: number;
  fan?: string;
  skipped?: string;
  branchNotTaken: boolean;
  duration: number;
  start: number;
  clock: 'task' | 'continuous' | 'offline';
};
export type Frame = {
  id: string;
  steps: Occurrence[];
  kind: string;
  note: string;
  pass: number;
  clock: Occurrence['clock'];
  start: number;
  duration: number;
};
export const scenarios = reference.scenarios as unknown as Scenario[];
// Preserve the original import; qualify a comparative label in the public view.
export const messages = (reference.messages as Message[]).map((message) =>
  message.n === 27
    ? { ...message, label: 'typed score or decision result' }
    : message,
);
export const defaultScenarioId = 'retail-address-human';
export const findScenario = (id?: string | null) =>
  scenarios.find((s) => s.id === id) ??
  scenarios.find((s) => s.id === defaultScenarioId)!;
export const industries = [...new Set(scenarios.map((s) => s.industry))];
const extras = [
  ...reference.clarification,
  ...reference.dialogue,
  ...reference.intent,
] as Message[];
const baseTicks = reference.ticks as {
  s: number[];
  kind?: string;
  note?: string;
}[];
// All timing is a teaching model, never telemetry or a performance claim.
// Parallel siblings start together; their join waits for the slowest sibling.
export const timingAssumptions = {
  version: 'illustrative-v1',
  ordinary: 40,
  retrieval: 120,
  reason: 900,
  external: 600,
  human: 15000,
  offline: 3600000,
  unit: 'ms',
};
function durationFor(message: Message, skipped: boolean) {
  if (skipped) return 0;
  if ([38, 43].includes(message.n ?? 0)) return 0;
  if ((message.n ?? 0) >= 39) return timingAssumptions.offline;
  if (['x3', 'd2', 'd4'].includes(message.key ?? '') || message.n === 20)
    return timingAssumptions.human;
  if (message.n === 16) return timingAssumptions.reason;
  if (message.n === 29) return timingAssumptions.external;
  if ([9, 11].includes(message.n ?? 0)) return timingAssumptions.retrieval;
  return timingAssumptions.ordinary;
}

export function buildScenario(sc: Scenario): Frame[] {
  const frames: Frame[] = [];
  const clocks = { task: 0, continuous: 0, offline: 0 };
  const path = sc.path ?? {};
  let occurrenceIndex = 0;
  function add(
    entries: {
      message: Message;
      story: string;
      skipped?: string;
      fan?: string;
      branchNotTaken?: boolean;
    }[],
    pass: number,
    kind = '',
    note = '',
  ) {
    const clock =
      kind === 'cont' ? 'continuous' : kind === 'off' ? 'offline' : 'task';
    const start = clocks[clock];
    const steps = entries.map((entry) => {
      const canonicalId = entry.message.n ? `m${entry.message.n}` : null;
      const duration = durationFor(
        entry.message,
        Boolean(entry.skipped || entry.branchNotTaken),
      );
      return {
        ...entry,
        id: `${sc.id}:p${pass}:${canonicalId ?? entry.message.key}:${occurrenceIndex++}`,
        canonicalId,
        pass,
        branchNotTaken: Boolean(entry.branchNotTaken),
        clock,
        duration,
        start,
      } as Occurrence;
    });
    const duration = Math.max(0, ...steps.map((s) => s.duration));
    clocks[clock] += duration;
    const active = steps.filter((s) => !s.skipped && !s.branchNotTaken);
    const actualKind = !active.length
      ? 'skip'
      : kind === 'par' && active.length === 1
        ? ''
        : active.length > 1 && clock === 'task'
          ? 'par'
          : kind;
    frames.push({
      id: `${sc.id}:frame-${frames.length}`,
      steps,
      pass,
      kind: actualKind,
      note: !active.length
        ? steps
            .map((s) => s.skipped ?? 'Alternative branch not taken.')
            .join(' ')
        : note,
      clock,
      start,
      duration,
    });
  }
  function canonical(tick: (typeof baseTicks)[number], pass: number) {
    const unattended =
      pass === 1
        ? Boolean(path.autonomous)
        : Boolean(
            sc.pass2?.skip?.[20] &&
            sc.pass2?.skip?.[21] &&
            sc.pass2?.story?.[22],
          );
    const entries = tick.s.flatMap((n) => {
      const base = messages.find((m) => m.n === n)!;
      const message =
        n === 1 && sc.trigger
          ? ({
              ...reference.trigger,
              n: 1,
              label: sc.trigger.source,
            } as Message)
          : { ...base, wire: sc.wires?.[n] ?? base.wire };
      const skipped =
        (pass > 1 ? sc.pass2?.skip?.[n] : undefined) ?? path.skip?.[n];
      const branchNotTaken = n === 22 && !unattended && !skipped;
      const story =
        pass === 1
          ? sc.stories[n - 1]
          : (sc.pass2?.story?.[n] ??
            (reference.secondPass as Record<string, string>)[n] ??
            `Repeated pass: ${base.label}`);
      const fans = pass === 1 ? path.fanout?.[n] : undefined;
      return (fans?.length ? fans : [undefined]).map((fan) => ({
        message,
        story,
        skipped,
        fan,
        branchNotTaken,
      }));
    });
    const taken = tick.s.includes(22) && unattended;
    add(
      entries,
      pass,
      taken ? 'taken' : tick.kind,
      pass > 1 && tick.s.includes(6)
        ? (sc.pass2?.why ?? 'Rebuild the proposal with the updated state.')
        : taken
          ? 'In this illustrative policy, the exact action is permitted without another human decision. Reversibility or a previous approval alone is not sufficient authorization.'
          : tick.note,
    );
  }
  function extra(
    keys: string[],
    stories: string[],
    kind: string,
    note: string,
  ) {
    keys.forEach((key, index) =>
      add(
        [
          {
            message: extras.find((m) => m.key === key)!,
            story: stories[index],
          },
        ],
        1,
        kind,
        note,
      ),
    );
  }
  for (const tick of baseTicks) {
    canonical(tick, 1);
    if (tick.s.includes(5) && sc.intent)
      extra(
        ['i1', 'i2'],
        [sc.intent.ask, sc.intent.back],
        'intent',
        'A separate, small-model intent call. This is additional to the canonical reasoning request/response pair.',
      );
    if (tick.s.includes(7) && path.clarify)
      extra(
        ['x1', 'x2', 'x3', 'x4'],
        [
          path.clarify.ask,
          path.clarify.shown,
          path.clarify.answer,
          path.clarify.back,
        ],
        'clarification',
        'Clarify the blocking ambiguity, screen the answer and resume from a checkpoint.',
      );
    if (tick.s.includes(20) && sc.dialogue?.length && !path.skip?.[20])
      extra(
        sc.dialogue.map((_, i) => `d${(i % 4) + 1}`),
        sc.dialogue,
        'dialogue',
        'Human dialogue: no external action is authorized merely by displaying a proposal.',
      );
    if (tick.s.includes(32))
      for (let pass = 2; pass <= (path.passes ?? 1); pass++)
        for (const repeat of baseTicks.filter(
          (t) => t.s[0] >= 6 && t.s[0] <= 32,
        ))
          canonical(repeat, pass);
  }
  return frames;
}

export const kindNames: Record<string, string> = {
  par: 'Parallel work · joined on completion',
  wait: 'Approval checkpoint · asynchronous wait',
  skip: 'Work omitted / branch not taken',
  cont: 'Continuous monitoring',
  off: 'Offline improvement',
  intent: 'Intent classification',
  clarification: 'Clarification',
  dialogue: 'Human dialogue',
  taken: 'Policy-authorized branch',
  alt: 'Alternative branch',
};
export function resolveFrame(
  frames: Frame[],
  occurrence: string | null,
  legacyHash = '',
) {
  if (occurrence) {
    const index = frames.findIndex((f) =>
      f.steps.some((s) => s.id === occurrence),
    );
    if (index >= 0) return index;
  }
  const oldStep = legacyHash.match(/^#step-(\d+)$/)?.[1];
  if (oldStep) {
    const index = frames.findIndex((f) =>
      f.steps.some((s) => s.canonicalId === `m${oldStep}`),
    );
    if (index >= 0) return index;
  }
  return 0;
}
