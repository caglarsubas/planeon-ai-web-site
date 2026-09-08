'use client';

/* oxlint-disable next/no-html-link-for-pages -- Preserve native navigation in the Sites runtime. */
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ArrowDown } from 'lucide-react';
import { shouldPlayFilm, type FilmPlaybackState } from '@/lib/film-playback';

type DataConnection = EventTarget & { saveData?: boolean };

/** A silent, self-hosted opener; preferences are checked before loading video. */
export function HomeFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: DataConnection }
    ).connection;
    const state: FilmPlaybackState = {
      inView: !('IntersectionObserver' in window),
      pageVisible: !document.hidden,
      reducedMotion: motion.matches,
      saveData: connection?.saveData === true,
      userPaused: false,
      userStarted: false,
      failed: false,
    };
    // Select once, not on resize: never restart a sentence being read.
    const source = window.matchMedia('(max-width: 700px)').matches
      ? '/media/planeon-introduction-mobile.mp4?v=20260908-your'
      : '/media/planeon-introduction.mp4?v=20260908-your';
    let disposed = false;
    let attempt = 0;
    const reconcile = () => {
      const currentAttempt = ++attempt;
      if (!shouldPlayFilm(state)) {
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = source;
      video.muted = true;
      void video.play().catch(() => {
        if (disposed || currentAttempt !== attempt) return;
        // Autoplay denial is recoverable through explicit play, not a retry loop.
        state.userPaused = true;
        setPlaying(false);
      });
    };
    const visibilityChanged = () => {
      state.pageVisible = !document.hidden;
      reconcile();
    };
    const preferencesChanged = () => {
      state.reducedMotion = motion.matches;
      state.saveData = connection?.saveData === true;
      state.userStarted = false;
      reconcile();
    };
    const onPlaying = () => {
      if (!shouldPlayFilm(state)) video.pause();
      else setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onError = () => {
      state.failed = true;
      reconcile();
      setFailed(true);
      setPlaying(false);
    };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);
    document.addEventListener('visibilitychange', visibilityChanged);
    motion.addEventListener('change', preferencesChanged);
    connection?.addEventListener('change', preferencesChanged);
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([entry]) => {
              state.inView =
                entry.isIntersecting && entry.intersectionRatio >= 0.15;
              reconcile();
            },
            { threshold: 0.15 },
          )
        : null;
    observer?.observe(video);
    toggleRef.current = () => {
      if (shouldPlayFilm(state)) state.userPaused = true;
      else {
        state.userPaused = false;
        state.userStarted = true;
      }
      reconcile();
    };
    setReady(true);
    reconcile();
    return () => {
      disposed = true;
      attempt++;
      toggleRef.current = null;
      observer?.disconnect();
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', visibilityChanged);
      motion.removeEventListener('change', preferencesChanged);
      connection?.removeEventListener('change', preferencesChanged);
      video.pause();
    };
  }, []);

  return (
    <figure className="home-film" aria-label="Planeon introduction film">
      <div className="home-film-stage">
        <video
          ref={videoRef}
          id="planeon-home-film"
          width={1280}
          height={720}
          poster="/media/planeon-introduction-poster.jpg"
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <figcaption className="home-film-bar">
        <span className="home-film-label">
          Planeon <span>/</span> Agentic transformation
        </span>
        <p className="sr-only">
          A ten-second film travels through a data centre with animated system
          diagrams. Its message: Agentify your organization for faster, better
          decisions with reliable, resilient and responsible AI, supported by
          Planeon expertise. The film is silent; the website introduction is
          also available as persistent text beside the film.
        </p>
        <div className="home-film-actions">
          <button
            type="button"
            onClick={() => toggleRef.current?.()}
            aria-controls="planeon-home-film"
            disabled={!ready || failed}
          >
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {failed ? 'Film unavailable' : playing ? 'Pause film' : 'Play film'}
          </button>
          <a href="#exchange-title">
            See a workflow <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
