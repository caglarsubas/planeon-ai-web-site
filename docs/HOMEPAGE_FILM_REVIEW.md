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
