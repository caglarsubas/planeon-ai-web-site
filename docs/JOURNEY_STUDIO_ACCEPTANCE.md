# Journey Studio local acceptance — 9 September 2026

Scope: the existing website checkout on `codex/planeon-journey-studio`, based on `bcda5f4`. No public activation or real delivery was performed. All test identities and generated documents are synthetic.

| Check | Evidence / result |
| --- | --- |
| Existing site tests | 178 passed, including 16 harnesses, 57 AML families, 355 mappings, all 72 scenarios, old anchors, motion/theme and mocked consultation regression |
| Local service tests | 12 passed; real Better Auth OTP flow with an in-memory mocked mailbox, versioned review, IDOR/replay/stale approval, immutable files, email fallback/failure, restart/revocation/expiry, deletion, tamper and budget/session limits |
| Static validation | Root lint, root TypeScript and service TypeScript passed |
| Production compilation | Vinext build passed; existing large-reference-chunk and route-classification warnings remain |
| Backend dependency audit | Local service `npm audit --omit=dev`: zero advisories |
| Website baseline audit | Existing root production tree reports six advisory-bearing packages (five high, one low). Full dependency tree previously reported eleven. Not silently upgraded; release gate in runbook |
| Isolation | No changes to Sites identity, DNS, consultation handler, model accounts or canonical source data. No private secret values, local database code, inference credentials or synthetic QA fixture detected in production output |
| Public service state | Local health is available; inference and email report false until configured. UI preserves the typed draft after an unavailable-assistant response |
| PDF inspection | All 15 pages of the synthetic pack rendered and visually inspected; logo, font embedding, arrows, labels, evidence, page breaks and footers readable. JSON/Markdown references and exact attachment/download byte hashes tested |
| Browser, actual pages | Journey entrances and retained draft, one primary heading, public example access, private sign-in gate and honest offline state verified |
| Browser, real diagram components with a synthetic fixture | Paused 0.75× default, named onion, sequence, tree waterfall, selected approval, mobile step selection and both themes inspected. Sequence-row padding corrected to align arrows with headers |
| Responsive / keyboard | 390 px, 820 px and 1440 px inspected; no document-level horizontal overflow. Keyboard Tab reaches labeled controls. 720 px reflow checked as the CSS-viewport equivalent of a 1440 px window at 200% zoom |
| Remaining browser qualification | Native browser 200% zoom and OS/browser reduced-motion emulation were not exposed by the current browser-control surface. Reduced-motion rendering/clock safeguards were source-reviewed with existing motion tests; complete those two native checks before public activation. Touch-equivalent layout/control inspection is not a physical-device qualification |
| Live external qualification | NOT RUN: real inference/model routing, real OTP/inbox receipt, public HTTPS bridge/cookies, Cloudflare publication, hosted CI |

The preview is ready for local review. This evidence does not establish production readiness, email receipt, regulatory compliance or the quality of a real generated solution. Follow `JOURNEY_STUDIO.md` for the separately authorized activation gates.
