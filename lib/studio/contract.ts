import { z } from 'zod';
import { byId, contentVersion, harnesses } from '../harness';
import { features, relation } from '../aml';

export const RECIPE_VERSION = 'planeon.solution-recipe.v1' as const;
export const briefFields = [
  'outcome',
  'actors',
  'data',
  'integrations',
  'environment',
  'permissions',
  'regulation',
  'recovery',
] as const;
const text = z.string().trim().min(1).max(2000);
const short = z.string().trim().min(1).max(180);
const list = z.array(text).max(20);
export const clarificationSchema = z
  .strictObject({
    id: z.string().regex(/^q[1-5]$/),
    question: short,
    answer: z.string().trim().max(1200),
    status: z.enum(['unanswered', 'answered', 'assumption', 'deferred']),
  })
  .refine(
    (q) =>
      q.status === 'answered' || q.status === 'assumption'
        ? q.answer.length > 0
        : q.status !== 'unanswered' || q.answer.length === 0,
    'An answer needs text; an unanswered question cannot contain an answer.',
  );
export type Clarification = z.infer<typeof clarificationSchema>;
export const briefSchema = z.strictObject({
  workflow: text,
  outcome: z.string().max(1200),
  actors: z.string().max(1200),
  data: z.string().max(1200),
  integrations: z.string().max(1200),
  environment: z.string().max(1200),
  permissions: z.string().max(1200),
  regulation: z.string().max(1200),
  recovery: z.string().max(1200),
  facts: list,
  assumptions: list,
  unknowns: list,
  // Optional for compatibility with existing signed packs. Public drafts remain tab-local.
  clarifications: z
    .array(clarificationSchema)
    .max(5)
    .refine(
      (items) => new Set(items.map((q) => q.id)).size === items.length,
      'Question identifiers must be unique.',
    )
    .optional(),
});
export type JourneyBrief = z.infer<typeof briefSchema>;
export function emptyBrief(workflow = ''): JourneyBrief {
  return {
    workflow,
    outcome: '',
    actors: '',
    data: '',
    integrations: '',
    environment: '',
    permissions: '',
    regulation: '',
    recovery: '',
    facts: [],
    assumptions: [],
    unknowns: [],
  };
}
const harnessId = z.enum(harnesses.map((h) => h.id) as [string, ...string[]]);
const featureId = z.enum(features.map((f) => f.id) as [string, ...string[]]);
const stepId = z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
const endpoint = z.union([harnessId, z.enum(['user', 'ext', 'core', 'trig'])]);
export const recipeSchema = z.strictObject({
  version: z.literal(RECIPE_VERSION),
  title: short,
  objective: text,
  harnesses: z.array(harnessId).min(1).max(16),
  steps: z
    .array(
      z.strictObject({
        id: stepId,
        title: short,
        description: text,
        from: endpoint,
        to: endpoint,
        harnessIds: z.array(harnessId).max(16),
        featureIds: z.array(featureId).max(16),
        dependsOn: z.array(stepId).max(12),
        kind: z.enum([
          'action',
          'clarification',
          'approval',
          'parallel',
          'omitted',
          'repeated',
          'monitoring',
          'offline',
        ]),
        clock: z.enum(['task', 'continuous', 'offline']),
        parallelGroup: z.string().max(48),
        repeatOf: z.string().max(48),
        inputs: text,
        outputs: text,
        authorization: text,
        recovery: text,
        durationMs: z.number().int().min(0).max(3600000),
        timingAssumption: text,
      }),
    )
    .min(2)
    .max(60),
  evidence: z
    .array(
      z.strictObject({
        featureId,
        harnessId,
        rationale: text,
        expectedEvidence: text,
      }),
    )
    .min(1)
    .max(100),
  phases: z
    .array(
      z.strictObject({
        name: short,
        prerequisite: text,
        deliverable: text,
        evidence: text,
        advanceOrHold: text,
      }),
    )
    .min(1)
    .max(6),
  assumptions: list,
  openQuestions: list,
  acceptanceTests: z.array(text).min(1).max(30),
  recovery: z.strictObject({
    stopFutureActions: text,
    restoreVersion: text,
    compensateEffects: text,
  }),
});
export type SolutionRecipe = z.infer<typeof recipeSchema>;
export const turnSchema = z.strictObject({
  reply: text,
  questions: z.array(short).max(5),
  brief: briefSchema.nullable(),
  recipe: recipeSchema.nullable(),
  changeSummary: list,
});
export type AssistantTurn = z.infer<typeof turnSchema>;
export const assistantInputSchema = z.strictObject({
  intent: z.enum(['clarify', 'design', 'revise']),
  message: text,
  brief: briefSchema,
  confirmed: z.boolean(),
  recipe: recipeSchema.nullable(),
  history: z
    .array(
      z.strictObject({ role: z.enum(['user', 'assistant']), content: text }),
    )
    .max(12),
  context: z.strictObject({
    harness: z.string().max(100),
    feature: z.string().max(20),
    scenario: z.string().max(100),
  }),
});
export type AssistantInput = z.infer<typeof assistantInputSchema>;
export type RecipeSnapshot = {
  recipe: SolutionRecipe;
  brief: JourneyBrief;
  provenance: {
    catalogVersion: string;
    recipeVersion: string;
    model: string;
    generatedAt: string;
    origin: 'self-hosted-inference';
  };
};

