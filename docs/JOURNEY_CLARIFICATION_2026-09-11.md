# Journey clarification regression — 11 September 2026

## Current behavior: five-round clarification (supersedes the finite-round fix below)

The user rejected the finite question-set interaction. Every submitted set now reaches the dedicated approved self-hosted model. The initial question set counts as round one; genuinely new question sets advance to at most round five. Reviewing fifth-round answers is a final synthesis, not a sixth question set. A successful partial review that retains only existing unanswered questions stays in the same round. Failure or stale in-flight responses cannot advance it.

The complete matched ledger stays separate from the truncated chat window, with stable q1–q25 IDs and optional round labels. Earlier answers remain editable behind an expansion. The model can finish early after answered or explicitly deferred questions; at the cap, unanswered entries remain visible open decisions and rough planning assumptions are proposed. Application logic removes any sixth question set. Questions are not proof of completeness, and model-declared readiness means ready for a draft only.

Exact repeated question sets receive one bounded model correction rather than being accepted as readiness. Prompt instructions prohibit paraphrasing answered/deferred decisions, but this is not a guarantee of semantic duplicate detection. The five-round cap is deterministic. New permissions and regulatory scope cannot be filled in by the model; recognisable new legal/consent/authority assumptions are converted to explicit owner-confirmation questions. This defensive check is not a legal assessment or a complete semantic classifier.

The proposed brief requires explicit application and confirmation before recipe generation. Editing any answer invalidates stale proposed brief text as well as the pending recipe. A failed assistant review does not display a received acknowledgement. Public drafting remains tab-local; no new storage, inference identity, mail configuration, website publication or infrastructure changes were introduced.

Validation for this update:

- 178 website tests and 49 Studio tests passed, including mocked five-round inference, cap enforcement against a disobedient model, partial answers, deferrals, failed review/retry, exact-repeat repair, legacy signed-brief compatibility, 25 retained pairs, qualification and document propagation, and existing private-download/email security regressions.
- Website and Studio TypeScript, lint and production build passed. Existing large-chunk and route-classification warnings remain.
- Live local website API plus the approved inference model: a synthetic notebook-preference request returned five questions; matched answers yielded early draft readiness with all five pairs retained. A subsequent real review confirmed the permission/regulation field guard. An initial live request timed out, then a retry succeeded; availability is still best effort.
- Additional final-round boundary testing used an explicitly seeded five-round ledger: the live website API returned HTTP 200, round=5, status=limit, no questions, a proposed brief with assumptions, all matched pairs, and owner-confirmation unknowns. This is not evidence that five complete conversational rounds were performed live.
- Route render returned HTTP 200. No new browser interaction, mobile, zoom or theme screenshots were taken for this update; controls were checked by server-rendered component tests.
- The repository currently has zero configured GitHub Actions workflows and no protected-main required checks. Local test success is not reported as CI success.

The sections below preserve the historical reasoning and evidence for the earlier approach; their fixed-round contract is no longer current.

## Reported failure

The screenshots show that earlier answers about notebook-wide preferences, storage contents, session overrides and fallback behavior are repeatedly asked in new wording. A single unstructured answer box provided no explicit question–answer binding. The reply also embedded a list of questions that was rendered again from the structured question list. Prompt-only convergence instructions in the previous implementation were insufficient.

## Changed behavior

- One field per original question; stable IDs and visible numbering.
- Answer / assumption / not decided yet classifications, with editable answers and progress.
- A fixed, bounded question round. Reviewing answers never invokes another model clarification turn. Partial responses keep only the original outstanding questions; deferral is not treated as permission to ask again.
- Question–answer pairs travel in the confirmed brief, independently of the rolling history. Changing an answer invalidates confirmation and the pending design.
- A model cannot overwrite or invent these visitor-owned records in a proposed brief. Assumptions and open items remain qualified in recipes and pack documents.
- Clarification prose no longer repeats the question list. The UI links back to the original question fields from confirmation.

This deliberately replaces the automatic multi-turn clarification loop with a finite round. It does not implement semantic paraphrase detection or claim that five questions establish a complete solution. Visitors can record further gaps under Missing information, and generated recipes still require review.

## Evidence

- Regression fixture reproduces the notebook-preference answers from the screenshots, while explicitly deferring the genuinely unspecified fallback trigger.
- Tests exercise partial submissions, answer edits, repeat review clicks, deferral, empty chat history, ID uniqueness, answer limits, old brief compatibility, model-overwrite prevention, and labelled rendered controls.
- Mocked engine tests prove that answer-review iterations make no new model call and that recipe generation receives the full matched ledger.
- One opt-in check used the configured approved local model with a synthetic notebook-preference workflow: five initial questions, three subsequent review passes, zero repeated questions, and exactly one inference call. All five live-check answers were explicitly deferred, not fabricated. No email was sent. This checks the actual engine adapter plus deterministic completion, not a fresh browser or model-quality acceptance run.
- The document regression renders PDF/Markdown/JSON with answered, assumed and deferred question pairs; the same brief and manifest hashes are retained.
- The running website proxy accepted a matched-answer review with HTTP 200, no repeated questions and no signed recipe, confirming that review does not bypass the separate design/approval steps.
- Passed: website suite 178/178; Studio suite 42/42; root and service TypeScript; lint; production build. The build retains its existing large-chunk and static route-classification warnings.
- GitHub has no configured Actions workflows and `main` is unprotected at this check. Local validation is not hosted CI evidence; the PR's exact-head checks are inspected separately before merging. No workflow or runner was provisioned.

## Scope and remaining limitations

No production deployment, real email, DNS, account ownership, private configuration or inference model change. Existing content and consultation remain untouched. No new browser/device acceptance is claimed for this patch; the component receives server-rendered label/control checks and retains the existing responsive/theme styles. The live check deliberately does not establish whether a model-generated recipe is semantically correct. Existing engineering-pack approval remains mandatory.

## Follow-up: discoverable Send action

The visitor subsequently could not find a send button. The original `Review my answers` label below five lengthy fields did not match the expected interaction, and that action did not transmit answers.

The follow-up adds `Send answers` at both ends of the questions, with a sticky upper action bar on normal-height viewports. Partial sets can be sent after one answer or explicit deferral. The button now calls the existing website assistant endpoint; the service's finite-round response is still deterministic and cannot introduce another paraphrased question set. No new endpoint, storage or model call is introduced.

Receipt is tied to the exact normalized brief and is shown only after HTTP success. Changed answers reopen sending, duplicate unchanged sends are disabled, sending/errors are displayed next to the action, and receipt failure never clears fields. Complete received sets expose `Continue to brief`; confirmation remains a separate explicit action. This is receipt, not independent validation of the answer contents.

Follow-up validation: 44/44 Studio tests including partial/updated/received/error action states and rendered controls. Through the running website proxy, a synthetic partial set returned HTTP 200 with one original pending question; the updated complete set returned HTTP 200 with none. Neither generated a recipe. Browser/device interaction acceptance has not been rerun; the short-viewport CSS fallback keeps both actions in normal flow to avoid obscuring form fields. Production and email remain unchanged.
