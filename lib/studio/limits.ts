// Public constants only: keep the queue, streamed generation and proxy budgets aligned.
export const STUDIO_QUEUE_TIMEOUT_MS = 30_000;
export const STUDIO_CLARIFY_TIMEOUT_MS = 60_000;
export const STUDIO_RECIPE_TIMEOUT_MS = 180_000;
export const STUDIO_ASSISTANT_PROXY_TIMEOUT_MS =
  STUDIO_QUEUE_TIMEOUT_MS + STUDIO_RECIPE_TIMEOUT_MS + 10_000;