/** All model output is untrusted data. Validate IDs, graph and catalog relations before any rendering or persistence. */
export function validateRecipe(value: unknown): SolutionRecipe {
  const r = recipeSchema.parse(value);
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length)
      throw new Error(`Duplicate ${label}.`);
  };
  unique(r.harnesses, 'harness');
  unique(
    r.steps.map((s) => s.id),
    'step',
  );
  unique(
    r.evidence.map((e) => `${e.featureId}:${e.harnessId}`),
    'evidence relationship',
  );
  const seen = new Map<string, SolutionRecipe['steps'][number]>();
  const groups = new Map<string, string>();
  for (const s of r.steps) {
    unique(s.harnessIds, 'step harness');
    unique(s.featureIds, 'step feature');
    unique(s.dependsOn, 'dependency');
    if (s.from === s.to && s.from === 'core')
      throw new Error('Model core cannot be its own control boundary.');
    for (const id of [...s.harnessIds, s.from, s.to].filter((id) => byId(id))) {
      if (!r.harnesses.includes(id))
        throw new Error('Step harness is missing from recipe participation.');
    }
    for (const id of [s.from, s.to].filter((id) => byId(id)))
      if (!s.harnessIds.includes(id))
        throw new Error('Step endpoint missing from participating harnesses.');
    for (const id of s.dependsOn) {
      const predecessor = seen.get(id);
      if (!predecessor)
        throw new Error(
          'Dependencies must name earlier steps; cycles are not permitted.',
        );
      if (predecessor.clock !== s.clock)
        throw new Error(
          'Offline and monitoring work must stay separate from the task timeline.',
        );
      if (s.parallelGroup && predecessor.parallelGroup === s.parallelGroup)
        throw new Error('Parallel siblings cannot depend on one another.');
    }
    if (
      s.kind === 'repeated' &&
      (!seen.has(s.repeatOf) || seen.get(s.repeatOf)?.clock !== s.clock)
    )
      throw new Error(
        'Repeated pass must name an earlier step in the same timeline.',
      );
    if (s.kind !== 'repeated' && s.repeatOf)
      throw new Error('Only repeated steps may name repeatOf.');
    if (
      (s.kind === 'monitoring') !== (s.clock === 'continuous') ||
      (s.kind === 'offline') !== (s.clock === 'offline')
    )
      throw new Error('Activity clock does not match its kind.');
    if ((s.kind === 'parallel') !== Boolean(s.parallelGroup))
      throw new Error('Parallel steps require an explicit group.');
    if (s.parallelGroup) {
      const signature = JSON.stringify([s.clock, [...s.dependsOn].sort()]);
      if (
        groups.has(s.parallelGroup) &&
        groups.get(s.parallelGroup) !== signature
      )
        throw new Error('Parallel siblings need the same prerequisites.');
      groups.set(s.parallelGroup, signature);
    }
    for (const id of s.featureIds)
      if (
        !r.evidence.some(
          (e) => e.featureId === id && s.harnessIds.includes(e.harnessId),
        )
      )
        throw new Error(
          'Step AML feature needs a mapped participating harness.',
        );
    seen.set(s.id, s);
  }
  for (const [group] of groups)
    if (r.steps.filter((s) => s.parallelGroup === group).length < 2)
      throw new Error('A parallel group needs at least two branches.');
  for (const e of r.evidence) {
    if (
      !r.harnesses.includes(e.harnessId) ||
      !relation(
        features.find((f) => f.id === e.featureId)!,
        e.harnessId,
      )
    )
      throw new Error('AML relationship is not in the reference catalog.');
  }
  return r;
}

export function recipeChanges(previous: SolutionRecipe, next: SolutionRecipe) {
  const added = next.steps
    .filter((s) => !previous.steps.some((p) => p.id === s.id))
    .map((s) => s.title);
  const removed = previous.steps
    .filter((s) => !next.steps.some((p) => p.id === s.id))
    .map((s) => s.title);
  const changed = next.steps
    .filter((s) => {
      const old = previous.steps.find((p) => p.id === s.id);
      return old && JSON.stringify(old) !== JSON.stringify(s);
    })
    .map((s) => s.title);
  return {
    added,
    removed,
    changed,
    evidenceChanged:
      JSON.stringify(previous.evidence) !== JSON.stringify(next.evidence),
    assumptionsChanged:
      JSON.stringify(previous.assumptions) !== JSON.stringify(next.assumptions),
    phasesChanged:
      JSON.stringify(previous.phases) !== JSON.stringify(next.phases),
    recoveryChanged:
      JSON.stringify(previous.recovery) !== JSON.stringify(next.recovery),
    objectiveChanged: previous.objective !== next.objective,
    titleChanged: previous.title !== next.title,
    harnessesChanged:
      JSON.stringify(previous.harnesses) !== JSON.stringify(next.harnesses),
    openQuestionsChanged:
      JSON.stringify(previous.openQuestions) !==
      JSON.stringify(next.openQuestions),
    acceptanceTestsChanged:
      JSON.stringify(previous.acceptanceTests) !==
      JSON.stringify(next.acceptanceTests),
  };
}

/** Retain the questions as well as the answer; no server-side transcript storage. */
export function conversationTurn(reply: string, questions: string[]) {
  const prompts = questions.join('\n');
  return prompts
    ? `${reply.slice(0, Math.max(0, 1999 - prompts.length))}\n${prompts}`
    : reply.slice(0, 2000);
}
export function recipeProvenance(model: string): RecipeSnapshot['provenance'] {
  return {
    catalogVersion: contentVersion,
    recipeVersion: RECIPE_VERSION,
    model,
    generatedAt: new Date().toISOString(),
    origin: 'self-hosted-inference',
  };
}
