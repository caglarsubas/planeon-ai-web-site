# Homepage film — preview review

## Scope and reference

User requested their supplied film on the homepage with a presentation inspired
by https://www.palantir.com/. The reference was inspected on 2026-09-08: a large,
muted, looping hero film under navigation. No Palantir media or code was copied.
Planeon's existing logo, typography, navigation, primary CTA and editorial
homepage remain intact. Only the opening film surface uses the source's dark
visual setting; the rest of the website retains its light paper/ink palette.

## Source and derivatives

Original user file: `/Users/caglarsubasi/Downloads/can_we_add_below_texts_in_orde.mp4`.
SHA-256: `af659fb5e77b9ee8dd74cdcc777a333ccbd2d4f997535f5897bd2ece8e8674c7`.
Original: 1280×720, 24 fps, 10 seconds, H.264/AAC, 4,630,640 bytes.

The original is untouched. Initial self-hosted derivatives retained all ten
seconds, framing, baked-in text and watermark with no overlays. The later
single-letter correction below supersedes these initial export sizes:

- `public/media/planeon-introduction.mp4`: 1280×720, 1,589,732 bytes.
- `public/media/planeon-introduction-mobile.mp4`: 768×432, 670,002 bytes.
- `public/media/planeon-introduction-poster.jpg`: original first frame, under 100 KB.

Video exports use FFmpeg `libx264`, slow preset, CRF 25 desktop / 26 mobile,
`yuv420p`, `+faststart`; audio is omitted from both website copies. The video is
silent by design, not a full audio playback facility. No external video host,
tracking, new package, billing service or production storage was introduced.

## Publication hold: source copy needs correction

The supplied film contained “Agentify you organization”, now corrected in the
preview as described below. The later wording “that planeon.ai delivery as
expertise” and transient text collisions between phrases remain unchanged.
Suggested replacement wording for a new export:

1. Agentify your organization.
2. For faster, better decisions.
3. With reliable, resilient and responsible AI.
4. Delivered with Planeon expertise.

A clean export without baked-in text would allow accessible HTML typography and
better small-screen reading. Source rights are user-supplied, not independently
verified. No production publication is performed in this change.

## Playback contract

- Muted inline loop starts only after motion/data preferences and visibility checks.
- No video source or preload request during server rendering; static poster remains
  for reduced motion, supported data-saving preferences, no JavaScript or blocked autoplay.
- Explicit Play may override motion/data preferences. Pause is retained when
  scrolling away and returning. Off-screen / hidden-tab playback is suspended.
- Accessible Play/Pause control, static text alternative, fixed aspect ratio,
  full-frame `contain` presentation and a compact mobile download.
- Film text is not covered by an additional heading. Existing headline and
  architecture content follow the film; a direct anchor skips to the introduction.

## Validation and delivery

113 tests, lint, TypeScript and production build pass. The existing large
reference-chunk advisory remains. MP4 fast-start ordering and size budgets are
tested, and all three assets are present in the production build output. The
desktop video returns HTTP 200 with the correct content type and length.

Browser checks covered desktop, 820px tablet and 390px mobile: silent inline
playback, looping, full-frame geometry, the smaller mobile source, keyboard
pause, unchanged playhead while paused, and the introduction anchor. Playback
stopped as the film left the reading viewport. No horizontal overflow was found.
Viewport overrides were reset. Motion/data/hidden-tab policies are covered by
automated state tests; OS-level preference toggles, physical touch devices and
200% text enlargement were not exercised in this focused check. Historical
message-channel errors on an unrelated Evolution URL appeared in the browser
log; their source was not established and this is not an all-clear session-log
claim.

Local preview only. Existing Sites identity, production deployment, DNS, email
handler and secrets stay untouched. There is no configured GitHub remote for a
PR or CI run. The publication hold above remains open.

## Single-letter video correction — 2026-09-08

