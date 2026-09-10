import { bySource, harnesses, ringOrder } from './harness';
import type { Endpoint, Frame } from './scenarios';

// Presentation geometry and pacing only. Neither changes scenario evidence or timings.
export const onionGeometry = { cx: 550, cy: 600, core: 135, ring: 87 };
export type Point = { x: number; y: number };
export function polar(radius: number, degrees: number): Point {
  const angle = (degrees * Math.PI) / 180;
  return {
    x: 550 + radius * Math.cos(angle),
    y: 600 + radius * Math.sin(angle),
  };
}
export function sectorFor(sourceId: number) {
  const harness = bySource(sourceId)!;
  const ring = ringOrder.indexOf(harness.plane);
  const quadrant = harnesses
    .filter((h) => h.plane === harness.plane)
    .findIndex((h) => h.sourceId === sourceId);
  const angle = -90 + quadrant * 90;
  const direction = quadrant === 0 || quadrant === 3 ? 1 : -1;
  const inner = onionGeometry.core + ring * onionGeometry.ring;
  const radius = inner + onionGeometry.ring / 2;
  return {
    inner,
    outer: inner + onionGeometry.ring,
    radius,
    angle,
    direction,
    point: polar(radius, angle - direction * 30),
  };
}
export function endpointPoint(id: Endpoint): Point | undefined {
  if (typeof id === 'number')
    return bySource(id) ? sectorFor(id).point : undefined;
  return (
    {
      core: { x: 550, y: 600 },
      user: { x: 550, y: 50 },
      trig: { x: 195, y: 50 },
      ext: { x: 550, y: 1147 },
    } as Record<string, Point>
  )[id];
}
const xy = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
export function circleArc(radius: number, start: number, end: number) {
  return `M${xy(polar(radius, start))} A${radius},${radius} 0 0 ${end > start ? 1 : 0} ${xy(polar(radius, end))}`;
}
export function sectorPath(id: number) {
  const { inner, outer, angle } = sectorFor(id),
    a = angle - 43.7,
    b = angle + 43.7;
  return `M${xy(polar(outer - 1, a))} A${outer - 1},${outer - 1} 0 0 1 ${xy(polar(outer - 1, b))} L${xy(polar(inner + 1, b))} A${inner + 1},${inner + 1} 0 0 0 ${xy(polar(inner + 1, a))} Z`;
}
export type HandoffRoute = {
  start: Point;
  control: Point;
  end: Point;
  d: string;
  core: boolean;
};
export function pointOnRoute(
  route: Pick<HandoffRoute, 'start' | 'control' | 'end'>,
  t: number,
): Point {
  const u = 1 - t;
  return {
    x:
      u * u * route.start.x + 2 * u * t * route.control.x + t * t * route.end.x,
    y:
      u * u * route.start.y + 2 * u * t * route.control.y + t * t * route.end.y,
  };
}
export function handoffRoute(
  from: Endpoint,
  to: Endpoint,
  lane = 0,
): HandoffRoute | null {
  const a = endpointPoint(from),
    b = endpointPoint(to);
  if (!a || !b || from === to) return null;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    len = Math.hypot(dx, dy);
  const core = from === 'core' || to === 'core';
  const trim = (id: Endpoint) =>
    id === 'core' ? onionGeometry.core + 5 : typeof id === 'number' ? 17 : 24;
  const start = {
    x: a.x + (dx / len) * trim(from),
    y: a.y + (dy / len) * trim(from),
  };
  const end = {
    x: b.x - (dx / len) * trim(to),
    y: b.y - (dy / len) * trim(to),
  };
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  // Opposite directions naturally bow to opposite sides. Fan-out lanes remain distinct.
  const normal = { x: -dy / len, y: dx / len };
  const centreSide = (mid.x - 550) * normal.x + (mid.y - 600) * normal.y;
  const side = centreSide < -1 ? -1 : 1;
  let bend = (core ? 0 : 30) + lane * 22;
  let control = {
    x: mid.x + normal.x * side * bend,
    y: mid.y + normal.y * side * bend,
  };
  if (!core) {
    // Check the whole curve, not just its midpoint: no ordinary exchange crosses the model.
    for (let attempt = 0; attempt < 60; attempt++) {
      let nearest = Infinity;
      for (let i = 0; i <= 100; i++) {
        const p = pointOnRoute({ start, control, end }, i / 100);
        nearest = Math.min(nearest, Math.hypot(p.x - 550, p.y - 600));
      }
      if (nearest >= onionGeometry.core + 18) break;
      bend += 18;
      control = {
        x: mid.x + normal.x * side * bend,
        y: mid.y + normal.y * side * bend,
      };
    }
  }
  return {
    start,
    control,
    end,
    core,
    d: `M${xy(start)} Q${xy(control)} ${xy(end)}`,
  };
}
export const motionPhases = {
  PH1: {
    title: 'Establish the task',
    short: 'Ingress',
    color: 'var(--runtime)',
  },
  PH2: {
    title: 'Plan, reason and act',
    short: 'Work loop',
    color: 'var(--execution)',
  },
  PH3: {
    title: 'Record and respond',
    short: 'Egress',
    color: 'var(--knowledge)',
  },
  PH4: {
    title: 'Observe and improve',
    short: 'Beyond the task',
    color: 'var(--trust)',
  },
} as const;
export function motionTiming(frame: Frame) {
  const live = frame.steps.filter((s) => !s.skipped && !s.branchNotTaken);
  const words = live
    .map((s) => s.story)
    .join(' ')
    .trim()
    .split(/\s+/).length;
  const travel = live.length ? 900 : 0;
  const hold = live.length
    ? Math.min(6200, Math.max(2400, 1200 + words * 55))
    : 1800;
  return { travel, hold, total: travel + hold };
}
export type MotionState = {
  elapsed: number;
  started: boolean;
  manual: boolean;
};
export function advanceMotion(
  state: MotionState,
  delta: number,
  speed: number,
  playing: boolean,
  travel: number,
  total: number,
) {
  if (!playing && !state.manual) return state;
  const end = playing ? total : travel;
  const elapsed = Math.min(end, state.elapsed + Math.max(0, delta) * speed);
  return { elapsed, started: true, manual: state.manual && elapsed < travel };
}
