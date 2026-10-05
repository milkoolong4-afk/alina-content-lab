import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../../theme/tokens";
import { font } from "../../theme/fonts";

/**
 * Stand-in for footage that doesn't exist yet: src "demo:<label>".
 * Shows a moving timecode so freeze frames / zooms are visible in previews.
 */
export const Placeholder: React.FC<{ label: string; tone?: "orange" | "ink" | "paper" }> = ({ label, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hash = [...label].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const t = tone ?? (["ink", "orange", "paper"] as const)[hash % 3];
  const bg = t === "orange" ? color.orange : t === "ink" ? color.inkSoft : "#DCD5C8";
  const fg = t === "paper" ? color.ink : color.paper;
  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(135deg, ${bg} 0 60px, ${bg}E6 60px 120px)`,
        color: fg,
        fontFamily: font.mono,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 24,
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.7 }}>PLACEHOLDER</div>
      <div style={{ fontSize: 72, fontWeight: 700, padding: "0 80px" }}>{label}</div>
      <div style={{ fontSize: 44, opacity: 0.8 }}>{(frame / fps).toFixed(2)}s</div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${(frame * 2.2) % 100}%`,
          width: 26,
          height: 26,
          borderRadius: 13,
          background: fg,
          transform: "translate(-50%, 220px)",
        }}
      />
    </AbsoluteFill>
  );
};