At the user's request, the first title now reads **Agentify your organization**.
This is a rendered video correction, not an HTML cover or replacement title. A
transparent r sampled from `organization` in the same source film follows the
opening title's measured position, scale, outline reveal and dissolve. Only
added-letter pixels in 59 opening frames change before video encoding; frames
66–239 are verified unchanged in the compositor. No other words, cropping,
watermark or timing are changed. Lossy H.264 re-encoding can change pixel values
outside the composite; the before-encoding check is not a lossless-output claim.

Reproducible local editing script: `scripts/correct-film-word.py`. It rejects
other source hashes and existing output paths and checks the edit footprint.
NumPy/Pillow/FFmpeg are local editing tools, not new website dependencies.

- Corrected master: `/Users/caglarsubasi/Downloads/planeon-introduction-corrected.mp4`.
- Master: 1280×720, 240 video frames, 10.005 seconds including original audio.
- Master SHA-256: `9fa048a98c2d1cbed5b78ab799269eac242d1b234925a54a62bc57bf5d4da1a5`.
- Copied AAC stream hash matches the original: `20314eb4c2bb7b215630caa907decc44bf9c33dc988d1232d60747a398aee788`.
- Desktop website copy: 1,596,652 bytes; mobile: 669,571 bytes. Both stay silent.
- Both URLs use `?v=20260908-your` to invalidate earlier browser copies.
- Poster, controls and all other website pages are unchanged.

Opening reveal, full-title holds and the dissolve into the following message
were visually inspected in extracted frames. Media hashes pin those reviewed
exports in the website tests. Production publication remains out of scope; the
remaining later-title wording and original transition collisions are still open.

Final correction checks: 114 tests, lint, TypeScript and production build pass.
Both versioned video URLs served bytes matching the reviewed export hashes.
The original source hash and copied audio stream were verified unchanged.

## Grayscale Prometa corner logo — 2026-09-08

At the user's request, the fixed Gemini star is replaced by the existing
Prometa.ai symbol and wordmark in neutral gray. The full logo keeps its original
proportions at 150 pixels wide in the 1280-pixel film, with 72% opacity. No logo
was redrawn or AI-generated. Source: `/Users/caglarsubasi/Downloads/Logo_Prometa_black.png`,
SHA-256 `33b9668f7af2295b11146293a8f5cbef80f072d6e662f48cd6e49943744d2946`.

`scripts/replace-film-logo.py` uses the hash-pinned corrected YOUR master above.
It interpolates only the old 56×56 mark region before compositing the grayscale
logo in the same bottom-right area. There is no opaque banner, new crop, title
change or timing change. Interpolation estimates the background hidden by the
old mark; it does not recover original pixels. H.264 encoding remains lossy.
The original source, corrected master and source logo remain untouched.

Both website exports remain silent, 24 fps, 240 frames and exactly ten seconds:

- Desktop 1280×720: 1,621,245 bytes, SHA-256 `c603eff58e31bb5de55c24ef6cabc751dbfa37ed30f7462c2432736d9d06aade`.
- Mobile 768×432: 678,240 bytes, SHA-256 `29cc319e82275d439c6ede93d6bb82b73d69184574deb33c17ab5ab5ba658990`.
- Updated first-frame poster: 57,246 bytes, SHA-256 `c4a35f009e40b98ec50f334ac6ee1b9b64adb208dc6a420142faa29a440cf228`.

All three URLs use `?v=20260908-prometa`; the still preview therefore has the
same branding for reduced-motion/no-playback visitors. A ten-frame contact
sheet, final desktop/mobile frames and the poster were visually inspected.
The existing later-title wording and transition collisions are not changed.
This is a local preview update only; no production or hosting changes.

Validation: 127 tests, lint, TypeScript and production build pass. All three
versioned local media URLs return HTTP 200 and the exact reviewed byte hashes.
Original master and logo hashes are unchanged. Existing build advisories remain.

## Planeon logo correction — 2026-09-09 (previous export)

