// Public constants only: keep the queue, streamed generation and proxy budgets aligned.
// 4318 is the standard OTLP HTTP port and may be occupied by the inference stack.
export const STUDIO_LOCAL_PORT = 4320;
export const STUDIO_QUEUE_TIMEOUT_MS = 30_000;
export const STUDIO_CLARIFY_TIMEOUT_MS = 60_000;
export const STUDIO_RECIPE_TIMEOUT_MS = 180_000;
export const STUDIO_ASSISTANT_PROXY_TIMEOUT_MS =
  STUDIO_QUEUE_TIMEOUT_MS + STUDIO_RECIPE_TIMEOUT_MS + 10_000;
