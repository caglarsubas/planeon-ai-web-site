# Journey Studio — proposal presentation and artifact access

Scope: local preview only. No production publication, live email, new account configuration, or inference-engine changes.

## Result

- The first validated, signed proposal renders immediately through `RecipeCanvas` / `JourneyStage`, the existing example onion renderer. It starts paused at 0.75×.
- Revisions offer a separate optional preview and comparison. The selected version is not replaced without explicit application. Background/selected playback is paused while another revision is being reviewed.
- Evidence follows the selected step's feature/harness references; a parallel sibling no longer contributes unrelated evidence to that selection.
- Output guidance and anchors lead to the existing verified engineering-pack request, then My requests in a new tab. PDF, Markdown and JSON remain gated by ownership, exact-version approval and retention.
- The bridge and service now default to loopback port 4320. Port 4318 was occupied by an existing OTLP collector; that collector was not modified. Non-JSON upstream errors now produce an actionable unavailable message.

## Verification

- Root tests: 178 passing, including content integrity and consultation regressions.
- Local service tests: 55 passing, including six presentation/access regressions and existing mocked verification, review, immutable-download, IDOR, stale-version, expiry and notification-failure tests. The document test checks PDF, Markdown and JSON consistency. No real email is sent by these tests.
- Root and service TypeScript checks, lint and production build pass. The build retains a large-chunk warning; this is not a runtime failure.
- Browser checks used the clearly labeled localhost-only synthetic fixture: immediate first-proposal onion, 16 named sectors, 0.75× paused controls, Play/Pause, manual next to an approval checkpoint, sequence loading and handoffs, explicit selection, file-access guidance and the real email-unavailable notice. The fixture's unsigned recipe cannot submit an engineering pack. These checks are not an end-to-end live inference or real-email acceptance claim.

## Current release blocker for new visitors

After the local port repair, `/api/studio/health` returned `available: true`, `assistant: true`, `email: false`, `laptopBacked: true`. This reports configuration/availability, not inference output quality. New mailbox verification/sign-in cannot complete while Studio mail is disabled. The UI explains the requirement and does not bypass it. Enabling verified no-cost mail and testing actual inbox delivery remain separate activation steps. Previously authenticated owners can download approved files while the service is online even if an approval notification fails.
