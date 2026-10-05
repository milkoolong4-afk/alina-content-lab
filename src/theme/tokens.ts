/**
 * Alina Content Lab — visual tokens.
 *
 * Personal internet-blog look: loud orange, near-black navy ink, off-white
 * paper. Deliberately small palette — the chaos comes from editing, not from
 * colour soup. This project has its own identity and does NOT borrow anything
 * from Kedice's design system.
 */

export const color = {
  orange: "#FF5A1F",
  orangeDeep: "#E8430A",
  ink: "#0D1230", // near-black navy — main text colour
  inkSoft: "#2A3157",
  paper: "#F4F0E8", // warm off-white background
  white: "#FFFFFF",
  black: "#000000",
  // Utility colours — use sparingly, only where meaning demands it.
  alert: "#FF2E3A", // errors, FAIL stamps
  marker: "#FFE45C", // highlighter swipe
  ok: "#1FCB6B", // rare "it worked" moments
} as const;

export type ColorName = keyof typeof color;

/** Resolve a token name or pass through a raw CSS colour. */
export const c = (value: ColorName | string | undefined, fallback: string = color.ink): string => {
  if (!value) return fallback;
  return (color as Record<string, string>)[value] ?? value;
};

/** Video format: vertical 9:16. */
export const format = {
  width: 1080,
  height: 1920,
  fps: 30,
  defaultSeconds: 32,
} as const;

/**
 * Safe zones (px) — where Reels / TikTok / Shorts UI does NOT cover the frame.
 * Keep important text inside. Bottom is the biggest (caption + buttons).
 */
export const safe = {
  top: 220,
  bottom: 400,
  left: 72,
  right: 150, // like / comment / share column
} as const;

export const radius = { s: 12, m: 24, l: 44 } as const;

/** Type scale for 1080px width. Big and short. */
export const size = {
  mega: 210,
  huge: 160,
  xl: 118,
  l: 88,
  m: 64,
  s: 46,
  xs: 34,
  caption: 58,
} as const;

/** Hard shadow — sticker / print feel, never soft glow. */
export const hardShadow = (offset = 10, col: string = color.ink) => `${offset}px ${offset}px 0 ${col}`;
