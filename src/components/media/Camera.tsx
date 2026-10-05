import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { evalShake, evalZoom } from "../../lib/camera";
import type { Shake, Zoom } from "../../spec/types";

/**
 * Virtual camera over its children: punch-ins, smooth zooms, shakes.
 * Times are relative to the enclosing Sequence (scene).
 */
export const Camera: React.FC<{
  zooms?: Zoom[];
  shakes?: Shake[];
  /** Extra constant scale multiplier (e.g. freeze-frame push-in). */
  extraScale?: number;
  children: React.ReactNode;
}> = ({ zooms, shakes, extraScale = 1, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const z = evalZoom(zooms, t);
  const sh = evalShake(shakes, t, frame);
  // Zoom towards focus point: translate so (x,y) moves to centre proportionally.
  const scale = z.scale * extraScale;
  const tx = (0.5 - z.x) * (scale - 1) * 100;
  const ty = (0.5 - z.y) * (scale - 1) * 100;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${sh.dx}px, ${sh.dy}px) rotate(${sh.rot}deg) translate(${tx}%, ${ty}%) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
