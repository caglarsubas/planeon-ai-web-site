/** Original decorative flow geometry; no scenario or maturity data is involved. */
export const FLOW_PREFERENCE_KEY = 'planeon-background-motion';
export const FLOW_FPS = 30;
export const FLOW_CYCLE_SECONDS = 6;
export const FLOW_ALPHA_STEPS = 12;
const FLOW_BANDS = 3;

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
  speed: number;
  band: number;
  depth: number;
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
  // Fine, staggered rows form three folded sheets, not isolated strings of dots.
  const rows = compact ? 8 : 12;
  const columns = compact ? 64 : 160;
  return Array.from({ length: FLOW_BANDS * rows * columns }, (_, i) => {
    const band = Math.floor(i / (rows * columns));
    const row = Math.floor(i / columns) % rows;
    const depth = (2 * row) / (rows - 1) - 1;
    return {
      x:
        (((i % columns) +
          0.5 +
          (row % 2) * 0.4 +
          band * 0.18 +
          (random() - 0.5) * 0.16) /
          columns) %
        1,
      y: 0.18 + band * 0.32 + (random() - 0.5) * 0.004,
      radius: i % 83 === 0 ? 1.8 : 0.65 + random() * 0.5,
      // A shared drift within each sheet preserves close spacing over time.
      speed: 0.018 + band * 0.002,
      band,
      depth,
      accent: band === 1,
      opacity: 0.3 + 0.65 * (1 - Math.abs(depth)) ** 0.6,
    };
  });
}

/** Shared phase travels right; the smaller harmonic adds a soft secondary ripple. */
export function flowWaveOffset(u: number, seconds: number, band: number) {
  const phase = Math.PI * 2 * (u - seconds / FLOW_CYCLE_SECONDS) + band * 0.6;
  return Math.sin(phase) + Math.sin(phase * 2 + band * 0.27 + 0.65) * 0.3;
}

export function flowPosition(
  dot: FlowDot,
  seconds: number,
  width: number,
  height: number,
): FlowPoint {
  const u = (dot.x + seconds * dot.speed) % 1;
  const amplitude = Math.min(64, height * 0.075);
  const phase =
    Math.PI * 2 * (u - seconds / FLOW_CYCLE_SECONDS) + dot.band * 0.6;
  const spread = height * (0.038 + 0.018 * Math.cos(phase)) * dot.depth;
  return {
    x: u * width,
    y:
      dot.y * height +
      flowWaveOffset(u + dot.depth * 0.025, seconds, dot.band) * amplitude +
      spread,
  };
}

/** Quantize paint, not geometry: at most 24 canvas fills regardless of density. */
export function flowPaintBucket(weight: number, accent: boolean): number {
  if (!Number.isFinite(weight) || weight < 1 / (2 * FLOW_ALPHA_STEPS))
    return -1;
  return (
    Math.min(
      FLOW_ALPHA_STEPS - 1,
      Math.floor(clamp(weight) * FLOW_ALPHA_STEPS),
    ) + (accent ? FLOW_ALPHA_STEPS : 0)
  );
}

type FlowPaintContext = Pick<
  CanvasRenderingContext2D,
  'globalAlpha' | 'fillStyle' | 'beginPath' | 'moveTo' | 'arc' | 'fill'
>;

export function paintFlowGroups(
  ctx: FlowPaintContext,
  groups: readonly number[][],
  blue: string,
  teal: string,
  opacity: number,
) {
  for (let bucket = 0; bucket < groups.length; bucket++) {
    const group = groups[bucket];
    if (!group.length) continue;
    ctx.globalAlpha =
      (((bucket % FLOW_ALPHA_STEPS) + 0.5) / FLOW_ALPHA_STEPS) * opacity;
    ctx.fillStyle = bucket >= FLOW_ALPHA_STEPS ? teal : blue;
    ctx.beginPath();
    for (let i = 0; i < group.length; i += 3) {
      const x = group[i],
        y = group[i + 1],
        radius = group[i + 2];
      // Separate subpaths prevent accidental connecting lines between particles.
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Time-based, non-overshooting response: enter, hold and settle use one local offset. */
export function easeFlowOffset(
  current: FlowPoint,
  target: FlowPoint,
  deltaSeconds: number,
): FlowPoint {
  const blend = 1 - Math.exp(-Math.min(0.1, Math.max(0, deltaSeconds)) / 0.1);
  return {
    x: current.x + (target.x - current.x) * blend,
    y: current.y + (target.y - current.y) * blend,
  };
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
