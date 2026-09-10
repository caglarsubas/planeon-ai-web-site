# Business-first entrance — local review

Review date: 2026-09-08. Branch: `codex/planeon-business-entry`.
Source baseline: `c58eae7` (`codex/planeon-learning-evolution`).
Preview: http://localhost:3001/

## Implemented

- Five-section homepage: persistent business proposition before the existing film; illustrative workflow; diagnose/implement/improve; three expandable sample deliverables and compact architecture preview; direct enquiry. Introductory paragraph text is 351 words, excluding expanded samples and diagram labels.
- Four primary destinations: Services, Maturity, Resources, About. The distinct header CTA links directly to `/contact`, including at 320px.
- `/contact` reuses the extracted `ConsultationForm`. Required name, work email, organization, objective and consent remain explicit. The four enquiry categories use the existing payload contract. Optional timeframe defaults to the existing neutral `Exploring options` value.
- The only consultation API change is three additive service allowlist values. All previous values, origins, bot checks, validation, escaping, recipient/sender ownership and Resend delivery are unchanged. No live messages were sent during validation.
- Maturity opens with the five levels. The lazy-loaded Evidence Atlas opens on request or from existing feature, harness, domain, gate, matrix and evidence-fragment links. Browser history retains the selected level. Manual expansion moves keyboard focus to the named Atlas region.
- Resources groups the seven technical destinations. Services leads with outputs and an explicit scoped twelve-month target, responsibilities and first engagement. About explains roles, method and ownership without invented customer proof.
- Blueprint retains sixteen named harnesses, the operational comparison and release bundle. The original animated onion remains available in an optional disclosure. Journey retains the 43-node canonical exchange index as an optional technical reference.
- The Evolution change envelope is optional; its essential qualifications stay visible. The self-check and scoring remain unchanged; its illustrative calculator is optional. `/assessment#professional-assessment` still reaches the shared form.

## Automated validation

- `npm test`: 127 passed, 0 failed. Includes 16 identities and legacy routes; 57 feature families; 355 unique accountability/contributor relationships; all 72 variants; sequencing/motion; evidence links; new navigation/disclosure/content contracts; all six accepted consultation service values with mocked delivery.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed. Existing advisory remains for chunks over 500 kB; it is not a build failure. Vinext also reports its existing static-analysis route-classification limitation.
- 32 local page URLs returned HTTP 200, including every `/blueprint/1`–`/blueprint/16` route. `/transformation?level=L3` returns 308 to `/services?level=L3`.

## Browser checks completed

- Desktop 1280px, tablet 820px, mobile 390px and narrow mobile 320px. Reviewed the homepage, contact, Services, About, Resources, Maturity, Blueprint and assessment; no document-width overflow in the checked layouts. Dense matrix/sequence views retain their intentional internal scrolling.
- Mobile header contact action remains visible. The proposition and both homepage actions precede the film. Removed inherited mobile film top padding and corrected form-label/consent contrast.
- Sample deliverables open by pointer and keyboard. Immediate interaction after reload was retested using the installed Collapsible primitive. Explicit navigation IDs fix the observed server/client generated-ID mismatch. Fresh reload/navigation and dialog checks produced no new browser errors after these fixes.
- Navigation dialog opens, Escape closes it, and focus returns to its trigger. Manual Atlas expansion places focus on `evidence-atlas`.
- `/maturity?level=L3` leaves the Atlas closed; opening it, Back and Forward preserve L3. A5 and D7 deep links reveal the Atlas; the full matrix has 57 rows and 17 columns including the feature label. Invalid level/feature selections recover to L1/A5 without rewriting the requested URL.
- Evidence fragment positioning was corrected to clear the floating header. `/evolution#change-envelope` opens the six-field envelope; its qualification remains outside the disclosure.
- The legacy assessment enquiry anchor and reviewed A5 context work. Selecting one self-check answer updates progress to 1/16 and Phase 0. Opening the optional calculator and changing tasks from 500 to 1,000 changes the illustrative cost from $36 to $72 without changing readiness progress.
- Context is absent from the brief until explicitly added. An incomplete consultation attempt focuses the required name field, retains reviewed context and does not send a request. Consent remains unchecked by default.
- `/journey#step-16` selects frame 16 in the default human retail scenario, paused at 0.75×. Explorer retains Onion, Sequence, Flat waterfall, Tree waterfall and Layered flow; 16:9 and Fit controls update URL state. The sequence retains aligned participant columns.

## Remaining manual acceptance

- Actual 200% browser enlargement: NOT RUN. Native browser-app access timed out; the browser policy blocked its settings surface. No workaround or browser preference change was used. Narrow CSS viewport checks are not reported as a substitute for actual zoom.
- Live reduced-motion preference: NOT RUN in-browser. The existing film preference logic and reduced-motion source contracts passed automated tests; native preference/emulation behavior still needs a manual check.
- First-time-reader comprehension and stakeholder visual acceptance require user review of the local preview; no independent visitor study is claimed.

## Delivery boundary

Local source and preview only. No Sites version saving, publication, DNS, secrets, account ownership or analytics changes. Hosting identity and dependencies are preserved. No Git remote is configured, so no repository, PR or remote CI run was created. This document records source/build/browser evidence, not production deployment or mailbox receipt evidence.
