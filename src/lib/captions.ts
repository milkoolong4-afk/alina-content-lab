import type { CaptionLine } from "../spec/types";

/**
 * Word-level caption from a transcriber. Same shape as `Caption` in
 * @remotion/captions (what Whisper via @remotion/install-whisper-cpp produces),
 * so its JSON can be imported directly — no extra dependency needed here.
 */
export type WordCaption = { text: string; startMs: number; endMs: number };

/**
 * Group transcribed words into caption chunks for mode "words".
 * - breaks on a pause ≥ `gap` seconds, on sentence punctuation, or after `maxWords`
 * - `keys`: words (lowercase, without punctuation) to mark as *key* (scaled up)
 * - `offset`: seconds where the voice-over starts in the reel
 */
export const linesFromWords = (
  words: WordCaption[],
  opts: { maxWords?: number; gap?: number; keys?: string[]; offset?: number } = {},
): CaptionLine[] => {
  const { maxWords = 3, gap = 0.35, keys = [], offset = 0 } = opts;
  const keySet = new Set(keys.map((k) => k.toLowerCase()));
  const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const out: CaptionLine[] = [];
  let cur: WordCaption[] = [];

  const flush = () => {
    if (!cur.length) return;
    out.push({
      text: cur.map((w) => (keySet.has(clean(w.text)) ? `*${w.text.trim()}*` : w.text.trim())).join(" "),
      start: offset + cur[0].startMs / 1000,
      end: offset + cur[cur.length - 1].endMs / 1000,
      words: cur.map((w) => offset + w.startMs / 1000),
    });
    cur = [];
  };

  words.forEach((w, i) => {
    if (!w.text.trim()) return;
    const prev = words[i - 1];
    if (cur.length && prev && (w.startMs - prev.endMs) / 1000 >= gap) flush();
    cur.push(w);
    if (cur.length >= maxWords || /[.!?…]$/.test(w.text.trim())) flush();
  });
  flush();

  // Let each chunk stay until the next one starts (no flicker between words).
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.max(out[i].end, out[i + 1].start);
  return out;
};
