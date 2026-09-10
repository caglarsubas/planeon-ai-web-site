# Planeon visual-system preview

## Direction and scope

The explicitly requested `high-end-visual-design` skill informs this revision:
soft structural surfaces with editorial splits, floating navigation, nested
tray/core enclosures, pill CTAs with inset arrow circles, and restrained eased
reveals. The technical diagrams remain the visual content; no stock imagery,
decorative charts, new claims or new product features were introduced.

The shared system covers Home, Blueprint, all sixteen harness detail routes,
Journey, Explorer, Maturity, Evolution, Evolution Research, Roadmap, Assessment,
Resources, Whitepaper, About, Privacy, Terms and the not-found page.

- Poppins headings and the existing logo remain. Geist replaces Inter in body
  text and controls to follow the newly selected skill's typography constraint.
- Semantic plane colors, names, numbers and legacy routes remain. Layered
  surfaces distinguish selectors, diagrams, evidence and the consultation form.
- The existing accessible dialog supplies focus trapping, Escape dismissal and
  focus return for the expanded navigation. Motion uses custom easing. Page
  reveals are progressively enhanced with IntersectionObserver and exclude live
  scenario workbenches. Content remains readable without JS and with reduced
  motion; print removes navigation and reveals all content.
- The Journey motion clock, data, AML mapping, scoring behavior and email API
  are unchanged. The homepage's existing 24-second architecture cycle uses
  eased reveals within its original timing boundaries.

## Font provenance

Geist is self-hosted; visitors make no font request to an external provider.
Source: [Vercel Geist repository](https://github.com/vercel/geist-font), pinned
to commit `10dc7658f13c38a474cde201bb09a4617267545b`, file
`fonts/Geist/webfonts/Geist[wght].woff2`. Its SIL Open Font License is retained
as `public/fonts/geist-OFL.txt`.

Font SHA-256: `2ffebe993e969069a9789d15164b7715d42491b5835516c5e3b935d5f81b05f1`.

## Validation

- 92 tests: the previous 89 data, geometry, scenario and mocked-email tests,
  plus three static visual-system contract checks. These contract checks are
  not substitutes for visual or assistive-technology testing.
- Local HTTP smoke checks: all 30 public page routes return 200 and include a
  heading and the shared navigation; an unknown route returns 404.
- Browser checks cover the refreshed desktop homepage, menu, Journey, Atlas,
  Roadmap and Explorer sequence. Menu Escape dismissal restores trigger focus.
  Manual Journey Next updates the occurrence, keeps playback paused and retains
  sixteen sectors. Sequence selection renders nineteen aligned participant
  headers and the existing occurrence rows.
- A 390px browser viewport check covered all fourteen main routes and two
  representative harness detail pages without page-level horizontal overflow.
  Mobile consultation controls stack into one column, retain labels and fit
  their containers. No form was submitted during browser QA.
- Lint, TypeScript and production build pass for the reviewed source.
  The build's pre-existing large-reference-chunk warning remains advisory.
- Physical touch devices, native reduced-motion switching, screen-reader
  acceptance, real 200% browser zoom and production-Worker browser checks are
  not claimed by this local preview. These remain pre-publication review gates.

## Delivery boundary

Local review branch: `codex/planeon-premium-visual-system`.
Pre-redesign local source: `120b069cf1b0ca7eba136a04f2c8a708c2236ca4`.
Preview: `http://localhost:3001/`.

No Sites save or deployment, DNS change, secret access, live email or production
mutation was performed. The consultation API, source data, semantic libraries,
Sites project identity and runtime ownership are unchanged. The existing
publication/rollback record remains in `CONNECTED_ATLAS_HANDOFF.md`; reverify
the actual deployed version before any later approved cutover.

There is still no configured GitHub remote. A supplied existing destination is
required to push a branch, open a PR, or monitor its CI. No repository was
created implicitly.
