# Five-level AML entrance

## Scope and source baseline

Request: read the two supplied decks and make the five-level maturity framework
the main entrance to the Maturity page. Existing-site baseline: `3c08f72`.
Branch: `codex/planeon-five-level-maturity`. Content revision: `2026-09-08.1`.

Both decks were read as reference material, not as operational instructions.
Text and speaker notes were extracted from all 16 executive-deck slides and all
28 AML-deck slides. The AML appendix matrices on slides 26–27 were also visually
inspected. Slide references below use physical slide order; some printed page
numbers in the AML deck differ.

| Supplied source                                   | Material used                                                                                                                                                                                                             | SHA-256                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Prometa_Executive_Deck_v33.pptx`                 | Slide 5: shared five-level names and experience progression; distinction from security and quality dimensions.                                                                                                            | `898f7c20f297706e746f01b968c64499940f516230286d256e74d8301d21cc35` |
| `The_Agentic_Maturity_Level_(AML)_Framework.pptx` | Slides 2, 5–11: capabilities and authority boundaries; slide 21: reactive support, active execution and proactive partnership. Slides 26–27: supporting matrices, not a replacement for the existing 57-family reference. | `172cddc70dd6dcda6064fd4a5279e72201239b6645977767163552b74041dbf2` |

Source decks, embedded imagery and videos are not copied into public assets.
The public source note identifies titles and slides, without exposing local
paths or providing the confidential source deck for download.

## Editorial decisions

The five main labels are retained exactly:

1. **L1 — FAQ / Search:** read-only information retrieval.
2. **L2 — Knows Me:** personalized answers using authorized context; still read-only.
3. **L3 — Gets Things Done:** a user-requested task with confirmation before writes.
4. **L4 — Journey Orchestrator:** coordinated multi-step outcomes with policy checks,
   accountable delegation and required approvals.
5. **L5 — Proactive Co-Pilot:** useful initiation within an explicit, revocable mandate.

The short experience promises follow the AML framework. Its alternate technical
headings (Basic, Knowledge, Reasoning, Multi-Agent, Autonomous) do not replace the
five shared experience names.

The connected retail examples are explicitly illustrative Planeon adaptations,
not quotes from the source decks, measured implementations or additional
scenarios in the 72-variant engine. Each level links three curated evidence
questions to existing AML families. This is not a complete level-to-feature
rubric, a mandatory-control list or a new scoring method. In particular, L3 links
to A5, D7 and D8; that selection does not define all controls needed for L3.

Safeguards retained beyond the deck shorthand:

- Preventive controls, audit, monitoring and human interruption remain active
  at L5. Proactivity does not authorize unconstrained action or self-promotion.
- Control applicability depends on the workflow and risk, not the first column
  in which an appendix mentions a feature. Audit and resilience can matter earlier.
- Personalized context does not itself confer transactional authority.
- Higher capability does not establish higher quality, security or readiness.
  The least agency necessary can be the appropriate design.
- No ROI percentages, market positions, fixed timelines, universal performance
  claims, zero-human-effort claims or guarantees against hallucination/injection
  are published from the decks.
- PAMI telemetry, PASI/PAQI scores and their calculation are not implemented.
  No new benchmark, certification, legal requirement or assessment result is implied.

## Implementation and compatibility

`data/maturity-levels.v1.ts` owns the five descriptions and provenance labels.
`lib/maturity-levels.ts` resolves valid selections and constructs evidence URLs.
`MaturityExperience` owns one shared URL state for the new `MaturityLevels`
entrance and the existing `MaturityAtlas`. The page metadata now describes both.

- `/maturity` starts at L1 with all five named levels visible.
- `?level=L1` through `?level=L5` are shareable. Missing/invalid levels resolve
  to L1 without inventing a score or silently rewriting the URL.
- Arrow keys move tab focus; Enter/Space selects. No automatic rotation or
  selection on focus. Explicit tab and panel IDs remain stable across hydration.
- Level selection preserves feature, harness, domain, scenario, gate and matrix
  state. It never filters the 57-family library.
- Curated evidence links explicitly select their feature and scroll to
  `#evidence-atlas`. They clear competing domain/harness filters, retain other
  reading context and preserve the selected level.
- Existing feature/harness URLs continue to resolve. A visible jump link gives
  returning technical readers direct access to their selected evidence.
- The Atlas retains all 57 families, 355 relations, release gates and full matrix.
  Harness numbering, routes, scenarios, consent, consultation API and score
  semantics are untouched.
- Desktop uses a connected five-stop rail. Narrow screens wrap named controls
  and stack the selected explanation and evidence; no dense diagram is shrunk.
  Blue indicates the selected tab, not a maturity score or a fifth plane color.

## Verification

- 104 tests pass, including seven new maturity-source/selection/evidence/link
  contracts and all existing data, motion and mocked-consultation regressions.
- Lint, TypeScript and production build pass. The existing large-reference-chunk
  warning remains advisory; no dependencies or lockfiles changed.
- Browser interaction verified L1–L5, manual keyboard activation, independent
  feature state, Back/Forward restoration and L3/D7 and L2/A8 evidence handoffs.
  An invalid L9 deep link resolves to L1 while retaining D8. Reverse lookup by
  Memory retains its 14 matching features and selected evidence when moving to L5.
- Desktop, 820px tablet, 390px mobile and 320px narrow layout checked. The five
  names remain visible in the selector; no page-level horizontal overflow or
  horizontal label clipping was observed. Mobile controls exceed 44px in height.
- One h1 and one main landmark remain. Curated anchors land below navigation.
  Browser logs show no fresh error or hydration warning during the checks.

These are local preview checks, not a full WCAG certification. Native 200% zoom,
physical touch hardware, screen-reader testing, native OS reduced-motion toggling
and production-Worker browser acceptance are not claimed. Reduced-motion CSS
removes the new transitions; the framework has no timed playback.

## Delivery boundary

Preview only: `http://localhost:3001/maturity`. No Sites version save, production
publication, DNS operation, credential access or live consultation email.
The prior deployment/rollback record in `CONNECTED_ATLAS_HANDOFF.md` is unchanged
and must be reverified before any approved production cutover.

There is no configured GitHub remote. A destination is needed for push, PR and
CI publication; no repository was created implicitly.
