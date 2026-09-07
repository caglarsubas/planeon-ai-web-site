# Connected Planeon reference site

Implementation revision: 7 September 2026. Branch: `codex/planeon-connected-atlas`.

## Scope and publication boundary

This is a website implementation and local preview, not a production publication.
No live agent execution, scoring backend, new paid service, tracking integration,
DNS change, secret rotation or email-account migration was introduced.
`app/api/consultation/route.ts` and `.openai/hosting.json` are unchanged.

The existing public site is `https://planeon.ai`. Sites history confirms the
version-13 baseline at source commit
`92b690aaeb75d3ac9c5241a1c5fea035b7b43e5f`.
Preserve that saved version as the rollback candidate:

- Project: `appgprj_6a9665b7ad7c819192070a67b6dfa429`
- Saved version: `appgprj_6a9665b7ad7c819192070a67b6dfa429~appgver_f96864c8ba0c8191bafa9a8b17270a75`
- Archive digest: `sha256:f7d354be8c241493911a826f3b84098a7b8fed05b8dfb28bb6d8efa590774e73`

Do not confuse a saved version with a new deployment. This run has not called
Sites save/deploy, pushed source, changed access, or altered production.
Before an approved cutover, recheck the live version and account ownership;
deploy only an exact saved source/artifact pair. Roll back through the existing
Sites project if needed, without changing DNS or email secrets.

## Four review stages

1. Semantic harness registry, versioned source modules, provenance and integrity
   tests. Sixteen stable identities separate source-route numbers from display
   numbers. The 57-family target map contains 57 primary and 298 contributor
   edges; these relationships never imply a passed assessment.
2. Shared scenario engine for Journey and Explorer. All 36 use-case pairs across
   nine industries remain selectable. Each occurrence has a stable ID, pass and
   clock. Repeats, clarification, intent calls, fan-outs, omitted work, human
   waits, continuous signals and offline work are represented explicitly.
3. Maturity Atlas, governed Evolution, research guide, release bundle and harness
   detail connections. Candidate generation, independent evaluation, promotion
   authority and the target harness remain separate.
4. Six-section homepage, resource navigation, phase contracts, operational
   checklist and reviewed consultation context. The readiness check remains
   self-reported; the existing server receives reviewed context in `brief` only
   after the visitor explicitly adds it and submits with consent.

## Authoritative content homes

| Question | Home | Deeper detail |
| --- | --- | --- |
| What comprises the system? | `/blueprint` | `/blueprint/[original-source-number]` |
| What happens during a task? | `/journey` | `/explorer` |
| Who coordinates a capability and its evidence? | `/maturity` | Reverse lookup and the complete matrix |
| How may a system change? | `/evolution` | `/evolution/research` |
| What should be built next? | `/roadmap` | Phase prerequisites, evidence and hold conditions |
| What can we responsibly claim today? | `/assessment` | Evidence-based professional review |
| Where should a reader go next? | `/resources` | Explorer, Roadmap, Research, Whitepaper, About |

The homepage has six direct editorial sections and approximately 356 words of
introductory paragraph copy, excluding labels and the expandable onion legend.
The original whitepaper PDF remains an existing historical artifact; it was not
regenerated or represented as a new research publication.

## Public links and identifiers

- Runtime display numbers 1–4; Trust 5–8; Execution 9–12; Knowledge 13–16.
- `/blueprint/5` still means Domain, now display number 13.
  `/blueprint/13` still means Security, now display number 5.
- `/journey#step-19` resolves the first canonical occurrence of step 19.
- `/explorer#harness-13` preserves the original security-harness selection.
- Scenario example: `/explorer?scenario=airline-rebooking-human&view=tree`.
- Occurrence example: `/journey?scenario=retail-address-human&occurrence=retail-address-human%3Ap1%3Am9%3A10`.
- Atlas example: `/maturity?feature=A5&scenario=retail-address-human`.
- Matrix, domain, gate, industry, speed, view and presentation choices use query
  parameters. Manual changes push history; automatic playback replaces only its
  cursor. Browser Back/Forward pauses playback.
- Evolution example: `/evolution?change=retrieval&stage=rollout&branch=withdraw`.
- Artifact example: `/blueprint?artifact=identity#release-bundle`.
- Consultation accepts only known scenario, feature and semantic harness IDs.
  Visitors review the resulting text before adding it to their editable brief.

