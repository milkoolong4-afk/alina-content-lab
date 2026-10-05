import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import type { Transition } from "../../spec/types";
import { color } from "../../theme/tokens";

/**
 * Entrance of a scene. Everything is 3–6 frames: these are cuts with
 * attitude, not smooth "transitions". Default is a plain hard cut.
 */
export const TransitionIn: React.FC<{ kind?: Transition; children: React.ReactNode }> = ({ kind = "cut", children }) => {
  const f = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  switch (kind) {
    case "flash":
    case "flash-orange": {
      const o = interpolate(f, [0, 1, 4], [1, 0.85, 0], clamp);
      return (
        <AbsoluteFill>
          {children}
          {f < 5 && <AbsoluteFill style={{ background: kind === "flash" ? color.white : color.orange, opacity: o }} />}
        </AbsoluteFill>
      );
    }
    case "whip": {
      const x = interpolate(f, [0, 5], [100, 0], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
      const blur = interpolate(f, [0, 5], [30, 0], clamp);
      return <AbsoluteFill style={{ transform: `translateX(${x}%)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
    }
    case "zoom": {
      const s = interpolate(f, [0, 5], [1.4, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
      return <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>;
    }
    case "drop": {
      const y = interpolate(f, [0, 4, 6], [-100, 3, 0], clamp);
      return <AbsoluteFill style={{ transform: `translateY(${y}%)` }}>{children}</AbsoluteFill>;
    }
    case "glitch": {
      if (f >= 6) return <AbsoluteFill>{children}</AbsoluteFill>;
      const dx = (random(`gx${f}`) - 0.5) * 80;
      const bars = [0, 1, 2].map((i) => ({ top: random(`gt${f}${i}`) * 100, h: 2 + random(`gh${f}${i}`) * 8, col: i % 2 ? color.orange : color.ink }));
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${dx}px)`, filter: "contrast(1.5) saturate(1.8)" }}>{children}</AbsoluteFill>
          <AbsoluteFill style={{ transform: `translateX(${-dx * 0.6}px)`, mixBlendMode: "screen", opacity: 0.5, background: color.orange }} />
          {bars.map((b, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${b.top}%`, height: `${b.h}%`, background: b.col }} />
          ))}
        </AbsoluteFill>
      );
    }
    default:
      return <AbsoluteFill>{children}</AbsoluteFill>;
  }
};