The user clarified that the corner mark must be **Planeon.ai**, not Prometa.
This supersedes the Prometa exports above. The exact attached
`planeon_ai_logo_no5_16x9_transparent.png` is used, SHA-256
`e1cba93942ce63e3765ba1ba956faf1435fe77ba46f28939bdcc54877fe33f61`.
Only transparent padding is trimmed; the complete supplied symbol and wordmark
retain their proportions, at 150px wide, neutral gray and 72% opacity. They sit
in the same lower-right area. The original PNG is unchanged.

Both videos are regenerated from the corrected YOUR master, not from the
Prometa render. This avoids layering a second removal over the previous logo.
The original ten-second timing, 240 frames, 24 fps, framing, text, silent web
playback and existing controls are preserved. The still poster is also updated.

- Desktop: 1,623,434 bytes; SHA-256 `ad6f267bef70b3584ec2f2e0b6a2445a1cc5e2fb576eb3bad2b719089153592f`.
- Mobile: 679,554 bytes; SHA-256 `0221074fafdc7decb1860eea1a44c7845a11758c681fefe23fe644901d32e835`.
- Poster: 57,175 bytes; SHA-256 `d0412dc004e198231489a3f39437ae361a83323a6411619311900c7c18cb1529`.

All URLs now use `?v=20260909-planeon` to invalidate the Prometa copies.
Final desktop/mobile frames and the poster were visually reviewed.
Local preview only; no production, DNS, account or secret changes.

Validation: 127 tests, lint, TypeScript and production build pass. The homepage
and all three versioned media URLs return HTTP 200; served asset hashes match
the reviewed exports. The existing build advisories remain unchanged.

## Latest supplied film with grayscale Planeon mark — 2026-09-09 (current)

The homepage now uses the new user-supplied
`/Users/caglarsubasi/Downloads/do_not_show_this_logo_at_the_e.mp4`, SHA-256
`87ff5c2c771b23086350cbeac5b3da0e7291c0e0ca58ff8698943fe5b61fb652`.
It is 1280×720, 24 fps, 240 video frames and ten seconds. This supersedes the
earlier source and derivatives; the old single-letter correction was not applied
to the new footage, which already says “Agentify your Organization”.

The full supplied Planeon symbol and wordmark use the same reviewed PNG hash,
150px width, neutral gray, 72% opacity and lower-right placement described above.
The existing compositor removes only the fixed Gemini mark region before adding
the supplied logo. No logo was redrawn, no opaque banner added, and no title,
transition, cropping or timing edit was made. Background interpolation and lossy
re-encoding are not a claim of recovering the original hidden background pixels.
The website remains silent; the source file and its audio are unchanged.

- Desktop: 1,471,251 bytes; SHA-256 `efc6af402213d297fa656f824c6d33deae0c2512fcc0834e53521ce75549d9cd`.
- Mobile: 615,434 bytes; SHA-256 `437856b116ee62800593b4caeb2b53fa9d2c8bb2e3c8075ee21740d6348a50d3`.
- Poster: 55,377 bytes; SHA-256 `9969c564f596daab50bdf02acdb0b77af516ba09eb1f54730e16445e3d7720a8`.

All three URLs use `?v=20260909-latest-planeon`. Both video exports retain all
240 frames, 24 fps, ten-second duration, original aspect ratio and fast-start
metadata. Desktop remains 1280×720 and mobile 768×432. Existing visibility,
reduced-motion, data-saving, inline-loop and manual playback controls are unchanged.

Source/output ten-frame contact sheets, final desktop/mobile frames and the
new poster were visually inspected. A 240-frame SSIM comparison with the edited
corner masked returned 0.986652, consistent with the expected lossy web encoding;
it is not a lossless-output claim. The new source's baked-in transition overlaps
remain unchanged. No browser interaction or responsive UI QA was run this turn.

Validation: 142 tests, lint, TypeScript, production build and diff checks pass.
The homepage and all versioned assets return HTTP 200. Served hashes match the
reviewed exports. Source video/PNG hashes were rechecked unchanged. Only media,
cache-version strings, the local compositor's reviewed-source allowlist, tests
and this review changed. Local Sites preview only; no publication, DNS, account,
email or secret changes. Previous media remain recoverable in Git. No Git remote
is configured for PR publication or remote CI.
