# Playground: animated workflows with AML reference mapping

## Scope and source

Added `/playground` as a native page using the existing ScenarioWorkbench,
JourneyStage and synchronized journey clock. No standalone HTML is embedded or
executed. Resources and the expanded navigation expose Playground; Journey and
Explorer link into it with the current scenario and occurrence retained.

Interaction reference: the user-supplied `harness_onion_animated.html`, SHA-256
`b06d301e4021b38c2e7eab517044d0ceb656c0045ff69dab004e551faedfe01f`.
Its 72 scenario IDs exactly match the existing site scenario module. The page
uses that module and the established semantic harness/AML registry rather than
maintaining another content copy.

## Experience

- Nine industries, 36 paired use cases and 72 human/agent-initiated variants;
  selecting an industry opens a matching scenario and preserves initiator type.
- Existing named onion, curved handoffs, moving packets, parallel paths, repeat
  passes and trails. The model core remains stationary. Reduced-motion handling
  and the one-clock pause/resume behavior are reused unchanged.
- Paused at 0.75× by default; Previous/Next, Play/Pause, Reset, speed controls,
  chapters and optional presentation modes remain available.
- The information panel follows the receiving harness, with source/parallel
  participants also selectable. Selecting a named slice, participant or feature
  pauses playback. Play clears held inspection and resumes following.
- Existing primary accountability, contribution roles/conditions, applicability,
  obligations and expected evidence are readable alongside the animation.
  Detailed responsibility conditions expand on request. Atlas links preserve
  the scenario, occurrence, harness and feature.
- Full mapping access retains 16 harnesses, 57 families and 355 relationships.
  Curated reading suggestions use an existing related feature only. These do
  not add scenario-control claims, assessment outcomes or maturity scores.
- Omitted and untaken paths are labeled explicitly. A parallel frame can contain
  an omitted exchange and a live sibling; the panel does not discard the sibling
  or claim an action on the omitted path. Continuous monitoring and offline work
  retain their distinct clocks and explicit continuation behavior.
- The established brand palette and editorial type are retained. The mapping
  panel stacks below the visual at narrow widths; essential caveats never rely
  on hover. Impeccable and Animate guided the restrained presentation and reuse
  of purposeful motion instead of adding another animation system.

## Verification — 2026-09-09

- `npm test`: **139 passed**, including 12 new Playground tests and the existing
  consultation regression suite with mocked delivery. The mocked failure case
  intentionally emits a delivery-failure log; no email is sent.
- New tests examine every occurrence in all 72 variants, receiver selection,
  model-core boundaries, unique responsibility relationships, curated references,
  omitted/untaken work, parallel siblings, repeated passes, separate clocks,
  invalid inspection selections and context-preserving Atlas URLs.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` and `git diff --check`: pass.
  The existing advisory about large reference chunks remains. The new mapping
  panel is lazy-loaded; no package or dependency changes were introduced.
- Local HTTP smoke checks return 200 for Playground, a parameterized Playground
  URL, Journey, Explorer, Resources, a Maturity feature URL, Contact and Assessment.
  This confirms route availability, not client-side interaction or visual QA.
- Browser interaction, keyboard/touch, responsive screenshots, actual 200% zoom
  and OS reduced-motion acceptance were **not run in this turn**. Automated
  motion/data/source checks are not represented as those manual checks.

## Delivery boundary

Local preview: `http://localhost:3001/playground`.
Branch: `codex/planeon-playground`, based on `7718898`.

No production publication, Sites identity, DNS, secrets, email/API behavior,
account ownership, media assets, reference data or analytics changes. There is
no configured Git remote, so pushing, opening a PR and monitoring remote CI
require a supplied existing destination. No repository was created implicitly.
