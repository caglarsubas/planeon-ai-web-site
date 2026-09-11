# Journey Studio end-to-end review — 11 September 2026

## Scope and evidence boundaries

Tested the supplied banking campaign workflow using the real, pinned `ministral-3:8b` inference engine: campaign PDFs in object storage, daily updates, an existing AI assistant on OpenShift, read-only access, and three transient retries. Answers absent from the screenshot were explicitly simulated, not asserted as bank facts.

The browser drove the actual website and same-origin proxy. A separate loopback-only service used real Better Auth, SQLite, the job worker and document generator, with an injected synthetic mailbox. Neither verification nor approval was bypassed. Reviewer identity was simulated in an isolated database; this is not Caglar's approval of a real engagement. No real email, production publication, DNS, account-ownership or billing change occurred. Existing Sites identity and deployed version 13 were read-only verified.

Public model turns were recorded only by the explicitly invoked test harness, outside Git, to support this QA exercise. The ordinary service still does not retain public conversations. No credentials, codes, signatures or real customer documents belong in this report or repository.

## Reproduced defects and fixes

| Finding                                                                                                   | Severity | Change and validation                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Multiple applied revisions left old canvases on the page; canvas and pack form had identical sibling keys | P1       | Distinct revision-scoped keys; source regression and repeated-application browser check                                                                                                    |
| Clarification questions were absent from the history sent on later turns                                  | P1       | Preserve questions with each assistant reply; expose bounded conversation history                                                                                                          |
| Applying a suggested brief removed the questions and answer controls                                      | P1       | Retain the response while consuming only its brief suggestion                                                                                                                              |
| Model could relabel simulated choices as facts and silently omit confirmed caveats                        | P1       | Visitor-authored facts are preserved; additional model claims remain assumptions. Confirmed assumptions and unknowns are merged into recipes, with overflow rejected rather than truncated |
| Proposed assumptions, open questions and tests were not visible before applying a design                  | P1       | Visible qualifications, expandable tests and full step inputs/authorization/recovery before application                                                                                    |
| A reviewer's session could be revoked during asynchronous file reads, yet approval still succeed          | P1       | Reauthenticate after file integrity reads and before transactional decision; deterministic revocation-race regression                                                                      |
| Revision comparison omitted title, harness membership, open questions and acceptance-test changes         | P2       | Include all material recipe fields; comparison regression                                                                                                                                  |
| Review version 2 could display the version-1 title                                                        | P2       | Title comes from the exact displayed review/approved snapshot                                                                                                                              |
| Reference/privacy links could discard an in-memory draft                                                  | P2       | Relevant links open labeled new tabs; page still clearly warns that reload discards public drafts                                                                                          |
| Empty error states offered no next action                                                                 | P2       | Failed/rejected preparation states explain the limit and provide a contact route without exposing internal notes                                                                           |
| A 7-step pack consumed 20 pages, often one short section per page                                         | P2       | Flowing sections, intact short paragraphs, bookmarks, consistent left alignment and printable arrows; retain catalog versus proposed-behavior qualifications                               |
| Busy/success feedback and download names were unclear                                                     | P2       | Live status, specific revision-progress label, and purpose-led PDF/Markdown/JSON labels                                                                                                    |

Critique used the existing Sites and Impeccable design context, an independent UX/source review and a separate security review. It preserved branding and technical content rather than redesigning the website.

## First complete browser journey

1. Entered the screenshot's workflow and constraints.
2. Answered two rounds of clarification using explicit test assumptions, then confirmed the editable brief.
3. Generated a proposal, inspected it and made two what-if revisions. Each required explicit application.
4. Verified a synthetic company mailbox through the real one-time-code UI. Submitted the mandatory name, company, role, intended use, confirmed brief and consent.
5. Confirmed the customer saw preparation/review status but no unapproved downloads.
6. Signed in as the isolated test reviewer and downloaded all three prepared files through the website.
7. Requested a revision rather than approving: authentication had been invented as an existing requirement; the no-eligibility test was missing; logging was incorrectly called compensation.
8. The worker prepared version 2. Reviewed its actual fields and files, then explicitly approved that exact version for synthetic test delivery.
9. Signed back in as the customer and downloaded PDF, Markdown and JSON through **My requests**. Every SHA-256 matched the reviewed version; internal notes were absent.
10. The synthetic delivery adapter captured three attachments. This proves the attachment path, not Resend acceptance or actual inbox receipt.

The recorded first full sequence comprises three clarification turns, one initial design, two visitor revisions and one reviewer revision. A structural correction was needed during the reviewer revision; the bounded repair stayed on the same approved model.

### Answers actually supplied

The simulated visitor answered the assistant rather than leaving the flow at clarification: semantic ranking plus product/service tags; a separate authorized daily text-PDF indexing pipeline; scanned documents excluded pending OCR; citations identifying source/version/update date; only still-effective approved versions; abstention on version conflicts; no response cache initially; no customer profiles, eligibility checks/promises or enrollment; operational metadata-only logging; three eligible transient retries followed by unavailable, distinct from a valid no-match. Jurisdiction, authentication policy, retention, API contracts, quality/latency targets and pipeline ownership remained open. Incorrect proposed assumptions were removed in the editable brief before confirmation.

## Post-fix browser checks

The next conversation stopped asking clarification questions when given final decisions. Its proposed brief still introduced unsupported claims. A subsequent live turn verified the new guard: generated additions were assumptions, not supplied facts; the visitor then corrected the bad assumptions explicitly. Design/revision qualification arrays retained the confirmed caveats even when the model returned empty arrays.