## Source and editorial integrity

`scripts/import-reference-data.mjs` extracts literal data using TypeScript AST
parsing; it does not execute supplied HTML. Its three explicit inputs are the
onion HTML, AML JSON and research HTML. Original source hashes are retained in
the generated modules and `data/provenance.v1.json`.

The primary-source reading register is `data/research.v1.ts`. Research PDFs are
linked at their publishers, not copied into the site. AI-generated synthesis is
treated as coverage, not independent corroboration. Approximate effort splits,
benchmark headlines, speculative dated schedules and unverified legal
assertions were omitted. The optional adaptation vocabulary is not AML maturity
or a regulatory classification. The retained survey statistics carry explicit
source-specific limitations on the Research page.

Waterfall durations use the visible `illustrative-v1` model: 40 ms ordinary
hop, 120 ms retrieval, 900 ms reasoning, 600 ms external action, 15 s example
human wait and 1 h offline batch. These are assumptions, not measurements.
Parallel groups join at their longest sibling, not the sum. Model exchanges
16/17 form a request/response pair, not two invocations.

## Reproduce validation

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
WRANGLER_SEND_METRICS=false npm run start -- --local --port 3002 --inspector-port 9232 --log-level warn
node scripts/smoke.mjs http://localhost:3002
```

Stop and restart the local production server after rebuilding. Its already
loaded module/asset manifest can otherwise refer to prior content-hashed files.
The smoke check verifies the referenced asset URLs as well as HTML routes.
The standard development preview is `npm run dev -- --port 3001`.

No environment file, secret value or provider credential is needed for the
automated tests. Email delivery is replaced with a mock. A local browser form
was not submitted to the real email provider.

## Acceptance evidence and remaining gates

- 83 automated tests pass: 16 identities and routes, 57 families, 355 unique
  relationships, all 72 variants, stable occurrence links, optional and repeated
  paths, parallel joins, distinct clocks, release/adaptation links, curated
  reference counts, bounded reviewed context and mocked consultation delivery.
- Lint and TypeScript checks pass. Production build passes. The build retains
  an advisory warning for the complete scenario reference chunk (about 532 kB
  minified before transfer compression); it is route-specific, not homepage
  content. Matrix and technical diagrams are separately lazy-loaded.
- Local production HTTP checks pass for 30 pages, their referenced build assets,
  the existing linked PDF, rendered native anchors and two invalid-route 404s.
- Browser checks cover Atlas search and reverse lookup, 57 matrix rows and 16
  harness columns, Back/Forward, legacy step selection, paused 0.75× default,
  approval-stop playback, repeated-pass content, all five Explorer views,
  mobile named-harness controls, selected-context preservation, Evolution
  withdrawal and target changes, and identity artifact inspection.
- Consultation browser check adds reviewed context to an existing brief without
  checking consent or submitting. Delivery success/failure, ownership,
  validation, bot checks and consent are tested through mocked API calls.
- Visual checks use 390 px mobile, 768 px tablet and 1440 px desktop viewports.
  Desktop sequence header/line centers share exact 150 px columns plus a
  290 px fixed gutter. Mobile uses named compact exchanges rather than shrinking
  those columns. Dense matrices remain opt-in and scrollable.
- Reduced-motion rules provide a static, fully named homepage onion and remove
  reference transitions. Native OS preference switching, physical-touch device
  testing, assistive-technology testing and native browser 200% zoom are not
  claimed as completed; retain them as pre-publication review gates. Keyboard
  operation and responsive reflow have been exercised in the preview.
- No GitHub remote is configured. PR creation, GitHub Actions monitoring and
  merge are NOT_RUN pending a supplied existing repository destination. Do not
  create a repository implicitly.
- Production publication, deployed-runtime verification, real recipient-mailbox
  receipt and stakeholder acceptance remain separate, outstanding states.

## Suggested preview review

Start on the homepage. Follow the address-change Journey, inspect A5 and D7 in
the Atlas, then open retrieval improvement in Evolution. Review the evidence and
identity release artifact, and add a chosen question to a consultation brief.
Use a repeated-pass airline or manufacturing example to inspect the technical
views. Approve the preview before any production publication.
