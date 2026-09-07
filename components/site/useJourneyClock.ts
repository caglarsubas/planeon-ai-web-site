'use client';
import { useEffect, useMemo, useRef } from 'react';
import {
  advanceMotion,
  motionTiming,
  type MotionState,
} from '@/lib/journey-motion';
import type { Frame } from '@/lib/scenarios';

export type JourneyTick = {
  elapsed: number;
  travel: number;
  total: number;
  running: boolean;
};
export type JourneyClock = {
  subscribe: (fn: (tick: JourneyTick) => void) => () => void;
};
// One presentation clock owns both path travel and advancement. No React render per frame.
export function useJourneyClock({
  enabled,
  frame,
  playing,
  speed,
  manualRevision,
  resetRevision,
  canAdvance,
  onAdvance,
  onStop,
}: {
  enabled: boolean;
  frame: Frame;
  playing: boolean;
  speed: number;
  manualRevision: number;
  resetRevision: number;
  canAdvance: boolean;
  onAdvance: () => void;
  onStop: () => void;
}): JourneyClock {
  const state = useRef<MotionState>({
    elapsed: 0,
    started: false,
    manual: false,
  });
  const identity = useRef('');
  const revision = useRef(manualRevision);
  const callbacks = useRef({ onAdvance, onStop });
  useEffect(() => {
    callbacks.current = { onAdvance, onStop };
  }, [onAdvance, onStop]);
  const listeners = useRef(new Set<(tick: JourneyTick) => void>());
  const latest = useRef<JourneyTick>({
    elapsed: 900,
    travel: 900,
    total: 3300,
    running: false,
  });
  const clock = useMemo(
    () => ({
      subscribe(fn: (tick: JourneyTick) => void) {
        listeners.current.add(fn);
        fn(latest.current);
        return () => {
          listeners.current.delete(fn);
        };
      },
    }),
    [],
  );
  useEffect(() => {
    if (!enabled) return;
    const { travel, total } = motionTiming(frame);
    const manual = revision.current !== manualRevision;
    const frameIdentity = `${frame.id}:${resetRevision}`;
    if (identity.current !== frameIdentity || manual) {
      state.current = {
        elapsed: playing || manual ? 0 : travel,
        started: playing || manual,
        manual,
      };
      identity.current = frameIdentity;
      revision.current = manualRevision;
    }
    if (playing && !state.current.started)
      state.current = { elapsed: 0, started: true, manual: false };
    const publish = () => {
      latest.current = {
        elapsed: state.current.elapsed,
        travel,
        total,
        running: playing || state.current.manual,
      };
      listeners.current.forEach((fn) => fn(latest.current));
    };
    publish();
    if (!playing && !state.current.manual) return;
    let raf = 0,
      last = performance.now(),
      stopped = false;
    function tick(now: number) {
      // Hidden-tab time is never treated as watched time.
      if (document.hidden) {
        callbacks.current.onStop();
        return;
      }
      state.current = advanceMotion(
        state.current,
        Math.min(now - last, 100),
        speed,
        playing,
        travel,
        total,
      );
      last = now;
      publish();
      const finished =
        state.current.elapsed >= (playing && canAdvance ? total : travel);
      if (finished) {
        state.current.manual = false;
        if (playing && !stopped) {
          stopped = true;
          if (canAdvance) callbacks.current.onAdvance();
          else callbacks.current.onStop();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    enabled,
    frame,
    playing,
    speed,
    manualRevision,
    resetRevision,
    canAdvance,
  ]);
  return clock;
}