A broad architecture revision failed strict reference validation after the bounded repair, leaving the old canvas unchanged. One narrower retry produced a valid revision. Applying it left exactly **one canvas and one pack form**, reset to paused 0.75×. No duplicate-key console errors recurred in the clean post-fix run. Sequence selection, onion, tree and flat view controls used the same draft; the inspected sequence columns aligned and scrolled within their own region. Light/dark interfaces were exercised.

A second pack was prepared by the updated generator and all three files downloaded through the authenticated **reviewer** website. Its PDF had **10 pages**, compared with the first run's 20-page pack. All pages were rendered for visual review; headings, body text, diagram nodes and footers were readable without overlapping or clipped content. Markdown and JSON retained the same brief/recipe; downloaded hashes matched the prepared manifests. These are different proposals, not a controlled same-content page-count benchmark.

This second recipe was **rejected**, not released: it still assigned validation to Observability, omitted the illustrated offline pipeline, and needed stronger endpoint/evidence relevance. Its title's word “reviewed” was model-generated, not proof of approval; server request status remained authoritative. This is deliberately retained as a failed quality case rather than portrayed as a successful engineering solution.

### Artifact assessment

| Criterion              | First draft                                     | After targeted review / layout changes                                                                      |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Catalog/graph validity | Passed structure, insufficient semantic quality | Still enforced; invalid revision rejected                                                                   |
| Constraint fidelity    | Invented authentication and dropped caveats     | Guard preserves caveats; actual authentication text corrected; semantic contradictions still require review |
| Architecture ownership | Incorrect in several steps                      | Corrected in first reviewed pack; second pack regressed and was rejected                                    |
| Recovery clarity       | No-match/failure and restore/refresh conflated  | First reviewed pack distinguishes them; targeted later correction improved failure text                     |
| PDF usability          | 20 pages with extensive unused space            | 10-page flowing document with bookmarks; Markdown offers an accessible editable alternative                 |
| Delivery custody       | Not tested by generation alone                  | Verified owner/reviewer gating and SHA-256 equality of website downloads                                    |

Verdict: the application now supports a more reliable **human-reviewed drafting workflow**. The current small-model output is **not consistently engineering-ready**, and no automatic approval or deployment should be added on this evidence.

## Automated validation

- Existing website: 178 tests passed, preserving all 16 harnesses, 57 AML families, 355 relationships and 72 scenario variants, plus mocked consultation tests.
- Journey Studio: 36 tests passed, including new qualification, question-history, sibling-key, compact-PDF, revision-diff and reviewer-revocation regressions.
- Root lint, root TypeScript, service TypeScript and production build passed. Existing large-reference-chunk and route-classification build warnings remain.
- Existing negative-path tests cover OTP failure/replay, mandatory profile fields, wrong owner, revoked sessions, stale/duplicate approvals, tampered/expired files, attachment rejection/fallback, failed notifications and restart recovery.
- Browser viewport override did not change the actual 819 px CSS viewport in this control surface; do not claim a 390 px mobile or 200% native zoom pass. No document-level horizontal overflow at the observed viewport. Reduced-motion safeguards remain covered by existing tests, not a new native emulation check.
- GitHub Actions status must be reported separately from these local results; no workflow is configured in the source checkout.

## Artifact criticism

The original design was structurally valid but not ready for engineering handoff: it treated Gateway as general customer ingress, used Observability for content validation, omitted explicit delivery to the customer, conflated no-match with service failure and confused daily refresh with rollback. Exact review notes corrected the tested version. This demonstrates why catalog/graph validation is necessary but not sufficient.

Later clarification also invented regulatory assumptions and misread a negation. The new deterministic qualification guard prevents promotion to supplied facts; it does **not** prove the semantic correctness of every assumption or step. The visitor/reviewer must still reject unsupported claims. No alternative model or provider was silently substituted.

The accepted synthetic recipe is a discussion draft: source metadata authority, quality/latency thresholds, retention, jurisdiction, access policy, OCR approval and pipeline ownership need bank confirmation. Example acceptance tests are proposals, not executed bank controls. Canonical harness descriptions remain a reference catalog, not a claim that every listed capability is implemented.

## Reproducible local browser harness

Keep ordinary production configuration untouched. In the website checkout, with the existing approved private inference profile configured:

```sh
services/journey-studio/node_modules/.bin/tsx services/journey-studio/tests/browser-server.ts --local-e2e
```

Then start a local preview against it:

```sh
STUDIO_SERVICE_URL=http://127.0.0.1:4319 npm run dev -- --port 3001
```

The harness creates a new private temporary database and file directory for each invocation. It accepts only synthetic `@studio-test.example` recipients and the simulated initial reviewer. Its loopback-only `/__test-inbox` exposes codes for that disposable database; it is not an app route and must never be deployed. Existing inference credentials are read in memory, not copied into the test directory. After testing, stop the harness and restart the preview without `STUDIO_SERVICE_URL` to restore the ordinary local service on port 4318.

## Release qualifications

Real customer OTP/inbox arrival, Resend free-budget reservation, public authenticated transport, native zoom/reduced-motion and physical touch-device testing remain distinct release checks. Approved downloads must not be described as live-publicly available merely because the isolated local test passed. Existing canonical content and the consultation service remain intact.
