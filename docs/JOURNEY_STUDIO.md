# Journey Studio — local implementation and release runbook

Status: local preview implementation, 9 September 2026. No production publication, real email, DNS/tunnel change, cloud provisioning or inference-account mutation is included. Development base: `bcda5f4`; branch: `codex/planeon-journey-studio`. Existing deployed version recorded during planning: Sites version 13 (not freshly reverified by this implementation).

## What changed

Journey has two entrances: **Explore an example** preserves the curated engine; **Design my journey** adds a public text-only assistant workspace. The visitor edits and confirms facts, assumptions and missing information. New designs and revisions are proposed separately and require **Apply** before replacing the diagram. Editing a brief during generation discards the stale response. Public drafts live in React memory, not a database or local storage.

The same onion, sequence, flat waterfall and tree waterfall display custom recipes, initially paused at 0.75×. Custom occurrences have `draft:` IDs; they never enter the canonical 43-exchange engine. Existing scenarios, resources, numeric harness routes and assessment scoring are unchanged. Harness/AML pages and reference search offer contextual Journey links.

Private accounts and review interfaces live at `/journey/requests` and `/journey/review`. They use the existing website shell, not a separate public product. `/playground` remains the compatibility redirect. The existing `/api/consultation` handler is unchanged.

Shape guided the already-approved business-first brief and explicit review steps; Impeccable guided the shared typography, semantic colors, spacing and progressive disclosure. This is not a visual rebrand.

## Local preview

Run from the existing website checkout using Node 24.16 or newer:

```sh
npm ci
npm --prefix services/journey-studio ci
npm run studio:dev
```

In another terminal:

```sh
npm run dev -- --port 3001
```

Open `http://localhost:3001/journey?mode=design`. The service listens **only on 127.0.0.1:4318**. Its foreground supervisor retries crashes with exponential backoff, stops after five repeated failures, and installs no daemon. Keep that terminal running; quitting it stops the feature. SIGTERM/SIGINT drain HTTP and current worker work. Hard interruption leaves SQLite checkpoints for restart recovery. Sleep/disconnect means genuine unavailability, not a cloud fallback.

Without explicit engine/mail configuration, public references and brief editing work, but generation, verification and email correctly report unavailable. The local service health reports configuration availability, not a successful model invocation or inbox delivery. The subsequent [inference integration](JOURNEY_STUDIO_INFERENCE.md) connects the supplied Planeon model-plane identity locally; mail and public activation remain separate.

Default private directory: `~/Library/Application Support/Planeon/JourneyStudio`. Directories use 0700; SQLite, documents and generated secrets use 0600. Secret files are created locally on first start; their values are not logged or copied into this repository. The dev-only bridge reads the transport secret privately at startup. If the website started first, restart it after the service's first start. Custom storage requires explicit matching bridge configuration.

The repository includes a synthetic **development-only** rendering surface at `/__studio-visual-qa`. It exercises the real recipe components without impersonating the assistant, creating an account or bypassing production verification. Its fixture is not an application route or production entrypoint.

## Four implementation increments

1. Shared `SolutionRecipe` contract, two entrances, editable/confirmed brief, canvas, contextual links and reference search.
2. Dedicated local inference adapter, one-job lane, bounded queue, catalog/graph validation, signed proposal snapshot and explicit revision comparison.
3. Better Auth email-code accounts, local SQLite, mandatory profiles, versioned PDF/Markdown/JSON preparation, sole-reviewer decisions and owner-only downloads.
4. Durable email outbox, reviewed-byte attachments/notification fallback, budget gates, restart recovery, deletion/expiry and mocked security/visual validation.

## Trust and ownership boundaries

```text
Public browser -> same-origin /api/studio/* proxy -> local Node service
                                                    |-- approved self-hosted inference
                                                    |-- SQLite / private pack files
                                                    |-- existing Planeon Resend delivery
```

