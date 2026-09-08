import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { shouldPlayFilm, type FilmPlaybackState } from '../lib/film-playback';

const normal: FilmPlaybackState = {
  inView: true,
  pageVisible: true,
  reducedMotion: false,
  saveData: false,
  userPaused: false,
  userStarted: false,
  failed: false,
};

void test('home film: autoplay is gated by visibility, motion and data preferences', () => {
  assert.equal(shouldPlayFilm(normal), true);
  for (const override of [
    { inView: false },
    { pageVisible: false },
    { reducedMotion: true },
    { saveData: true },
    { userPaused: true },
    { failed: true },
  ])
    assert.equal(shouldPlayFilm({ ...normal, ...override }), false);
});

void test('home film: explicit play respects pause, viewport exit and hidden tabs', () => {
  const state = { ...normal, reducedMotion: true, saveData: true };
  assert.equal(shouldPlayFilm(state), false);
  state.userStarted = true;
  assert.equal(shouldPlayFilm(state), true);
  state.inView = false;
  assert.equal(shouldPlayFilm(state), false);
  state.inView = true;
  state.pageVisible = false;
  assert.equal(shouldPlayFilm(state), false);
  state.pageVisible = true;
  assert.equal(shouldPlayFilm(state), true);
  state.userPaused = true;
  assert.equal(shouldPlayFilm(state), false);
  state.inView = false;
  state.inView = true;
  assert.equal(
    shouldPlayFilm(state),
    false,
    'scrolling back must not undo user pause',
  );
  state.userPaused = false;
  state.failed = true;
  assert.equal(shouldPlayFilm(state), false);
});

void test('home film: original framing, fallback, silent inline playback and accessible controls', () => {
  const component = readFileSync('components/site/HomeFilm.tsx', 'utf8');
  const markup = component.slice(component.indexOf('<video'));
  assert.match(markup, /preload="none"/);
  assert.doesNotMatch(markup, /\bsrc=|autoPlay/);
  for (const attribute of ['muted', 'loop', 'playsInline', 'poster=']) {
    assert.ok(markup.includes(attribute));
  }
  assert.match(component, /Pause film/);
  assert.match(component, /Play film/);
  assert.match(component, /aria-controls="planeon-home-film"/);
  assert.match(component, /Film unavailable/);
  assert.match(component, /className="sr-only"/);
  assert.match(component, /visibilitychange/);
  assert.match(component, /observer\?\.disconnect\(\)/);
  assert.match(component, /currentAttempt !== attempt/);
  assert.match(
    readFileSync('app/home-film.css', 'utf8'),
    /object-fit: contain/,
  );
  const page = readFileSync('app/page.tsx', 'utf8');
  assert.ok(page.indexOf('<HomeFilm />') < page.indexOf('<h1>'));
  assert.match(page, /id="home-introduction"/);
  assert.equal(page.match(/<h1>/g)?.length, 1);
});

void test('home film: self-hosted web copies have fast-start metadata and bounded sizes', () => {
  for (const [file, budget] of [
    ['planeon-introduction.mp4', 2_000_000],
    ['planeon-introduction-mobile.mp4', 800_000],
  ] as const) {
    const bytes = readFileSync(`public/media/${file}`);
    assert.ok(bytes.length < budget, file);
    const boxes: string[] = [];
    for (let offset = 0; offset < bytes.length;) {
      const size = bytes.readUInt32BE(offset);
      assert.ok(size >= 8 && offset + size <= bytes.length, 'valid MP4 box');
      boxes.push(bytes.toString('ascii', offset + 4, offset + 8));
      offset += size;
    }
    assert.equal(boxes[0], 'ftyp');
    assert.ok(boxes.includes('moov') && boxes.includes('mdat'));
    assert.ok(boxes.indexOf('moov') < boxes.indexOf('mdat'));
  }
  assert.ok(
    statSync('public/media/planeon-introduction-poster.jpg').size < 100_000,
  );
});
