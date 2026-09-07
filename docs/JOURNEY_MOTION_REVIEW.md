# Journey motion revision

The attached `harness_onion_animated.html` supplied the interaction reference:
drawn handoff curves, travelling packets, participating sectors, recent trails,
parallel paths, chapter changes and reading holds. The previous Journey only
changed static arrows and captions on a fixed timer.

This revision rebuilds those ideas natively on the existing scenario engine.
It does not embed or execute the attached HTML, change the canonical messages,
or alter the 72 scenario variants and their evidence semantics.

## Changes

- Journey-specific quarter-ring diagram with the established names, numbers,
  colors and outer Runtime plane. Blueprint and the Explorer reference views
  retain their existing diagrams.
- Directed curved paths with stroke reveal, travelling packets, endpoint
  acknowledgement, and a model-boundary pulse only for model exchanges.
- One packet per parallel sibling, including offset fan-out lanes. Responses
  remain dashed. Skipped and untaken work has ghost paths without packets.
- Two recent frames form a light trail by default; Keep trail is optional and
  scoped to the current pass and clock.
- One animation clock synchronizes travel, reading hold and advancement.
  Pause freezes it; resume and speed changes retain elapsed time. Manual Next
  animates one handoff then settles. Reset clears the beat.
- Default remains paused at 0.75×. Approval waits stop after arrival. Continuous
  and offline frames do not become an unattended continuation of the live task.
  Opening evidence details or selecting a harness pauses playback.
- Narration and evidence sit beside the onion on desktop. Mobile reflows to
  one column with full-size named harness buttons. Reduced-motion users receive
  static paths without travelling packets, pulses or caption transitions.

## Verification

- 89 tests: previous 83 plus six motion/geometry tests. Every occurrence in all
  72 variants is sampled to check path bounds and non-model core avoidance.
  Directed response paths, fan-out lanes, reading holds, pause/resume, speed
  changes and manual-step settling are covered.
- Lint, TypeScript and production build pass. The existing large reference
  chunk warning remains advisory; no dependencies were added.
- Browser checks on the local development preview cover drawn path/packet
  movement, two simultaneous packets, frozen pause state, speed changes, reset,
  automatic stop at approval, readable mobile selection, and no page overflow
  at 390 px and 1440 px. A discovered SVG-title hydration mismatch was corrected
  and the refreshed page has no newly captured console errors.
- Native reduced-motion preference switching, physical-device performance and
  assistive-technology acceptance are not claimed from these checks.

## Delivery boundary

Preview only, building on the four connected-atlas commits. Production, Sites
ownership, DNS, secrets and the consultation API are unchanged. The checkout
still has no GitHub remote, so PR publication and CI monitoring await a supplied
existing destination. No repository was created implicitly.