Only narrowly allowlisted routes and necessary Studio cookies cross the proxy. Browser-supplied recipients, URLs, arbitrary headers, engine credentials and model tool calls are not accepted. The authenticated bridge forwards a keyed pseudonymous client identifier for limits, not raw addresses into application logs. POST/DELETE require the exact origin; cross-site requests are rejected. The transport secret authenticates the server-to-server hop. It is not a substitute for customer/reviewer sessions.

All model output is untrusted. Strict Zod schemas enforce the version, canonical harness/AML IDs and field bounds; semantic validation checks known mappings, unique relationships, dependencies, parallel joins, repeats and separate clocks. Public turns do not create request/account records. Proposed relevance is not applicability proof or a passed control. The model has no execution tools, approval authority, recipient-selection mechanism or direct email capability.

An authenticated company mailbox is required for packs, but the public assistant remains ungated. A maintained denylist blocks known personal/disposable domains and subdomains; it is not a comprehensive domain-reputation service. Legitimate exceptions go through `/contact`; there is no bypass switch in the visitor interface. Company and role are explicitly self-reported.

Better Auth stores hashed six-digit codes, five-minute expiry, three attempts, rotating resends, and single-use sign-in. Sessions expire in twelve hours and use HttpOnly, SameSite=Lax cookies scoped to `/api/studio`; production adds Secure. Cookie caching is disabled so revocation is checked server-side. Necessary anonymous draft-session cookies bound assistant use without retaining conversations. The service limits clients, anonymous sessions/accounts, verification mailboxes and submissions; one inference job runs at once with four bounded waiting slots. An aggregate client limit prevents anonymous-cookie rotation from providing unlimited calls.

## Request, review and delivery state

```text
Verified submission -> preparing -> review -> approved -> private downloads
                                      |          |------> delivery outbox
                                      |-- revise -> preparing a NEW version
                                      |-- reject -> no customer files
```

Submission records the consent/profile and HMAC-verified confirmed snapshot, with an idempotency key. The worker prepares PDF, Markdown and JSON **before approval**. Their manifest pins byte lengths and SHA-256 digests. Private preparation may retry; once committed as prepared, that version is never regenerated. A new revision increments the version and requires new review.

Only `caglar.subasi@planeon.ai`, signed in through verified email, can review. Email always includes a protected review link and adds the prepared attachments when suitable. GET/opening the link never approves. The review form requires an explicit decision, confirmation, exact current version and snapshot hash. Approval first rechecks all three files against their manifest and then compare-and-swaps the current state transactionally. Duplicate/stale decisions fail. Reviewer notes are excluded from customer APIs and artifacts; instructions for revisions are private inputs to a newly reviewable proposal.

Delivery reads the same reviewed bytes, checks hashes again, and takes the recipient from the verified request owner—not generated content. Attachments exceeding the configured budget, or a definitive attachment rejection, switch to an availability notification. Timeouts/ambiguous provider outcomes retry with a stable idempotency key only inside a conservative 23-hour window; older uncertain outcomes require inspection and are not blindly resent. `accepted` means provider acceptance, not observed inbox delivery.

Email failure after approval does not change approval, regenerate files, or disable account downloads. Every download checks the session, owner/reviewer scope, exact approved/current review version, expiry and file integrity. Sessions and state are rechecked after file I/O. Files are streamed through authenticated routes, never public assets, static links, Resources or object-storage URLs. Forwarded links do not grant access.

## Retention and recovery

Requests, versions, files, internal reviews and delivery records expire **90 days after submission**. My requests supports earlier confirmed deletion. Cleanup runs on local worker ticks; while the laptop is off, physical deletion waits until it resumes, but expiry checks deny downloads immediately on return. Accounts without active requests expire after 90 inactive days. Codes, expired sessions and technical counters are cleaned up too. Deletion cannot erase copies already delivered by email.

SQLite uses WAL and transactional state changes. Startup requeues interrupted jobs and safely reconciles uncertain email work. Revision snapshots are checkpointed before document rendering. A second service instance is blocked by a local process lock. There is no automatic OS login launch, cloud-synced backup or remote storage. Keep the host encrypted, patched and access-controlled; filesystem permissions do not protect against a compromised host administrator. Backups, if later approved, must honor deletion/retention and remain private.

