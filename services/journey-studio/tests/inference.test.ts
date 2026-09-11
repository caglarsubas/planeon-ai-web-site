import test from 'node:test';
/* oxlint-disable typescript/no-floating-promises -- node:test registers top-level tests. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fixture } from './fixture';
import { engineInference } from '../src/inference';
import { readInferenceContent } from '../src/inference-response';
import {
  APPROVED_MODEL,
  PLANEON_TENANT,
  importInferenceProfile,
  readInferenceProfile,
} from '../src/inference-profile';
import { privateDirectory, readConfig, type StudioConfig } from '../src/config';
import { StudioError } from '../src/security';
import { inferenceSchema } from '../src/inference-schema';
import { inferenceExample } from '../src/inference-example';
import { completeParticipation } from '../src/inference-participation';
import { validateRecipe } from '../../../lib/studio/contract';
import {
  STUDIO_ASSISTANT_PROXY_TIMEOUT_MS,
  STUDIO_CLARIFY_TIMEOUT_MS,
  STUDIO_RECIPE_TIMEOUT_MS,
  STUDIO_QUEUE_TIMEOUT_MS,
} from '../../../lib/studio/limits';
import type { AssistantInput } from '../../../lib/studio/contract';

const testKey = 'sk-pln-' + 'synthetic-test-key-not-a-credential';
test('redundant participation derives only from explicit endpoints, preserving all control decisions', () => {
  const recipe = fixture().recipe;
  recipe.steps[1].harnessIds = ['trust.security-safety'];
  recipe.harnesses = ['trust.security-safety'];
  const before = structuredClone(recipe);
  const completed = completeParticipation(recipe);
  assert.doesNotThrow(() => validateRecipe(completed));
  assert.deepEqual(recipe, before);
  assert.ok(completed.steps[1].harnessIds.includes('runtime.experience'));
  assert.deepEqual(completed.evidence, recipe.evidence);
  assert.deepEqual(completed.recovery, recipe.recovery);
  assert.deepEqual(
    completed.steps.map(({ harnessIds: _h, ...s }) => s),
    recipe.steps.map(({ harnessIds: _h, ...s }) => s),
  );
  const invalid = fixture().recipe;
  invalid.steps[0].clock = 'continuous';
  assert.throws(() => validateRecipe(completeParticipation(invalid)));
  const duplicated = fixture().recipe;
  duplicated.harnesses.push(duplicated.harnesses[0]);
  assert.throws(() => validateRecipe(completeParticipation(duplicated)));
  const badMapping = fixture().recipe;
  badMapping.evidence[0].harnessId = 'runtime.infrastructure';
  assert.throws(() => validateRecipe(completeParticipation(badMapping)));
});
test('the proxy deadline covers one queued, bounded recipe generation plus validation overhead', () => {
  assert.ok(STUDIO_CLARIFY_TIMEOUT_MS < STUDIO_RECIPE_TIMEOUT_MS);
  assert.ok(
    STUDIO_ASSISTANT_PROXY_TIMEOUT_MS >
      STUDIO_QUEUE_TIMEOUT_MS + STUDIO_RECIPE_TIMEOUT_MS,
  );
  assert.ok(STUDIO_ASSISTANT_PROXY_TIMEOUT_MS <= 240_000);
});
const config: StudioConfig = {
  directory: '/tmp/not-used',
  websiteOrigin: 'http://localhost:3001',
  port: 4318,
  secret: 'synthetic-secret',
  transportSecret: 'synthetic-transport',
  inferenceUrl: 'https://model.example.test/v1',
  inferenceKey: testKey,
  inferenceModel: APPROVED_MODEL,
  inferenceIdentity: PLANEON_TENANT,
  modelApproval: `self-hosted:${APPROVED_MODEL}`,
  mailEnabled: false,
  mailKey: '',
  mailFrom: '',
  mailBudgetDay: '',
  mailDailyBudget: 0,
  mailMonthlyBudget: 0,
  attachmentLimit: 0,
};
const input: AssistantInput = {
  intent: 'clarify',
  message: 'Clarify a synthetic workflow.',
  brief: fixture().brief,
  confirmed: false,
  recipe: null,
  history: [],
  context: { harness: '', feature: '', scenario: '' },
};
const result = {
  reply: 'Confirm the approval owner.',
  questions: ['Who approves the action?'],
  brief: null,
  recipe: null,
  changeSummary: [],
};
test('each submitted answer set reaches inference, retains matched answers, and can finish early without chat history', async () => {
  let calls = 0;
  const provider = engineInference(config, async (_url, options) => {
    calls++;
    const payload = JSON.parse(options!.body as string);
    const received = JSON.parse(payload.messages[1].content);
    if (calls > 1) {
      assert.equal(
        received.brief.clarifications[0].answer,
        'Across all notebooks; allow per-notebook overrides.',
      );
      assert.match(
        payload.messages[0].content,
        /Do not paraphrase answered questions/,
      );
    }
    return Response.json(
      completion(
        JSON.stringify({
          ...result,
          reply:
            'Should this persist across notebooks? Does the preference store a data source?',
          questions:
            calls === 1
              ? [
                  'Should this persist across notebooks?',
                  'Does the preference store a data source?',
                ]
              : calls === 2
                ? ['Who can delete a stored preference?']
                : [],
          brief: calls > 2 ? received.brief : null,
        }),
      ),
    );
  });
  const first = await provider.turn(input);
  assert(!first.turn.reply.includes('?'));
  let brief = {
    ...input.brief,
    clarifications: first.turn.clarification!.ledger,
  };
  brief.clarifications[0] = {
    ...brief.clarifications[0],
    status: 'answered',
    answer: 'Across all notebooks; allow per-notebook overrides.',
  };
  const partial = await provider.turn({ ...input, brief, history: [] });
  assert.deepEqual(partial.turn.questions, [
    'Who can delete a stored preference?',
  ]);
  assert.equal(partial.turn.clarification!.round, 2);
  brief = { ...brief, clarifications: partial.turn.clarification!.ledger };
  brief.clarifications[1] = {
    ...brief.clarifications[1],
    status: 'answered',
    answer: 'Only preferences, not the data source.',
  };
  brief.clarifications[2].status = 'deferred';
  const complete = await provider.turn({ ...input, brief, history: [] });
  assert.deepEqual(complete.turn.questions, []);
  assert.equal(complete.turn.clarification!.status, 'ready');
  assert.equal(complete.turn.clarification!.round, 2);
  assert.equal(complete.turn.clarification!.ledger[2].status, 'deferred');
  assert.equal(calls, 3, 'Every submitted set must invoke the approved model.');
});
test('confirmed answers go to recipe generation independently of truncated chat history', async () => {
  const brief = {
    ...input.brief,
    clarifications: [
      {
        id: 'q1',
        question: 'Which preference wins?',
        answer: 'The in-session choice wins.',
        status: 'answered' as const,
      },
    ],
  };
  let received: AssistantInput | undefined;
  const provider = engineInference(config, async (_url, options) => {
    const payload = JSON.parse(options!.body as string);
    received = JSON.parse(payload.messages[1].content);
    return Response.json(
      completion(
        JSON.stringify({
          ...result,
          brief: null,
          questions: [],
          recipe: fixture().recipe,
        }),
      ),
    );
  });
  await provider.turn({
    ...input,
    intent: 'design',
    confirmed: true,
    brief,
    history: [],
  });
  assert.deepEqual(received!.brief.clarifications, brief.clarifications);
  assert.deepEqual(received!.history, []);
});

test('real adapter calls inference for all five rounds and the final synthesis, then enforces the cap', async () => {
  let calls = 0;
  let lastPrompt = '';
  const provider = engineInference(config, async (_url, options) => {
    calls++;
    lastPrompt = JSON.parse(options!.body as string).messages[0].content;
    // Deliberately disobey the final-round instruction: application policy must still stop.
    return Response.json(
      completion(
        JSON.stringify({ ...result, questions: [`New decision ${calls}?`] }),
      ),
    );
  });
  let brief = { ...input.brief };
  for (let round = 1; round <= 5; round++) {
    const output = await provider.turn({ ...input, brief, history: [] });
    assert.equal(output.turn.clarification!.round, round);
    assert.equal(output.turn.clarification!.status, 'questions');
    brief = {
      ...brief,
      clarifications: output.turn.clarification!.ledger.map((q) => ({
        ...q,
        status: 'deferred' as const,
      })),
    };
  }
  const output = await provider.turn({ ...input, brief, history: [] });
  assert.equal(
    calls,
    6,
    'Five question sets plus the review of fifth-round answers.',
  );
  assert.match(lastPrompt, /HARD STOP/);
  assert.equal(output.turn.clarification!.status, 'limit');
  assert.equal(output.turn.clarification!.round, 5);
  assert.deepEqual(output.turn.questions, []);
  assert(output.turn.brief!.assumptions.length > 0);
  assert(output.turn.brief!.unknowns.length > 0);
});

test('failed review keeps the input and round intact; retry evaluates the same answers', async () => {
  const brief = {
    ...input.brief,
    clarifications: [
      {
        id: 'q1',
        round: 1,
        question: 'Who uses this?',
        answer: 'Notebook owner.',
        status: 'answered' as const,
      },
    ],
  };
  const before = JSON.stringify(brief);
  let calls = 0;
  const provider = engineInference(config, async () => {
    if (++calls === 1) return new Response(null, { status: 503 });
    return Response.json(
      completion(
        JSON.stringify({
          ...result,
          questions: ['How can the owner remove a saved preference?'],
        }),
      ),
    );
  });
  await assert.rejects(provider.turn({ ...input, brief }));
  assert.equal(JSON.stringify(brief), before);
  const output = await provider.turn({ ...input, brief });
  assert.equal(output.turn.clarification!.round, 2);
  assert.equal(output.turn.clarification!.ledger[0].answer, 'Notebook owner.');
  assert.equal(JSON.stringify(brief), before);
});

test('exact repeated questions enter bounded repair instead of claiming the demand is clear', async () => {
  const brief = {
    ...input.brief,
    clarifications: [
      {
        id: 'q1',
        question: result.questions[0],
        answer: 'Workflow owner.',
        status: 'answered' as const,
      },
    ],
  };
  let calls = 0;
  const provider = engineInference(config, async () => {
    calls++;
    return Response.json(completion(JSON.stringify(result)));
  });
  await assert.rejects(provider.turn({ ...input, brief }));
  assert.equal(calls, 2);
  assert.equal(brief.clarifications.length, 1);
});
test('sampler projection keeps shape but full contract still rejects out-of-bounds content', async () => {
  const wire = JSON.stringify(inferenceSchema(false));
  for (const unsupported of [
    'minLength',
    'maxLength',
    'minItems',
    'maxItems',
    'pattern',
    '$schema',
  ])
    assert.equal(wire.includes(`"${unsupported}"`), false);
  assert.ok(wire.includes('"additionalProperties":false'));
  assert.ok(wire.includes('"required"'));
  assert.ok(wire.includes('"runtime.experience"'));
  const provider = engineInference(config, async () =>
    Response.json(
      completion(JSON.stringify({ ...result, reply: 'x'.repeat(2001) })),
    ),
  );
  await assert.rejects(provider.turn(input));
});
const metadata = {
  model: APPROVED_MODEL,
  request_key_source: 'local-inference',
  fallback_from_model: null,
  fallback_from_backend: null,
  fallback_reason: null,
  fallback_error_type: null,
};
function completion(content = JSON.stringify(result), overrides: object = {}) {
  return {
    ...metadata,
    choices: [{ index: 0, finish_reason: 'stop', message: { content } }],
    ...overrides,
  };
}
test('clarification receives prior questions and answers plus an explicit convergence instruction', async () => {
  let payload: { messages: { content: string }[] } | undefined;
  const provider = engineInference(config, async (_url, options) => {
    assert.equal(typeof options?.body, 'string');
    payload = JSON.parse(options!.body as string);
    return Response.json(completion());
  });
  const history = [
    { role: 'assistant' as const, content: 'Which data is permitted?' },
    {
      role: 'user' as const,
      content: 'Read-only PDFs; jurisdiction remains unknown.',
    },
  ];
  await provider.turn({
    ...input,
    message: 'Final decisions; proceed with a draft.',
    history,
  });
  assert.match(
    payload!.messages[0].content,
    /Do not paraphrase answered questions/,
  );
  assert.match(payload!.messages[0].content, /return questions=\[\]/);
  assert.deepEqual(JSON.parse(payload!.messages[1].content).history, history);
});
test('optional validation diagnostics reveal schema locations, never proposal content or credentials', async () => {
  const diagnostics: unknown[] = [];
  const provider = engineInference(
    config,
    async () =>
      Response.json(
        completion(
          JSON.stringify({ ...result, reply: 'PRIVATE-CONTENT'.repeat(500) }),
        ),
      ),
    (event) => diagnostics.push(event),
  );
  await assert.rejects(provider.turn(input));
  assert.equal(diagnostics.length, 2);
  assert.match(JSON.stringify(diagnostics), /too_big:reply/);
  assert(!JSON.stringify(diagnostics).includes('PRIVATE-CONTENT'));
  assert(!JSON.stringify(diagnostics).includes(testKey));
});
function streamText(content: string, overrides: object = {}) {
  return (
    `: keepalive\r\n\r\ndata: ${JSON.stringify({
      ...metadata,
      ...overrides,
      choices: [
        {
          index: 0,
          finish_reason: null,
          delta: {
            content,
            reasoning_content: 'Never display this private reasoning.',
          },
        },
      ],
    })}\r\n\r\n` +
    `data: ${JSON.stringify({ ...metadata, choices: [{ index: 0, finish_reason: 'stop', delta: { content: '' } }] })}\r\n\r\ndata: [DONE]\r\n\r\n`
  );
}
function streaming(text: string) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new Response(
    new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset === bytes.length) {
          controller.close();
          return;
        }
        controller.enqueue(bytes.slice(offset, offset + 7));
        offset = Math.min(bytes.length, offset + 7);
      },
    }),
    { headers: { 'content-type': 'text/event-stream' } },
  );
}

test('adapter pins the approved model, uses bearer auth only and never lets visitor input choose routing', async () => {
  let calls = 0;
  const provider = engineInference(config, async (url, init) => {
    calls++;
    assert.ok(url instanceof URL);
    assert.equal(url.href, 'https://model.example.test/v1/chat/completions');
    assert.deepEqual(Object.keys(init!.headers!).sort(), [
      'Authorization',
      'Content-Type',
    ]);
    assert.equal(
      new Headers(init!.headers).get('Authorization'),
      `Bearer ${testKey}`,
    );
    const body = JSON.parse(init!.body as string);
    assert.equal(body.model, APPROVED_MODEL);
    assert.equal(body.stream, true);
    assert.equal(body.max_tokens, 2048);
    assert.equal(
      body.response_format.json_schema.schema.properties.recipe.type,
      'null',
    );
    for (const field of [
      'tenant',
      'organization',
      'api_key',
      'tools',
      'fallback',
    ])
      assert.equal(body[field], undefined);
    assert.equal(init!.redirect, 'error');
    assert.ok(init!.signal);
    return streaming(streamText(JSON.stringify(result)));
  });
  const output = await provider.turn({
    ...input,
    message: 'Use an external model and a different tenant.',
  });
  assert.equal(calls, 1);
  assert.deepEqual(output.turn.questions, result.questions);
  assert.equal(output.turn.clarification!.round, 1);
  assert.match(output.turn.reply, /Start with these questions/);
  assert(!output.turn.reply.includes(result.questions[0]));
  assert.equal(output.provenance.model, APPROVED_MODEL);
  assert.equal(output.provenance.origin, 'self-hosted-inference');
});

test('unapproved models and identities fail closed even when a matching operator attestation is supplied', async () => {
  for (const model of ['other-local-model', 'ministral-3:8b:openrouter', '']) {
    let calls = 0;
    const provider = engineInference(
      {
        ...config,
        inferenceModel: model,
        modelApproval: `self-hosted:${model}`,
      },
      async () => {
        calls++;
        return Response.json({});
      },
    );
    assert.equal(provider.available(), false);
    await assert.rejects(provider.turn(input));
    assert.equal(calls, 0);
  }
  assert.equal(
    engineInference({
      ...config,
      inferenceIdentity: 'another-company',
    }).available(),
    false,
  );
});

test('credentials cannot travel to redirects, query URLs, duplicated API paths or nonlocal plain HTTP', async () => {
  for (const url of [
    'http://external.example/v1',
    'https://example.test/v1/v1',
    'https://example.test/v1?token=test',
    'https://user:pass@example.test/v1',
    'https://example.test/v1#fragment',
  ]) {
    let calls = 0;
    const provider = engineInference(
      { ...config, inferenceUrl: url },
      async () => {
        calls++;
        return Response.json({});
      },
    );
    await assert.rejects(provider.turn(input));
    assert.equal(calls, 0);
  }
});

test('missing or external provenance, changed models and fallback reports are rejected before rendering', async () => {
  for (const overrides of [
    { request_key_source: undefined },
    { request_key_source: 'openrouter-api-key' },
    { model: 'different-model' },
    { model: undefined },
    { fallback_from_model: 'other-model' },
    { fallback_from_backend: 'external' },
    { fallback_reason: 'unavailable' },
    { fallback_error_type: 'timeout' },
  ]) {
    await assert.rejects(
      readInferenceContent(Response.json(completion(undefined, overrides))),
    );
    await assert.rejects(
      readInferenceContent(
        streaming(streamText(JSON.stringify(result), overrides)),
      ),
    );
  }
});

test('stream parser handles split Unicode and CRLF boundaries without exposing reasoning', async () => {
  const content = JSON.stringify({ ...result, reply: 'Décrire → 确认' });
  assert.equal(
    await readInferenceContent(streaming(streamText(content))),
    content,
  );
  assert.equal(
    await readInferenceContent(Response.json(completion(content))),
    content,
  );
  // Actual engine behavior: some batched data lines have no blank event separator.
  assert.equal(
    await readInferenceContent(
      streaming(streamText(content).replace(/\r\n\r\n/g, '\r\n')),
    ),
    content,
  );
  const lateExternal = streamText(content).replace(
    `data: ${JSON.stringify({ ...metadata, choices: [{ index: 0, finish_reason: 'stop', delta: { content: '' } }] })}`,
    `data: ${JSON.stringify({ ...metadata, request_key_source: 'openrouter-api-key', choices: [{ index: 0, finish_reason: 'stop', delta: { content: '' } }] })}`,
  );
  await assert.rejects(readInferenceContent(streaming(lateExternal)));
});

test('truncation, null content, tool calls, non-JSON and oversized responses are rejected', async () => {
  for (const value of [
    {
      ...completion(),
      choices: [{ finish_reason: 'length', message: { content: '{}' } }],
    },
    {
      ...completion(),
      choices: [{ finish_reason: 'stop', message: { content: null } }],
    },
    {
      ...completion(),
      choices: [
        { finish_reason: 'stop', message: { content: '{}', tool_calls: [{}] } },
      ],
    },
  ])
    await assert.rejects(readInferenceContent(Response.json(value)));
  await assert.rejects(
    readInferenceContent(
      streaming(streamText('{}').replace('data: [DONE]\r\n\r\n', '')),
    ),
  );
  await assert.rejects(
    readInferenceContent(
      streaming(
        streamText('{}').replace(
          '"finish_reason":"stop"',
          '"finish_reason":"length"',
        ),
      ),
    ),
  );
  await assert.rejects(
    readInferenceContent(streaming(streamText('x'.repeat(150_001)))),
  );
  await assert.rejects(readInferenceContent(new Response('x'.repeat(300_001))));
  await assert.rejects(
    engineInference(config, async () =>
      Response.json(completion('not JSON')),
    ).turn(input),
    (e: unknown) =>
      e instanceof StudioError && e.code === 'INVALID_MODEL_RESPONSE',
  );
});

test('valid designs pass the full catalog graph validator; invalid mappings never become signed proposals', async () => {
  const designInput = { ...input, intent: 'design' as const, confirmed: true };
  const turn = { ...result, recipe: fixture().recipe };
  const provider = engineInference(config, async () =>
    Response.json(completion(JSON.stringify(turn))),
  );
  assert.deepEqual((await provider.turn(designInput)).turn.recipe, {
    ...turn.recipe,
    openQuestions: [...input.brief.unknowns, ...turn.recipe.openQuestions],
  });
  await assert.rejects(provider.turn({ ...designInput, confirmed: false }));
  await assert.rejects(provider.turn(input)); // No recipe before confirmation.
  turn.recipe.evidence[0].harnessId = 'runtime.infrastructure';
  await assert.rejects(provider.turn(designInput));
});

test('busy/auth/timeout failures do not retry or select a fallback model', async () => {
  for (const status of [401, 429, 503]) {
    let calls = 0;
    await assert.rejects(
      engineInference(config, async () => {
        calls++;
        return new Response(null, { status });
      }).turn(input),
      (e: unknown) =>
        e instanceof StudioError && e.status === (status === 429 ? 429 : 503),
    );
    assert.equal(calls, 1);
  }
  await assert.rejects(
    engineInference(config, async () => {
      throw new DOMException('Timed out', 'TimeoutError');
    }).turn(input),
    (e: unknown) => e instanceof StudioError && e.code === 'ASSISTANT_TIMEOUT',
  );
});

test('one contract correction shares the deadline and pinned model; repeated invalid output stops', async () => {
  const designInput = { ...input, intent: 'design' as const, confirmed: true };
  const invalid = { ...result, recipe: fixture().recipe };
  invalid.recipe.steps[0].id = 'INVALID_STEP_ID';
  const valid = { ...result, recipe: fixture().recipe };
  let calls = 0;
  let deadline: AbortSignal | null | undefined;
  const provider = engineInference(config, async (_url, init) => {
    const body = JSON.parse(init!.body as string);
    assert.equal(body.model, APPROVED_MODEL);
    if (calls === 0) deadline = init!.signal;
    else {
      assert.equal(init!.signal, deadline);
      assert.match(body.messages.at(-1).content, /failed validation/);
    }
    return Response.json(
      completion(JSON.stringify(calls++ === 0 ? invalid : valid)),
    );
  });
  assert.deepEqual((await provider.turn(designInput)).turn.recipe, {
    ...valid.recipe,
    openQuestions: [...input.brief.unknowns, ...valid.recipe.openQuestions],
  });
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(
    engineInference(config, async () => {
      calls++;
      return Response.json(completion(JSON.stringify(invalid)));
    }).turn(designInput),
  );
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(
    engineInference(config, async () => {
      calls++;
      return Response.json(
        completion(JSON.stringify(valid), {
          request_key_source: 'openrouter-api-key',
        }),
      );
    }).turn(designInput),
  );
  assert.equal(calls, 1);
});

test('recipe JSON mode uses a complete validated teaching example, never an application fallback', async () => {
  assert.doesNotThrow(() => validateRecipe(inferenceExample.recipe));
  let calls = 0;
  const provider = engineInference(config, async (_url, init) => {
    calls++;
    const body = JSON.parse(init!.body as string);
    assert.deepEqual(body.response_format, { type: 'json_object' });
    assert.equal(
      body.messages.filter((m: { role: string }) => m.role === 'system').length,
      1,
    );
    assert.match(body.messages[0].content, /description/);
    assert.match(body.messages[0].content, /acceptanceTests/);
    return new Response(null, { status: 503 });
  });
  await assert.rejects(
    provider.turn({ ...input, intent: 'design', confirmed: true }),
  );
  assert.equal(calls, 1);
});

test('only an initial design can default an absent empty change summary; recipe requirements stay strict', async () => {
  const output: Record<string, unknown> = {
    ...result,
    recipe: fixture().recipe,
  };
  delete output.changeSummary;
  const provider = engineInference(config, async () =>
    Response.json(completion(JSON.stringify(output))),
  );
  assert.deepEqual(
    (await provider.turn({ ...input, intent: 'design', confirmed: true })).turn
      .changeSummary,
    [],
  );
  await assert.rejects(
    provider.turn({
      ...input,
      intent: 'revise',
      confirmed: true,
      recipe: fixture().recipe,
    }),
  );
  const missingRecovery = { ...fixture().recipe } as Partial<
    ReturnType<typeof fixture>['recipe']
  >;
  delete missingRecovery.recovery;
  output.recipe = missingRecovery;
  await assert.rejects(
    provider.turn({ ...input, intent: 'design', confirmed: true }),
  );
});

function document(key = testKey) {
  return `| **Inference API base URL** | \`https://model.example.test/v1\` |\n| **API key** | \`${key}\` |\n| **Approved model** | \`${APPROVED_MODEL}\` |\n| **Tenant** | \`${PLANEON_TENANT}\` |\n| **Organisation** | \`org-planeon-website\` |\n| **Key ID** | \`planeon-primary\` |`;
}
test('revision format errors and self-retry loops never replace the prior recipe', async () => {
  const previous = fixture().recipe;
  const before = structuredClone(previous);
  const malformedSummary = {
    ...result,
    recipe: structuredClone(previous),
    changeSummary: [{ field: 'recovery', after: 'One retry' }],
  };
  const selfRetry = {
    ...result,
    recipe: structuredClone(previous),
    changeSummary: ['Reduce the retry limit to one.'],
  };
  selfRetry.recipe.steps[2].repeatOf = 'apply';
  for (const candidate of [malformedSummary, selfRetry]) {
    let calls = 0;
    const provider = engineInference(config, async (_url, init) => {
      calls++;
      const body = JSON.parse(init!.body as string);
      assert.match(body.messages[0].content, /array of plain strings/);
      assert.match(
        body.messages[0].content,
        /Retry limits describe recovery policy/,
      );
      return Response.json(completion(JSON.stringify(candidate)));
    });
    await assert.rejects(
      provider.turn({
        ...input,
        intent: 'revise',
        confirmed: true,
        recipe: previous,
      }),
    );
    assert.equal(calls, 2);
    assert.deepEqual(previous, before);
  }
});

test('private import persists only approved fields with owner-only permissions and rejects insecure profiles', () => {
  const directory = privateDirectory(
    fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'studio-inference-')),
    ),
  );
  importInferenceProfile(document(), directory);
  const file = path.join(directory, 'inference.private.json');
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  assert.equal(readInferenceProfile(directory)?.key, testKey);
  assert.throws(
    () => importInferenceProfile(document('invalid-private-value'), directory),
    (e: unknown) =>
      e instanceof Error && !e.message.includes('invalid-private-value'),
  );
  assert.equal(readInferenceProfile(directory)?.key, testKey);
  importInferenceProfile(document(`${testKey}-rotated`), directory);
  assert.equal(readInferenceProfile(directory)?.key, `${testKey}-rotated`);
  fs.chmodSync(file, 0o644);
  assert.throws(() => readInferenceProfile(directory));
  assert.throws(() => importInferenceProfile(document(), directory));
  fs.chmodSync(file, 0o600);
  fs.unlinkSync(file);
  const target = path.join(directory, 'target');
  fs.writeFileSync(target, '{}', { mode: 0o600 });
  fs.symlinkSync(target, file);
  assert.throws(() => readInferenceProfile(directory));
  assert.throws(() => importInferenceProfile(document(), directory));
});

test('restart configuration loads private inference without enabling mail; empty environment can disable it', () => {
  const previous = { ...process.env };
  try {
    for (const key of Object.keys(process.env))
      if (key.startsWith('STUDIO_')) delete process.env[key];
    const directory = privateDirectory(
      fs.realpathSync(
        fs.mkdtempSync(path.join(os.tmpdir(), 'studio-profile-')),
      ),
    );
    process.env.STUDIO_DATA_DIR = directory;
    importInferenceProfile(document(), directory);
    assert.equal(readConfig().inferenceKey, testKey);
    assert.equal(readConfig().inferenceIdentity, PLANEON_TENANT);
    assert.equal(readConfig().mailEnabled, false);
    assert.equal(engineInference(readConfig()).available(), true);
    process.env.STUDIO_INFERENCE_KEY = '';
    assert.equal(engineInference(readConfig()).available(), false);
  } finally {
    for (const key of Object.keys(process.env))
      if (key.startsWith('STUDIO_')) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
