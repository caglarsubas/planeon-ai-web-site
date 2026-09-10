import { z } from 'zod';
import { APPROVED_MODEL } from './inference-profile';

// This is the supplied model-plane envelope, not an assurance made by generated text.
const envelope = z.object({
  model: z.literal(APPROVED_MODEL),
  request_key_source: z.literal('local-inference'),
  fallback_from_model: z.null().optional(),
  fallback_from_backend: z.null().optional(),
  fallback_reason: z.null().optional(),
  fallback_error_type: z.null().optional(),
  error: z.undefined().optional(),
  choices: z
    .array(
      z.object({
        index: z.literal(0).optional(),
        finish_reason: z
          .enum(['stop', 'length', 'tool_calls', 'content_filter'])
          .nullable(),
        message: z
          .object({
            content: z.string().nullable(),
            tool_calls: z.array(z.unknown()).max(0).nullable().optional(),
          })
          .optional(),
        delta: z
          .object({
            content: z.string().nullable().optional(),
            tool_calls: z.array(z.unknown()).max(0).nullable().optional(),
          })
          .optional(),
      }),
    )
    .max(1),
});

/** Never expose partial/unverified content. Ignore reasoning fields, never render or log them. */
export async function readInferenceContent(
  response: Response,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing inference body');
  const streaming = response.headers
    .get('content-type')
    ?.includes('text/event-stream');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0,
    buffer = '',
    content = '',
    finished = false,
    doneEvent = false;
  const event = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data) return;
    if (doneEvent) throw new Error('Content after stream completion');
    if (data === '[DONE]') {
      doneEvent = true;
      return;
    }
    const value = envelope.parse(JSON.parse(data));
    const choice = value.choices[0];
    if (!choice) return; // Verified usage-only envelope.
    if (finished) throw new Error('Content after terminal choice');
    content += choice.delta?.content ?? '';
    if (content.length > 150_000) throw new Error('Inference content limit');
    if (choice.finish_reason) {
      if (choice.finish_reason !== 'stop')
        throw new Error('Incomplete inference');
      finished = true;
    }
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > (streaming ? 8_000_000 : 300_000))
        throw new Error('Inference envelope limit');
      buffer += decoder.decode(value, { stream: true });
      if (streaming) {
        // This engine emits one complete JSON envelope per data line, but occasionally
        // omits blank separators between envelopes. Validate every line independently;
        // never merge adjacent JSON objects or drop their deltas. CRLF is trimmed above.
        let boundary: number;
        while ((boundary = buffer.indexOf('\n')) >= 0) {
          event(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 1);
        }
        if (buffer.length > 300_000) throw new Error('Inference frame limit');
        if (doneEvent) break;
      }
    }
    buffer += decoder.decode();
    if (streaming) {
      if (!doneEvent || !finished || !content.trim() || buffer.trim())
        throw new Error('Truncated inference stream');
      return content;
    }
    const value = envelope.parse(JSON.parse(buffer));
    const choice = value.choices[0];
    if (choice?.finish_reason !== 'stop' || !choice.message?.content?.trim())
      throw new Error('Incomplete inference');
    return choice.message.content;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
