# Learning & Evolution — local review

Date: 2026-09-08  
Branch: `codex/planeon-learning-evolution`  
Local starting revision: `de30372`  
Preview: http://localhost:3001/evolution

## Intent

Make the practical purpose of the neuroplasticity-derived material clear before
introducing release mechanics: experience can inform improvements to retrieval,
memory and tools without automatically retraining the model or expanding its
authority.

Clarify guided the example-first language and visible boundaries. Impeccable
guided the restrained comparison, semantic colors and responsive learning flow.
Existing Sites identity and preview/deployment boundaries are preserved.

## Changes

- Rename navigation, footer and page metadata to Learning & Evolution without
  changing the existing route. Align the homepage's contextual link.
- Lead with three selectable before/intended-after examples. Outcomes are
  explicitly illustrative and conditional, not measured improvements.
- Add observation to the existing five release stages. Each of the six stages
  explains the selected example, not just the generic process.
- Keep independent Evaluation, Governance authorization and Security constraints
  explicit. Preserve rejection, canary withdrawal, recovery and all six fields
  of the existing change envelopes.
- Link the neuroplasticity metaphor directly to the existing research section.
  Do not claim biological equivalence, deployed self-improvement or automatic
  regulatory compliance.
- Keep the canonical change data, harness registry, AML requirements, release
  artifact links and consultation API unchanged.
- Preserve old change/stage query parameters and the change-envelope anchor.
  Invalid selections fall back safely; browser Back/Forward restores selections.
- Stack the diagram and comparisons on narrow screens, provide a direct jump
  to the selected step/recovery explanation, and allow the longer menu name to
  wrap. No new automatic animation or selection changes.

## Verification

- `npm test`: **122 passed**, including 8 new Evolution tests. Existing
  16-harness / 57-family / 355-relationship / 72-scenario integrity and mocked
  consultation regression tests passed.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed. Existing large-chunk advisory remains; this is not
  a production deployment or a claim of a new performance benchmark.
- `git diff --check`: passed.
- Browser review at 1440, 1100, 980, 768, 390 and 320 CSS-pixel widths.
  Checked example changes, target colors/legacy harness links, Enter activation,
  selected-detail jump, menu wrapping and Escape dismissal, recovery paths,
  Back/Forward, legacy deep links, invalid query fallback and research navigation.
- Scoped DOM checks found no horizontal text/control overflow at 320 or 768.
  Background QA tab reported no warning/error console entries.
- Reduced-motion handling checked in source/tests. Physical touch, native
  screen-reader operation and OS/browser 200% enlargement were not exercised;
  narrow viewport checks are not a substitute for those tests.

## Publication boundary

Local preview and build only. No production publication, DNS changes, secrets
changes, live email or provider-account actions. No Git remote is configured,
so a PR and hosted CI cannot be published or monitored without a destination.
The focused local commit can be reverted independently; this update does not
change the deployed rollback state.
