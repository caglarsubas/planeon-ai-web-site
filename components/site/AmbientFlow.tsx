'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FLOW_PREFERENCE_KEY,
  FLOW_ALPHA_STEPS,
  createFlowDots,
  createFlowPlayer,
  displaceFromPointer,
  easeFlowOffset,
  flowCanvasSize,
  flowOpacity,
  flowPaintBucket,
  flowPosition,
  paintFlowGroups,
  readFlowPause,
  shouldAnimateFlow,
  type FlowPoint,
  type FlowRect,
  type FlowState,
} from '@/lib/ambient-flow';

/** Decorative only: text, navigation and video remain separate native elements. */
export function AmbientFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [ui, setUi] = useState({
    ready: false,
    paused: false,
    constrained: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const scope = canvas?.closest<HTMLElement>('.business-opening');
    const controls = controlsRef.current;
    if (!canvas || !scope || !controls) return;
    let context: CanvasRenderingContext2D | null;
    try {
      context = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!context) return;
    const ctx = context;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const observesVisibility = typeof IntersectionObserver === 'function';
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    const state: FlowState = {
      inView: false,
      visible: !document.hidden,
      paused: false,
      reducedMotion: motion.matches,
      saveData: connection?.saveData === true,
      printing: false,
    };
    try {
      state.paused = readFlowPause(localStorage.getItem(FLOW_PREFERENCE_KEY));
    } catch {
      /* Device preference is optional. */
    }
    let disposed = false,
      width = 0,
      height = 0,
      originX = 0,
      originY = 0;
    let clear: FlowRect[] = [],
      dots = createFlowDots(compact.matches);
    let pointerTarget: FlowPoint | null = null;
    let offsets = dots.map(() => ({ x: 0, y: 0 }));
    let lastPaintSeconds = 0;
    const paintGroups = Array.from(
      { length: FLOW_ALPHA_STEPS * 2 },
      () => [] as number[],
    );
    const resetPointer = () => {
      pointerTarget = null;
      offsets = dots.map(() => ({ x: 0, y: 0 }));
    };
    let blue = '#3a6ff7',
      teal = '#149a84',
      opacity = 0.42;
    const protectedElements = [
      ...scope.querySelectorAll<HTMLElement>('[data-flow-clear], .home-film'),
      controls,
    ];
    const paint = (seconds: number) => {
      if (
        disposed ||
        !width ||
        !height ||
        !state.inView ||
        !state.visible ||
        state.printing
      )
        return;
      const delta = Math.max(0, seconds - lastPaintSeconds);
      lastPaintSeconds = seconds;
      const moving = shouldAnimateFlow(state);
      ctx.clearRect(0, 0, width, height);
      for (const group of paintGroups) group.length = 0;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const base = flowPosition(dot, seconds, width, height);
        if (moving) {
          if (pointerTarget || offsets[i].x !== 0 || offsets[i].y !== 0) {
            const target = displaceFromPointer(base, pointerTarget);
            offsets[i] = easeFlowOffset(
              offsets[i],
              { x: target.x - base.x, y: target.y - base.y },
              delta,
            );
            if (
              !pointerTarget &&
              Math.hypot(offsets[i].x, offsets[i].y) < 0.001
            ) {
              offsets[i] = { x: 0, y: 0 };
            }
          }
        }
        const point = { x: base.x + offsets[i].x, y: base.y + offsets[i].y };
        const bucket = flowPaintBucket(
          flowOpacity(point, dot.radius, width, height, clear) * dot.opacity,
          dot.accent,
        );
        if (bucket < 0) continue;
        paintGroups[bucket].push(point.x, point.y, dot.radius);
      }
      paintFlowGroups(ctx, paintGroups, blue, teal, opacity);
    };
    const player = createFlowPlayer(
      paint,
      (cb) => requestAnimationFrame(cb),
      (id) => cancelAnimationFrame(id),
    );
    const sync = () => {
      if (disposed) return;
      player.setActive(shouldAnimateFlow(state));
      setUi({
        ready: true,
        paused: state.paused,
        constrained: state.reducedMotion || state.saveData,
      });
      player.redraw();
    };
    const measure = () => {
      if (disposed) return;
      const bounds = canvas.getBoundingClientRect();
      const resized = bounds.width !== width || bounds.height !== height;
      const moved = bounds.left !== originX || bounds.top !== originY;
      width = bounds.width;
      height = bounds.height;
      originX = bounds.left;
      originY = bounds.top;
      const size = flowCanvasSize(width, height, window.devicePixelRatio || 1);
      canvas.width = size.width;
      canvas.height = size.height;
      ctx.setTransform(size.scale, 0, 0, size.scale, 0, 0);
      clear = protectedElements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - bounds.left,
          top: rect.top - bounds.top,
          right: rect.right - bounds.left,
          bottom: rect.bottom - bounds.top,
        };
      });
      // A changing Pause/Resume label must not reset a held particle displacement.
      if (resized) resetPointer();
      else if (moved) pointerTarget = null;
      if (!observesVisibility) {
        state.inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
        player.setActive(shouldAnimateFlow(state));
      }
      player.redraw();
    };
    const paletteChanged = () => {
      const style = getComputedStyle(canvas);
      blue = style.getPropertyValue('--ambient-dot-blue').trim() || blue;
      teal = style.getPropertyValue('--ambient-dot-teal').trim() || teal;
      opacity =
        Number(style.getPropertyValue('--ambient-dot-opacity').trim()) ||
        opacity;
      player.redraw();
    };
    const preferencesChanged = () => {
      state.reducedMotion = motion.matches;
      state.saveData = connection?.saveData === true;
      dots = createFlowDots(compact.matches);
      resetPointer();
      sync();
    };
    const visibilityChanged = () => {
      state.visible = !document.hidden;
      pointerTarget = null;
      sync();
    };
    const scrollChanged = () => {
      // No layout read in the draw loop. Scrolling only updates pointer coordinates.
      if (!observesVisibility) measure();
      else if (state.inView) {
        const r = canvas.getBoundingClientRect();
        originX = r.left;
        originY = r.top;
      }
      pointerTarget = null;
    };
    const pointerMoved = (event: PointerEvent) => {
      if (
        event.pointerType !== 'mouse' ||
        !fine.matches ||
        !shouldAnimateFlow(state)
      ) {
        pointerTarget = null;
        return;
      }
      const x = event.clientX - originX,
        y = event.clientY - originY;
      pointerTarget =
        x >= 0 && x <= width && y >= 0 && y <= height ? { x, y } : null;
    };
    const pointerLeft = () => {
      // Keep each dot's displacement so leaving settles, rather than snapping back.
      pointerTarget = null;
    };
    const storageChanged = (event: StorageEvent) => {
      try {
        if (event.storageArea !== localStorage) return;
      } catch {
        return;
      }
      if (event.key !== FLOW_PREFERENCE_KEY && event.key !== null) return;
      state.paused = readFlowPause(event.newValue);
      sync();
    };
    const beforePrint = () => {
      state.printing = true;
      sync();
    };
    const afterPrint = () => {
      state.printing = false;
      measure();
      sync();
    };
    toggleRef.current = () => {
      state.paused = !state.paused;
      try {
        localStorage.setItem(
          FLOW_PREFERENCE_KEY,
          state.paused ? 'paused' : 'on',
        );
      } catch {
        /* Current-page control still works. */
      }
      sync();
    };
    const observer = observesVisibility
      ? new IntersectionObserver(([entry]) => {
          state.inView = entry.isIntersecting;
          if (state.inView) measure();
          sync();
        })
      : null;
    observer?.observe(canvas);
    const resize =
      'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    resize?.observe(scope);
    protectedElements.forEach((element) => resize?.observe(element));
    const theme = new MutationObserver(paletteChanged);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    document.addEventListener('visibilitychange', visibilityChanged);
    motion.addEventListener('change', preferencesChanged);
    compact.addEventListener('change', preferencesChanged);
    fine.addEventListener('change', preferencesChanged);
    connection?.addEventListener('change', preferencesChanged);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', scrollChanged, { passive: true });
    window.addEventListener('pointermove', pointerMoved, { passive: true });
    window.addEventListener('blur', pointerLeft);
    document.addEventListener('pointerleave', pointerLeft);
    window.addEventListener('storage', storageChanged);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    paletteChanged();
    measure();
    sync();
    void document.fonts?.ready.then(() => {
      if (!disposed) measure();
    });
    return () => {
      disposed = true;
      toggleRef.current = null;
      player.dispose();
      observer?.disconnect();
      resize?.disconnect();
      theme.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
      motion.removeEventListener('change', preferencesChanged);
      compact.removeEventListener('change', preferencesChanged);
      fine.removeEventListener('change', preferencesChanged);
      connection?.removeEventListener('change', preferencesChanged);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', scrollChanged);
      window.removeEventListener('pointermove', pointerMoved);
      window.removeEventListener('blur', pointerLeft);
      document.removeEventListener('pointerleave', pointerLeft);
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="ambient-field"
        id="home-ambient-flow"
        aria-hidden="true"
      />
      <div ref={controlsRef} className="ambient-controls" data-ready={ui.ready}>
        <Button
          variant="ghost"
          className="ambient-motion-control"
          disabled={!ui.ready || ui.constrained}
          onClick={() => toggleRef.current?.()}
          aria-controls="home-ambient-flow"
          title={
            ui.constrained
              ? 'Your device requests reduced motion or data use.'
              : undefined
          }
        >
          {ui.paused && !ui.constrained ? (
            <Play size={15} aria-hidden="true" />
          ) : (
            <Pause size={15} aria-hidden="true" />
          )}
          {ui.constrained
            ? 'Background motion off'
            : ui.paused
              ? 'Resume background motion'
              : 'Pause background motion'}
        </Button>
      </div>
    </>
  );
}
