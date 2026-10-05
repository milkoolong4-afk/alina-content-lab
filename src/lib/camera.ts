import { Easing, interpolate, random } from "remotion";
import type { Shake, Zoom } from "../spec/types";

export type CameraState = { scale: number; x: number; y: number; dx: number; dy: number; rot: number };

/**
 * Evaluate zoom keyframes at time t (seconds).
 * duration 0 → punch-in (instant), otherwise ease-out to target.
 * Zooms are absolute states: { at: 2, scale: 1 } returns to normal.
 */
export const evalZoom = (zooms: Zoom[] | undefined, t: number): Pick<CameraState, "scale" | "x" | "y"> => {
  let state = { scale: 1, x: 0.5, y: 0.5 };
  if (!zooms?.length) return state;
  const sorted = [...zooms].sort((a, b) => a.at - b.at);
  for (const z of sorted) {
    if (t < z.at) break;
    const target = { scale: z.scale, x: z.x ?? state.x, y: z.y ?? state.y };
    const d = z.duration ?? 0;
    if (d <= 0 || t >= z.at + d) {
      state = target;
    } else {
      const p = interpolate(t, [z.at, z.at + d], [0, 1], { easing: Easing.bezier(0.2, 0.9, 0.1, 1) });
      state = {
        scale: state.scale + (target.scale - state.scale) * p,
        x: state.x + (target.x - state.x) * p,
        y: state.y + (target.y - state.y) * p,
      };
    }
  }
  return state;
};

/** Evaluate camera shakes (jittery, decaying). Returns px offset + rotation. */
export const evalShake = (shakes: Shake[] | undefined, t: number, frame: number) => {
  let dx = 0;
  let dy = 0;
  let rot = 0;
  for (const s of shakes ?? []) {
    const d = s.duration ?? 0.35;
    if (t < s.at || t > s.at + d) continue;
    const decay = 1 - (t - s.at) / d;
    const k = (s.intensity ?? 1) * 28 * decay;
    dx += (random(`sx${frame}`) - 0.5) * 2 * k;
    dy += (random(`sy${frame}`) - 0.5) * 2 * k;
    rot += (random(`sr${frame}`) - 0.5) * 2 * k * 0.06;
  }
  return { dx, dy, rot };
};
