/** Original decorative flow geometry; no scenario or maturity data is involved. */
export const FLOW_PREFERENCE_KEY = 'planeon-background-motion';
export const FLOW_FPS = 30;
export const FLOW_CYCLE_SECONDS = 36;

export type FlowPoint = { x: number; y: number };
export type FlowRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export type FlowDot = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  band: number;
  accent: boolean;
  opacity: number;
};
export type FlowState = {
  inView: boolean;
  visible: boolean;
  paused: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  printing: boolean;
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export const readFlowPause = (value: string | null) => value === 'paused';
export const shouldAnimateFlow = (state: FlowState) =>
  state.inView &&
  state.visible &&
  !state.paused &&
  !state.reducedMotion &&
  !state.saveData &&
  !state.printing;

export function createFlowDots(compact: boolean): FlowDot[] {
  // Seeded positions keep reload, resize and reduced-motion composition stable.
  let seed = 190926;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const count = compact ? 32 : 84;
  return Array.from({ length: count }, (_, i) => ({
    x: (i + random()) / count,
    y: 0.05 + random() * 0.9,
    radius: i % 13 === 0 ? 3.6 : 1.2 + random() * 1.25,
    phase: random() * Math.PI * 2,
    speed: 0.0018 + random() * 0.0022,
    band: (i % 3) - 1,
    accent: i % 8 === 0,
    opacity: 0.55 + random() * 0.45,
  }));
}

export function flowPosition(
  dot: FlowDot,
  seconds: number,
  width: number,
  height: number,
): FlowPoint {
  const u = (dot.x + seconds * dot.speed) % 1;
  const loose = dot.y + Math.sin(seconds * 0.12 + dot.phase) * 0.035;
  const stream =
    0.5 +
    dot.band * 0.23 +
    Math.sin(u * Math.PI * 1.6 + seconds * 0.035) * 0.16;
  const gathering =
    (1 - Math.cos((seconds * Math.PI * 2) / FLOW_CYCLE_SECONDS)) * 0.38;
  return { x: u * width, y: (loose + (stream - loose) * gathering) * height };
}

export function displaceFromPointer(
  point: FlowPoint,
  pointer: FlowPoint | null,
): FlowPoint {
  if (!pointer) return point;
  const dx = point.x - pointer.x,
    dy = point.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.001 || distance >= 110) return point;
  const displacement = 16 * (1 - distance / 110) ** 2;
  return {
    x: point.x + (dx / distance) * displacement,
    y: point.y + (dy / distance) * displacement,
  };
}

/** Fade before, not over, reading blocks, the film, controls and field edges. */
export function flowOpacity(
  point: FlowPoint,
  radius: number,
  width: number,
  height: number,
  clear: FlowRect[],
): number {
  let opacity = smooth(
    Math.min(point.x, width - point.x, point.y, height - point.y) / 42,
  );
  for (const rect of clear) {
    const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
    const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
    opacity = Math.min(
      opacity,
      smooth((Math.hypot(dx, dy) - 18 - radius) / 28),
    );
  }
  return opacity;
}

export function flowCanvasSize(
  width: number,
  height: number,
  pixelRatio: number,
) {
  const w = Math.max(1, width),
    h = Math.max(1, height);
  const scale = Math.min(
    2,
    Math.max(1, pixelRatio),
    Math.sqrt(2_000_000 / (w * h)),
  );
  return {
    width: Math.max(1, Math.floor(w * scale)),
    height: Math.max(1, Math.floor(h * scale)),
    scale,
  };
}

/** One cancellable clock: pause/visibility changes freeze rather than skip time. */
export function createFlowPlayer(
  draw: (seconds: number) => void,
  request: (callback: (now: number) => void) => number,
  cancel: (id: number) => void,
) {
  let active = false,
    disposed = false,
    frame: number | null = null;
  let last: number | null = null,
    lastPaint = -Infinity,
    elapsed = 0;
  const tick = (now: number) => {
    frame = null;
    if (!active || disposed) return;
    if (last !== null) elapsed += Math.min(80, Math.max(0, now - last)) / 1000;
    last = now;
    if (now - lastPaint >= 1000 / FLOW_FPS - 0.1) {
      draw(elapsed);
      lastPaint = now;
    }
    if (active && !disposed) frame = request(tick);
  };
  const setActive = (next: boolean) => {
    if (disposed || next === active) return;
    active = next;
    last = null;
    lastPaint = -Infinity;
    if (frame !== null) cancel(frame);
    frame = next ? request(tick) : null;
  };
  return {
    setActive,
    redraw: () => {
      if (!disposed) draw(elapsed);
    },
    dispose: () => {
      setActive(false);
      disposed = true;
    },
  };
}
