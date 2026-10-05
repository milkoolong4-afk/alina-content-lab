import { staticFile } from "remotion";

const VIDEO_EXT = /\.(mp4|mov|m4v|webm|mkv)$/i;
const GIF_EXT = /\.gif$/i;

export const isDemo = (src: string) => src.startsWith("demo:");
export const isVideo = (src: string) => VIDEO_EXT.test(src.split("?")[0]);
export const isGif = (src: string) => GIF_EXT.test(src.split("?")[0]);

/** Resolve a spec path (relative to /public) or a URL into something playable. */
export const resolveSrc = (src: string): string => {
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return staticFile(src.replace(/^\/+/, "").replace(/^public\//, ""));
};
