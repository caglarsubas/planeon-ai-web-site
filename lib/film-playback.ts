export type FilmPlaybackState = {
  inView: boolean;
  pageVisible: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  userPaused: boolean;
  userStarted: boolean;
  failed: boolean;
};

/** Explicit play may override motion/data preferences, never visibility or pause. */
export function shouldPlayFilm(state: FilmPlaybackState): boolean {
  return (
    state.inView &&
    state.pageVisible &&
    !state.failed &&
    !state.userPaused &&
    (state.userStarted || (!state.reducedMotion && !state.saveData))
  );
}
