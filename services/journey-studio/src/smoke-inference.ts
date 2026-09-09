// Opt-in synthetic live check. Not part of the automated/mock test suite; sends no emails.
import {
  emptyBrief,
  turnSchema,
  validateRecipe,
  type AssistantInput,
} from '../../../lib/studio/contract';
import { recipeFrames } from '../../../lib/studio/frames';
import { APPROVED_MODEL } from './inference-profile';
import { STUDIO_ASSISTANT_PROXY_TIMEOUT_MS } from '../../../lib/studio/limits';

if (process.argv[2] !== '--live-local')
  throw new Error('Explicit --live-local is required.');
let cookie = '';
let phase = 'health';
const origin = 'http://localhost:3001';
const brief = {
  ...emptyBrief(
    'Synthetic example: a customer requests an order delivery-address change after payment.',
  ),
  outcome:
    'Change only an eligible unshipped order, then independently verify the saved address.',
  actors: 'Customer and authorized support operator.',
  data: 'Synthetic order ID, address, shipment state and record version. No real personal data.',
  integrations:
    'Order API with versioned reads, conditional updates and idempotency keys.',
  environment: 'Private test environment, local self-hosted inference.',
  permissions:
    'Authenticated customer owns the order; human approval before mutation.',
  regulation:
    'Applicability requires professional review; do not claim certification.',
  recovery:
    'At most three retries; reconcile state before retrying a timed-out write; escalate unresolved changes.',
  facts: ['An authorized human must approve any order mutation.'],
};
const base: AssistantInput = {
  intent: 'clarify',
  message:
    'Identify any essential missing decisions in this synthetic workflow.',
  brief,
  confirmed: false,
  recipe: null,
  history: [],
  context: { harness: '', feature: '', scenario: '' },
};
async function turn(input: AssistantInput) {
  const start = Date.now();
  const response = await fetch(`${origin}/api/studio/assistant`, {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(STUDIO_ASSISTANT_PROXY_TIMEOUT_MS + 5_000),
    redirect: 'error',
  });
  const result = await response.json();
  if (!response.ok) {
    console.info(
      JSON.stringify({
        phase,
        status: response.status,
        code: result.code,
        elapsedMs: Date.now() - start,
      }),
    );
    throw new Error('Live turn failed');
  }
  cookie =
    response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ') || cookie;
  const { signedRecipe, ...body } = result;
  const validated = turnSchema.parse(body);
  if (validated.recipe) {
    const recipe = validateRecipe(validated.recipe);
    if (
      JSON.stringify(signedRecipe?.snapshot?.recipe) !==
        JSON.stringify(recipe) ||
      signedRecipe?.snapshot?.provenance?.model !== APPROVED_MODEL ||
      signedRecipe?.snapshot?.provenance?.origin !== 'self-hosted-inference' ||
      typeof signedRecipe?.signature !== 'string' ||
      !signedRecipe.signature.length
    )
      throw new Error('Missing validated signed snapshot');
    if (!recipeFrames(recipe).length) throw new Error('No walkthrough frames');
    const description = JSON.stringify(recipe).toLowerCase();
    if (
      !description.includes('address') ||
      !description.includes('order') ||
      !recipe.steps.some(
        (step) => step.kind === 'approval' && step.clock === 'task',
      )
    )
      throw new Error('The recipe did not represent the confirmed workflow');
    if (phase === 'revise' && !validated.changeSummary.length)
      throw new Error('The revision did not explain its changes');
  }
  console.info(
    JSON.stringify({
      phase,
      status: response.status,
      elapsedMs: Date.now() - start,
      questions: validated.questions.length,
      steps: validated.recipe?.steps.length ?? 0,
      relationships: validated.recipe?.evidence.length ?? 0,
      signed: Boolean(signedRecipe),
    }),
  );
  return validated;
}
try {
  const health = await (await fetch(`${origin}/api/studio/health`)).json();
  if (!health.available || !health.assistant || health.email)
    throw new Error('Unexpected local activation state');
  console.info(
    JSON.stringify({ phase, assistant: health.assistant, email: health.email }),
  );
  phase = 'clarify';
  await turn(base);
  phase = 'design';
  const design = await turn({
    ...base,
    intent: 'design',
    confirmed: true,
    message:
      'Create a concise six-step proposed recipe for the confirmed synthetic brief. Keep unconfirmed details as assumptions or open questions.',
  });
  if (process.argv.includes('--revision')) {
    phase = 'revise';
    await turn({
      ...base,
      intent: 'revise',
      confirmed: true,
      recipe: design.recipe,
      message:
        'Propose reducing retries from three to one, keeping reconciliation and human approval. Explain the change; do not apply it automatically.',
    });
  }
} catch {
  console.error(
    `Synthetic integration check failed at ${phase}. No private content was logged.`,
  );
  process.exitCode = 1;
}
