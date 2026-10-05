import React from "react";
import { color, radius } from "../../theme/tokens";

/**
 * Neutral device frames (ink bezel). Not a replica of any real brand —
 * just enough to read as "phone" / "laptop".
 */
export const PhoneFrame: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width = 760, children, style }) => {
  const height = width * 2.1;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.12,
        background: color.ink,
        padding: width * 0.035,
        boxShadow: `18px 18px 0 ${color.orange}`,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: width * 0.09, overflow: "hidden", background: color.black, position: "relative" }}>
        {children}
        <div
          style={{
            position: "absolute",
            top: width * 0.03,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.28,
            height: width * 0.075,
            borderRadius: width,
            background: color.black,
          }}
        />
      </div>
    </div>
  );
};

export const LaptopFrame: React.FC<{ width?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width = 1000, children, style }) => {
  const screenH = width * 0.625;
  return (
    <div style={{ width, position: "relative", ...style }}>
      <div
        style={{
          width: "100%",
          height: screenH,
          background: color.ink,
          borderRadius: `${radius.m}px ${radius.m}px 0 0`,
          padding: width * 0.025,
          boxShadow: `16px 16px 0 ${color.orange}`,
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden", background: color.black, position: "relative" }}>{children}</div>
      </div>
      <div style={{ width: "112%", marginLeft: "-6%", height: width * 0.04, background: color.inkSoft, borderRadius: `0 0 ${radius.m}px ${radius.m}px` }} />
    </div>
  );
};
