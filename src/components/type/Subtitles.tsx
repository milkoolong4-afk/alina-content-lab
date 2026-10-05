import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionsConfig } from "../../spec/types";
import { color, safe, size } from "../../theme/tokens";
import { font } from "../../theme/fonts";
import { parseMarkup, tokenStyle } from "./Markup";

/**
 * Burned-in subtitles for voice-over. Short chunks (2–5 words) work best.
 * Times are absolute (seconds from reel start).
 */
export const Subtitles: React.FC<CaptionsConfig> = ({ lines, style = "box", y = 0.68 }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const line = lines.find((l) => t >= l.start && t < l.end);
  if (!line) return null;

  const local = frame - Math.round(line.start * fps);
  const s = interpolate(local, [0, 3], [1.12, 1], { extrapolateRight: "clamp" });
  const top = Math.min(y * height, height - safe.bottom);

  const text: React.CSSProperties =
    style === "outline"
      ? { color: color.white, WebkitTextStroke: `10px ${color.ink}`, paintOrder: "stroke fill" }
      : style === "orange"
        ? { color: color.ink, background: color.orange, padding: "6px 22px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }
        : { color: color.ink, background: color.paper, padding: "6px 22px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          right: safe.right,
          top,
          transform: `translateY(-50%) scale(${s})`,
          textAlign: "center",
          fontFamily: font.display,
          fontWeight: 800,
          fontSize: size.caption,
          lineHeight: 1.32,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={text}>
          {parseMarkup(line.text).map((tok, i) => (
            <span key={i} style={tokenStyle(tok.kind, { accent: style === "orange" ? color.paper : color.orange })}>
              {tok.text}
            </span>
          ))}
        </span>
      </div>
    </AbsoluteFill>
  );
};
