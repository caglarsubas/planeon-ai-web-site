# Homepage ambient flow — 2026-09-09

## Scope and visual intent

Local implementation of the approved flowing-dot direction. One original canvas
field sits behind the homepage introduction only. Blue dots and occasional teal
accents slowly gather into loose curved streams and disperse over 36 seconds.
They are decorative, not harness categories, maturity evidence or live telemetry.

The field uses explicit padded exclusion zones for the entire business
proposition, film and background-motion control. Points fade before those zones
and the field edges. Mouse interaction gently repels nearby dots by at most 16
pixels; the canvas does not intercept clicks, touch or scrolling. Theme changes
update the palette without restarting the animation clock or touching film pixels.

Animate and Impeccable guidance informed the restrained density, preserved reading
hierarchy, existing button primitive and equivalent static experience. Existing
typography, logo, semantic plane colors and all five homepage sections remain.

## Motion, accessibility and resource controls

- 84 desktop dots; 32 at widths of 700 pixels or less.
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

- `npm test`: 169 passed, including 16 new ambient tests. Coverage includes all 64
  combinations of motion gates, deterministic desktop/mobile density, long-running
  position bounds, the gather/disperse cycle, padded reading exclusions, edge fades,
  bounded pointer displacement, high-DPI resource limits, frame-rate capping,
  pause/resume continuity, static redraws, disposal and component source contracts.
- Existing tests retain 16 harnesses, 57 feature families, 355 relationships and
  72 scenario variants. Consultation delivery tests remain mocked; no email sent.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check`: pass.
  Build retains the existing large-chunk advisory and Vinext route-classification
  notice. No package or dependency changes.
- Local HTTP: 200 for `/`, `/services`, `/resources`, `/contact`, `/assessment`,
  `/privacy`, feature-selected `/maturity`, scenario-selected `/journey`, Sequence
  `/explorer` and `/evolution`. Homepage SSR includes the canvas, pause label and
  unchanged primary CTA. The other checked pages do not contain the ambient canvas.
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
