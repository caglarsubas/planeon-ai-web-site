# Homepage ambient flow — 2026-09-09

## Scope and visual intent

Local implementation of the approved flowing-dot direction. One original canvas
field sits behind the homepage introduction only. Blue and teal particles form
three folded sheets, following the user's denser particle-surface references.
A six-second wave and a smaller secondary harmonic travel left to right while
particles drift forward. Primary vertical amplitude is capped at 64 pixels, with
the secondary at 30% of that amplitude. Row depth shifts the wave phase and sheet
thickness; stable staggered rows and a shared drift per sheet retain close spacing.
They are decorative, not harness categories, maturity evidence or live telemetry.

The field uses explicit padded exclusion zones for the entire business
proposition, film and background-motion control. Points fade before those zones
and the field edges. Mouse interaction gently repels nearby dots within 110 pixels
by at most 16 pixels. Per-particle, time-based easing opens the local gap, holds it
while the wave passes, and settles back to the wave after departure (about 95% of
the return within 300 ms). The canvas does not intercept clicks, touch or scrolling. Theme changes
update the palette without restarting the animation clock or touching film pixels.

Animate and Impeccable guidance informed the layered particle texture, preserved reading
hierarchy, existing button primitive and equivalent static experience. Existing
typography, logo, semantic plane colors and all five homepage sections remain.

## Motion, accessibility and resource controls

- 5,760 desktop particles (3 sheets × 12 rows × 160 columns); 1,536 at widths of
  700 pixels or less (3 × 8 × 64). This replaces the sparse 168/48 field. Fine dots
  are 0.65–1.15 pixels in radius, with occasional 1.8-pixel highlights. Outer rows
  fade softly. Desktop horizontal spacing is approximately 9 pixels at 1440px width.
- Wave cycle reduced from 20 to 6 seconds (3.3× faster); particle drift increases
  from 0.18–0.4% to 1.8–2.2% of the field width per second. No random acceleration.
- Twelve opacity buckets per color cap canvas fills at 24 per frame, independent
  of particle count. Reused group buffers avoid per-particle canvas state changes.
  Zero-opacity exclusion points are omitted before paint; independent circle
  subpaths cannot accidentally connect dots. Unaffected hover offsets skip easing.
- Paints capped at 30 per second; backing canvas capped at a 2-megapixel budget
  and device pixel ratio 2. Geometry updates do not trigger React renders.
- A single cancellable frame loop freezes time while paused, outside the viewport,
  in a hidden tab or printing. Resuming does not skip ahead by elapsed wall time.
- Reduced-motion or data-saving preferences select a static composition. Mouse
  interaction is disabled with those preferences and on coarse/touch pointers.
- A native keyboard-accessible pause/resume button has a 44-pixel minimum target
  and visible focus. Decorative canvas is hidden from assistive technology.
- Pause choice is stored as `planeon-background-motion`, synchronized across tabs,
  and optional when local storage is blocked. Privacy copy explains local-only
  preferences. No tracking, cookies, network requests or server state were added.
- Geometry is remeasured on relevant resizes and font readiness, including the
  text, film and controls. Animation callbacks do not read layout. All observers,
  event listeners and frame callbacks are released on unmount.
- Missing canvas support leaves the original homepage usable without motion.

## Validation

- `npm test`: 178 passed, including 25 ambient tests. Coverage includes all 64
  combinations of motion gates, deterministic desktop/mobile density, long-running
  position bounds, rightward wave propagation, cycle continuity, three-sheet density,
  persistent row spacing, bounded amplitude, 24-fill batching, padded reading exclusions,
  opacity quantization, edge fades, pointer approach/hold/
  departure, refresh-rate-independent settling, bounded displacement, high-DPI resource limits, frame-rate capping,
  pause/resume continuity, static redraws, disposal and component source contracts.
- Existing tests retain 16 harnesses, 57 feature families, 355 relationships and
  72 scenario variants. Consultation delivery tests remain mocked; no email sent.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check`: pass.
  Build retains the existing large-chunk advisory and Vinext route-classification
  notice. No package or dependency changes.
- Local HTTP: 200 for `/`, `/services`, `/resources`, `/contact`, `/assessment`,
  `/privacy`, feature-selected `/maturity`, scenario-selected `/journey`, Sequence
  `/explorer` and `/evolution`. Source-contract tests keep the canvas homepage-only
  and preserve the pause control and primary CTA. HTTP checks are status checks,
  not visual acceptance.
- Parameterized `/playground` and `/transformation` still return HTTP 308 to
  `/journey` and `/services`, respectively, preserving their query selections.
- Browser visual/interactive acceptance was not run. Actual appearance, pointer
  feel, keyboard/touch use, OS preference changes, mobile/tablet layout and 200%
  zoom remain preview-review items. Unit/source/HTTP checks are not presented as
  browser or measured device-performance acceptance.

## Delivery and rollback

Preview: `http://localhost:3001/`. Branch: `codex/planeon-ambient-flow`, based on
`8ceac01`. This is local-only: no production publication, DNS, Sites identity,
secrets, Planeon ownership, API, media or reference-data changes.

No Git remote is configured. A push/PR and remote CI require an existing destination;
no repository is created implicitly. Roll back by reverting this branch's single
ambient-flow change, preserving any later work. The saved pause preference is inert
without the component and can be cleared through browser site data.

Density follow-up: `codex/planeon-ambient-density`, based on `ab653cb`, changes
only the population and matching test/documentation. All 169 tests, targeted lint,
TypeScript, production build and homepage HTTP checks passed again. The supplied
screenshot informed this adjustment; no new browser visual acceptance or publication
was performed. No Git remote is configured for push/PR/remote CI.

Wave follow-up: `codex/planeon-travelling-wave`, based on `b6deb22`, implements the
approved traveling-wave and hover behavior. Density, palette, field scope, film,
reading exclusions and controls remain intact. Pause/Resume label remeasurement
does not reset held hover offsets. Validation above is updated for this revision;
browser visual/interactive acceptance remains outstanding. The source remains
local-only, without a configured Git remote for push/PR/remote CI.

Dense-wave follow-up: `codex/planeon-dense-wave`, based on `0f7df17`, replaces the
sparse ribbons with fine layered sheets and speeds up both wave propagation and
particle drift. The source reference images guide the geometry; no image assets,
dependencies, branding, page layouts, film, controls or publication configuration
were changed. Reverting this follow-up restores the previous wave geometry and
renderer without touching the saved pause preference. Validation above describes
this revision; browser visual review and measured device performance remain open.
