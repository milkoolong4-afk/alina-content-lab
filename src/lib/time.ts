import { useVideoConfig } from "remotion";

/** Seconds → frames (rounded). */
export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);

/** Hook version: const s = useSec(); s(1.5) → 45 */
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (seconds: number) => sec(seconds, fps);
};