## Separate live activation gates

1. **Inference identity — local integration:** the supplied bearer key resolves tenant `planeon-ai-web-site` and organization `org-planeon-website` at the engine. No tenant header or body field is sent. The client pins `ministral-3:8b` and requires engine-reported `local-inference` provenance with no fallback on every response envelope. The key itself is not restricted to that model: engine-side model scoping remains preferable, and operator verification of prompt/body logging remains a public-release prerequisite. No key or model on another tenant is substituted. See the integration evidence for checks actually run.
2. **Private configuration:** import the operator document using `npm --prefix services/journey-studio run configure:inference -- /absolute/path/to/connection-document.md`. Only the approved inference fields are stored in `inference.private.json`, mode 0600, in the private data directory. Normal service starts read it automatically. Importing a rotated document atomically replaces this inference-only profile; restart to apply it. Auth, transport and mail configuration are unchanged. `services/journey-studio/.env.example` is a field reference, not a file to source with blank values. Explicit process environment overrides the profile, including empty strings for intentional disablement. Never put values in `VITE_*` variables or client bundles.
3. **No-cost email reservation:** verify the existing Planeon Resend team's actual free allowance, all other sender usage, domain ownership and no-overage policy. Reserve a portion exclusively for Studio so consultation traffic remains unaffected. Set both enable/verified flags, a send-only Planeon key, the current UTC budget day, and conservative remaining daily/monthly allocations. Daily attestation deliberately expires at midnight UTC; renew only after verifying the shared allowance. Counts are reserved transactionally before each attempt, including failed attempts. The local ledger cannot observe other projects' sends; configuration alone does not prove the account remains free. Keep mail disabled if an exclusive reservation cannot be established. No paid fallback exists.
4. **Authorized real email test:** separately verify initial OTP arrival, sign-in, review attachments/link, exact-version approval, approved download and customer notification. Provider acceptance is not recipient/inbox confirmation. Verify failure cases without sending to arbitrary third parties. No real emails were sent in local validation.
5. **Public transport:** the committed proxy is inert without its server-only endpoint/secret. A laptop loopback service is intentionally not reachable from public Cloudflare. An authenticated HTTPS bridge, its routing, access policy and secrets need a separate approved activation. No tunnel, DNS, Cloudflare binding or existing account configuration was changed. Keep the local service loopback-only behind that bridge; do not expose port 4318 directly. Confirm production-origin cookies and headers end-to-end.
6. **Baseline dependency advisories:** the new local service's production dependency audit is clean at validation. The existing website dependency baseline still has npm advisories, including React RSC, Vinext/image-size and Vite/Undici dependencies. Treat this as a public activation gate; upgrade and regression-test the existing stack in a separate review rather than force-mutating hosting dependencies here. No exploitability or production runtime qualification is implied by npm counts.
7. **Publish review:** confirm the intended existing Sites identity and freshly record the deployed rollback version before any approved publication. No remote is configured in this checkout; PR publication and GitHub CI require a supplied destination. Do not create a repository implicitly.

## Validation commands and evidence

```sh
npm test
npm run studio:test
npm run studio:typecheck
npm run lint
npx tsc --noEmit
npm run build
npm --prefix services/journey-studio audit --omit=dev
```

Tests exercise the real Better Auth code flow with mocked delivery, mandatory inputs, OTP replay, ownership, stale/duplicate approvals, revision isolation, SHA-256 integrity, exact emailed/downloaded bytes, rejection, deletion, expiry, sign-out, restart checkpoints, unavailable email, reserved budgets, public-session limits, strict graph validation and separate clocks. They send no real emails and invoke no live model.

The synthetic fixture verifies PDF/Markdown/JSON agreement and generates a clearly synthetic PDF outside Git for rendering inspection. Browser acceptance uses real site components: Journey entrance/context links, offline response, paused controls, sequence alignment, theme/responsive rendering and private sign-in UI. This is local acceptance, not live inference, provider delivery, authenticated public-bridge or production qualification.
