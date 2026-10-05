import React from "react";
import { AbsoluteFill } from "remotion";
import { safe } from "../../theme/tokens";

/** Debug overlay: platform UI zones. Turn on with look.guides — never export with it. */
export const SafeGuides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: safe.top, background: "rgba(255,0,80,0.25)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: safe.bottom, background: "rgba(255,0,80,0.25)" }} />
    <div style={{ position: "absolute", right: 0, top: safe.top, bottom: safe.bottom, width: safe.right, background: "rgba(255,0,80,0.18)" }} />
    <div style={{ position: "absolute", left: 0, top: safe.top, bottom: safe.bottom, width: safe.left, background: "rgba(255,0,80,0.12)" }} />
  </AbsoluteFill>
);
