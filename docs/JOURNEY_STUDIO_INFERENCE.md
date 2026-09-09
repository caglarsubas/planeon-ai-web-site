# Journey Studio — Planeon inference integration

Scope: local preview only. The existing consultation API, hosting identity, DNS, email configuration and account ownership are unchanged. No inference-server configuration or tenant was created by this integration.

## Supplied operator contract

The connection document issued on 9 September 2026 identifies tenant `planeon-ai-web-site`, organization `org-planeon-website`, key ID `planeon-primary`, and approved model `ministral-3:8b`. Authentication is a bearer token only. The engine derives tenant identity from that token; the local identity setting is a configuration guard, not an authorization mechanism.

The supplied key can access the wider engine catalog, including external models. Therefore the application does **not** rely on the key being model-restricted. It hard-pins the approved model and rejects every response envelope unless the model matches, `request_key_source` is `local-inference`, and no fallback is reported. Browser input and model-generated text cannot choose a model, endpoint, tenant or recipient. Engine-side restriction to the approved model would add defense in depth.

## Private setup and rotation

```sh
npm --prefix services/journey-studio run configure:inference -- /absolute/path/to/operator-document.md
npm run studio:dev
```

The importer reads only the approved connection table. It does not execute commands or instructions in the document. The key is read from the file, never passed as a command-line argument or printed. It atomically writes the inference-only profile under the existing private Studio data directory with owner-only permissions. It refuses symlinks, insecure file permissions, unsupported models, identities or URL shapes. Normal starts read this profile automatically. Explicit environment values override it; an explicitly empty key disables inference.

The connection document and screenshot contain a credential. Keep them private and have the engine operator rotate the key. Re-import the replacement document and restart the service; auth secrets, request files and mail settings are preserved. Neither the document nor its secret belongs in this repository, client assets, logs or a Git remote URL.

## Adapter behavior

- Streaming is consumed privately and bounded: 60 seconds for clarification, 180 seconds for recipes, an 8 MB transport ceiling and a 150,000-character assembled-content ceiling. The assistant proxy allows 220 seconds, covering the existing 30-second queue and validation overhead. These budgets are shared constants, not user-controlled values. No partial model output reaches a visitor. Public bridge latency still requires separate end-to-end qualification.
- Only normal completion is accepted. Truncation, tools, missing provenance, external source, changed model, fallback, malformed JSON and invalid reference graphs fail closed.
- The supplied engine sometimes batches complete `data:` JSON lines without a blank SSE separator. The adapter validates each complete line, including its routing metadata, and preserves every content delta across split network/UTF-8 boundaries. It does not skip malformed frames.
- Reasoning fields are ignored, not presented as an audit trail or retained.
- The deployed sampler rejected the full Zod-generated grammar. Clarification uses a structural schema subset. Recipes use JSON-object mode with a complete, deliberately different-workflow teaching example and explicit field rules. The original full Zod schema and semantic validator enforce every recipe bound and reference afterwards. The teaching example is never an application fallback. An absent change summary defaults to empty only on an initial design, which has no previous version; revisions and all recipe fields remain strict.
- One active inference job, four waiting slots and the existing 30-second queue limit remain. A busy response asks the visitor to retry; there is no automatic provider fallback or unbounded retry loop.
- Clarification and design use separate token budgets, both above the operator's 1,024-token minimum. Concise initial recipes keep the request within a bounded interactive budget.
- Existing HMAC-signed snapshots, explicit brief confirmation and explicit application of a revision are unchanged.
- The adapter completes redundant participant lists from the already explicit `from`/`to` harness endpoints and step participants. It does not infer or change actions, authority, recovery, timing, dependencies or AML selections. Supplied duplicates, invalid IDs and invalid mappings are still rejected. The canonical public recipe contract is unchanged.
- A completed, locally attributed response that fails the application contract gets at most one model correction with validator feedback. Both passes share the same deadline and remain inside one inference lane. Every original validation runs again. Authentication, routing, truncation and transport failures are never retried through this path. There is no relaxation of the contract, silent application of a proposal or external-model fallback.

## Reproducible verification

Mock-only regression checks:

```sh
npm run studio:test
npm run studio:typecheck
npm test
npm run lint
npx tsc --noEmit
npm run build
```

An opt-in synthetic test exercises the actual website proxy, local service and approved model. It sends no real customer data, submits no pack and sends no email. It prints only statuses, counts and timing, never generated text, cookies or signatures:

```sh
cd services/journey-studio
node --import tsx src/smoke-inference.ts --live-local --revision
```

Live verification is separate from configuration availability. The `/health` assistant flag means configuration is present, not that a GPU is currently ready. This shared, laptop-dependent service remains best effort. Existing reference pages work independently.

## Observed local evidence — 9 September 2026

The final synthetic smoke test passed through the actual `localhost:3001` website proxy and the restarted local Studio service. It used the supplied Planeon bearer identity and only the pinned model, not a fixture substituted for inference.

| Check | Observed result |
| --- | --- |
| Engine connectivity and authentication | Health/models returned 200; approved model present; deliberately incorrect dummy key returned 401. |
| Clarification | 200, 4.6 seconds; five questions and no premature recipe. |
| Confirmed design | 200, 43.1 seconds; six steps, four canonical evidence relationships, human-approval step, renderable walkthrough frames and signed snapshot. |
| Proposed revision | 200, 38.0 seconds; six steps, four relationships, nonempty change explanation and signed snapshot. |
| Automated regression | 178 website tests plus 29 local-service tests passed; delivery was mocked. Both TypeScript checks and lint passed. |
| Production build | Passed; the existing large-client-chunk warning remains. This is build evidence, not publication. |
| Credential isolation | No occurrence of the actual key in scanned repository/build files; private file mode 0600 and directory mode 0700. |

Earlier live candidates failed schema/graph validation, including object-valued change summaries and retry policies incorrectly encoded as self-repeating steps. They were not released. Explicit format/recovery instructions and regression coverage were added; the final complete run passed without relaxing those rules. Generated content remains nondeterministic: a structurally valid proposal still needs review of applicability, assumptions and business correctness. These timings are observations of one synthetic run, not performance promises or broad model-quality certification.

No customer brief, engineering-pack request or real email was used. Browser layout/accessibility was not re-audited for this backend-only change. The website's hosting identity, production deployment, DNS and existing consultation service remain untouched. The local supervisor is running in the foreground; no login daemon was installed.

Public activation still requires its separately approved secure bridge, engine-side logging/privacy verification, existing dependency-baseline review and publication approval. Engineering-pack email verification/delivery remains disabled pending the existing explicit email activation gates.
