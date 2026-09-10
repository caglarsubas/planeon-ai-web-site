# Optional dark mode — local preview

Date: 9 September 2026  
Branch: `codex/planeon-dark-mode`  
Base: `e6bee49`  
Preview: http://localhost:3001/

## Delivered

- Shared light/dark toggle using the installed accessible Toggle control. The header control is available above 600px; the expanded navigation includes a labeled control at every width, including phones.
- Light remains the default. An explicit choice is stored as `planeon-theme` in local storage. A static, allowlisted pre-paint script restores it on navigation/reload; cross-tab updates synchronize. Blocked storage does not prevent changing the current page.
- One ink-dark palette across editorial pages, services, forms, the architecture onion, Journey, Explorer, Maturity Atlas, Learning & Evolution, roadmap and references. Existing light surface values are retained through `light-dark()`; there is no image/video inversion or additional motion.
- Dark-mode semantic plane paints are presentation-only. The documentary palette, 16 identities, 57 feature families, 355 relationships and 72 scenario variants are unchanged.
- The supplied logo remains the source asset. A CSS alpha mask brightens only its dark wordmark letters on dark surfaces; its blue/teal symbol and blue `.ai` remain unchanged. The film, poster and their playback behavior are untouched.
- Form errors, selected states, focus treatments, reference table headers and native control surfaces have dark treatments. Print restores a light palette. The privacy page explains local-only theme persistence.

Impeccable guided the restrained semantic palette and readable surfaces; Adapt guided the header/mobile-menu placement and touch-target sizing. Sites building/hosting instructions retained the existing project and local-preview-only delivery boundary.

## Validation

- `npm test`: **153 passed**, including 11 theme tests. Coverage includes the bootstrap, explicit default, invalid preferences, unavailable storage, same-page synchronization, cross-tab storage, listener cleanup, retained documentary paints, source-level accessible control contracts and print/film isolation.
- Palette calculations: dark body text, secondary text, links and semantic plane labels meet **4.5:1** against tested reading surfaces/tints; focus and control boundary colors meet **3:1** against the three neutral surfaces. These are palette calculations, not a whole-page browser accessibility certification.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check`: passed.
- HTTP smoke: **34 page/deep-link requests returned 200**, including all 16 legacy numeric harness routes. Both compatibility redirects returned 308 with query values preserved. An invalid route returned the expected 404.
- The initial smoke list incorrectly assumed a `/research` route. The existing Resources index resolves Research to `/evolution/research`, which returned 200; the final list uses actual project routes. No new route or redirect was introduced for that test assumption.
- Existing consultation tests use mocked delivery; the expected simulated delivery failure is not a live email failure. No test email was sent.
- Build retains the advisory about chunks larger than 500 kB and Vinext's static route-classification limitations; neither prevented the build.
- Interactive browser testing, screenshots, viewport resizing and visual acceptance were **not run**, following the Sites skill's explicit-request boundary. The preview is available for review of appearance and interaction.

## Boundaries and rollback

No production publication, DNS change, account change, secret change, new analytics, new dependency or consultation API change. `.openai/hosting.json`, source data and media assets are unchanged. The checkout has no configured Git remote, so PR creation and hosted CI cannot proceed without a supplied destination; no repository was created.

The previous local implementation is at `e6bee49`. This dark-mode change is isolated on its own branch for review/reversion; production did not change and requires no rollback.
