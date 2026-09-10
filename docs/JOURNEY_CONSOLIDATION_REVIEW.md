# Journey consolidation — 2026-09-09

## One walkthrough destination

Journey (`/journey`) now owns both the animated scenario walkthrough and the
synchronized AML–harness explanation. Playground no longer appears in Resources,
expanded navigation, contextual links or the sitemap. `/playground` returns a
permanent HTTP 308 redirect to `/journey` with the complete query string retained.
The separate Playground page was removed; its mapping component, helper, styles
and tests were moved to Journey-named modules rather than copied.

## Retained capabilities

- Nine industries, 36 use cases, 72 human/agent variants, sixteen named harnesses,
  all 57 AML feature families and 355 responsibility relationships.
- Animated handoffs, scenario selection, step controls, paused 0.75× default,
  inspection holds, approval waits, repeated passes, parallel/omitted work,
  separate continuous/offline clocks and reduced-motion handling.
- Primary and contributing responsibilities, applicability and expected evidence.
  These remain reference mappings, not assessed controls or maturity scores.
- Journey's current handoff contract, carried inputs, implementation notes, wire
  details and failure conditions remain in an expandable section. Opening it
  pauses playback. The canonical 43-exchange reference remains below the tool.
- Existing step/harness anchors and feature selections continue to resolve.
  Journey ↔ Explorer links now retain the selected occurrence as well as scenario.
- Explorer keeps its Onion, Sequence, Flat waterfall, Tree waterfall and Layered
  flow modes. It is the specialist inspection surface, not another AML walkthrough.

## Verification

- `npm test`: 142 passed, including all prior data/motion/consultation regressions.
  New consolidation checks cover single-route ownership, complete redirect query
  preservation across all 72 variants, invalid/repeated query values, canonical
  reference and contract availability, and Explorer's retained diagram modes.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check`: pass.
  The existing large-reference-chunk advisory remains; no dependencies changed.
- Local HTTP checks: 200 for Journey, Resources, Explorer (Sequence), Maturity
  (feature selection), Contact and Assessment. Playground and parameterized
  Playground links return 308 with exactly the expected Journey destination.
- Redirects do not explicitly clear URL fragments; the existing browser anchor
  resolution remains unchanged. Browser navigation/Back/Forward, keyboard/touch,
  visual layout and OS reduced-motion acceptance were not exercised in this turn.
  Source/unit/HTTP checks are not represented as interactive browser acceptance.
- Consultation tests use mocked delivery only; no emails were sent.

## Delivery boundary

Local preview: `http://localhost:3001/journey`.
Branch: `codex/planeon-journey-consolidation`, based on `ea726a5`.

No publication, DNS, Sites identity, secrets, account ownership, source scenario
or AML data, media, email API, analytics or package changes. There is no configured
Git remote; PR publication and remote CI need a supplied existing destination.
No repository was created. Removed/moved prototype files remain recoverable in Git.
