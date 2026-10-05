import type { ReelSpec } from "./types";

export type SceneSlot = { index: number; from: number; frames: number };

/** Lay scenes out back-to-back. Each scene's frame count is rounded once. */
export const layoutScenes = (spec: ReelSpec, fps: number): { slots: SceneSlot[]; total: number } => {
  let from = 0;
  const slots = spec.scenes.map((s, index) => {
    const frames = Math.max(1, Math.round(s.duration * fps));
    const slot = { index, from, frames };
    from += frames;
    return slot;
  });
  return { slots, total: Math.max(1, from) };
};

/** Human-readable timeline (seconds, type, note) — handy for reviewing pacing. */
export const describeTimeline = (spec: ReelSpec, fps: number) => {
  const { slots, total } = layoutScenes(spec, fps);
  const rows = slots.map(({ index, from, frames }) => {
    const s = spec.scenes[index];
    return `${(from / fps).toFixed(2).padStart(6)}s  +${(frames / fps).toFixed(2)}s  ${s.type.padEnd(6)} ${s.note ?? ""}`;
  });
  return [...rows, `total: ${(total / fps).toFixed(2)}s`].join("\n");
};
