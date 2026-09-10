# Planeon existing-site refinement

## Review baseline and scope

User-requested skill: `redesign-existing-projects`.
Baseline: `58e0768` (the preceding premium visual-system preview).
Review branch: `codex/planeon-editorial-refinement`.
Preview: `http://localhost:3001/`.

The scan covered all page templates, the sixteen harness detail routes, shared
navigation, working surfaces and consultation entry points. This is a targeted
revision of the existing React/Vinext site, not a framework or content migration.

## Findings and changes

| Finding | Resolution |
| --- | --- |
| Interactive pages inherited too much introductory spacing. Journey's visual began at about 779px in the 1920 × 902 viewport. | Compact selectors, metadata and playback chrome bring the visual to about 613px without shrinking its diagram labels. Atlas uses a split introduction; selected feature content begins at about 547px. Readiness has a compact introduction. |
| Static content, notices, controls and evidence all used similar nested trays. | Reserve soft enclosures for working surfaces and selected evidence. Unbox the homepage's connected path, About principles, harness articles and legal text. Reduce label badges and use light rules for visible caveats. |
| The resource index and footer repeated a uniform card/link structure. | Distinguish the Explorer reference from a compact ruled resource list. Reduce footer duplication while keeping every resource discoverable. |
| Resource child pages lost navigation context. | Show Resources as the current section on Explorer, Roadmap, Whitepaper and About. Exact destinations use `aria-current="page"`; parent sections use `location`. Evolution Research remains under Evolution. |
| The skip link pointed to a wrapper containing the header. | One shared SiteFrame places header and footer outside a focusable main landmark on every route, including the not-found page. |
| Lazy reference views had only a text fallback; empty Atlas filters gave no direct recovery action. | Reuse the installed Skeleton primitive in a reserved loading region, with reduced-motion support. Add a clear action to restore all feature filters. |
| About's contact CTA opened the visitor's mail app. | Route it to the existing professional consultation form. The API, explicit consent and Planeon-owned server delivery remain unchanged. |
| The shared landmark refactor exposed an SSR/client identifier mismatch in Blueprint's SVG marker. | Give each reference onion an explicit, distinct route-owned SVG namespace. Browser checks confirm matching marker references and no fresh Blueprint hydration warning. |

No new imagery, libraries, external font requests, fabricated metrics, claims or
product features were introduced. The logo, current Poppins/Geist typography,
semantic plane colors and labels, 0.75× playback, scenario model, evidence
semantics and existing numeric URLs are preserved.

## Verification

- 97 automated tests pass: existing scenario, identity, relation, motion and
  mocked-consultation coverage, plus navigation/landmark/loading/contact-path
  and stable SVG namespace regression checks. Visual source-contract checks are not a WCAG audit.
- All 30 public routes return HTTP 200 with one main landmark, one skip target
  and a heading. The unknown-route check remains a separate 404 check.
- Browser: fourteen top-level page types and two legacy harness detail routes
  fit a 390px viewport without page-level horizontal overflow. The fourteen
  main page types also fit an 820px tablet viewport.
- Keyboard skip activation focuses MAIN after the header. Expanded navigation
  closes with Escape and restores focus to Open navigation.
- Journey Next updates to frame 2/41, remains paused and retains sixteen sectors.
  Explorer Sequence retains nineteen aligned participant columns and its
  existing exchange content. Current navigation is correct on resource pages.
- The consultation form fits the mobile viewport, keeps its consent unchecked
  by default, and was not submitted. Delivery testing uses mocks only.
- Lint, TypeScript and the production build pass. The existing reference-chunk
  size warning remains; no dependency or lockfile changes were needed.

Native 200% browser zoom, physical touch devices, a screen reader, native
reduced-motion switching and production-Worker browser acceptance are not
claimed. Responsive geometry checks do not establish pixel-perfect rendering
or replace those review gates.

## Delivery boundaries

This remains a local preview. No production publication, Sites version save,
DNS operation, credential access or live email was performed. The prior
publication/rollback record in CONNECTED_ATLAS_HANDOFF.md is unchanged and must
be reverified before an approved production cutover.

The checkout has no GitHub remote. Push, PR creation and CI monitoring require
an existing destination from the user; no repository was created implicitly.
