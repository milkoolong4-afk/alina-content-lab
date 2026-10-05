import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { Overlay } from "../../spec/types";
import { c, color, hardShadow, radius, size as typeSize } from "../../theme/tokens";
import { font } from "../../theme/fonts";
import { resolveSrc } from "../../lib/assets";
import { Markup } from "../type/Markup";
import { KineticText } from "../type/KineticText";

/**
 * All graphic inserts that sit on top of footage.
 * Positions are 0…1 fractions of the frame, element anchored at its centre.
 */

type EnterKind = NonNullable<Overlay["enter"]>;

const useEnter = (kind: EnterKind) => {
  const frame = useCurrentFrame();
  switch (kind) {
    case "pop": {
      const s = interpolate(frame, [0, 3, 6], [0.2, 1.12, 1], { extrapolateRight: "clamp" });
      return { transform: `scale(${s})`, opacity: frame < 0 ? 0 : 1 };
    }
    case "slam": {
      const s = interpolate(frame, [0, 3], [1.9, 1], { extrapolateRight: "clamp" });
      return { transform: `scale(${s})`, opacity: interpolate(frame, [0, 1], [0.6, 1], { extrapolateRight: "clamp" }) };
    }
    case "slide-up": {
      const y = interpolate(frame, [0, 5], [80, 0], { extrapolateRight: "clamp" });
      return { transform: `translateY(${y}px)`, opacity: interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }) };
    }
    default:
      return {};
  }
};

const Positioned: React.FC<{ x?: number; y?: number; rotate?: number; enter: EnterKind; blend?: React.CSSProperties["mixBlendMode"]; children: React.ReactNode }> = ({ x = 0.5, y = 0.5, rotate = 0, enter, blend, children }) => {
  const anim = useEnter(enter);
  // Blend mode must live on the outermost layer: transforms below create isolated stacking contexts.
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: blend }}>
      <div style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, transform: `translate(-50%, -50%) rotate(${rotate}deg)` }}>
        <div style={{ ...anim, transformOrigin: "50% 50%" }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

// Hand-drawn wobble: deterministic jitter so circles/arrows feel drawn, not vector-perfect.
const wobble = (i: number, amp: number) => Math.sin(i * 12.9898) * amp;

const useDraw = (frames = 7) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, frames], [0, 1], { extrapolateRight: "clamp" });
};

const Circle: React.FC<{ w: number; h: number; stroke: string; width: number }> = ({ w, h, stroke, width }) => {
  const p = useDraw(8);
  const pts: string[] = [];
  const turns = 1.12; // overshoot like a real marker
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI * 0.6 + (i / N) * Math.PI * 2 * turns;
    const r = 1 + wobble(i, 0.035) + (i / N) * 0.06;
    pts.push(`${w / 2 + (Math.cos(a) * w * r) / 2},${h / 2 + (Math.sin(a) * h * r) / 2}`);
  }
  const len = Math.PI * (w + h) * 0.55 * turns;
  return (
    <svg width={w * 1.2} height={h * 1.2} viewBox={`${-w * 0.1} ${-h * 0.1} ${w * 1.2} ${h * 1.2}`} style={{ overflow: "visible" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

const Arrow: React.FC<{ fromX: number; fromY: number; toX: number; toY: number; stroke: string; width: number; curve: number }> = ({ fromX, fromY, toX, toY, stroke, width, curve }) => {
  const { width: W, height: H } = useVideoConfig();
  const p = useDraw(7);
  const x1 = fromX * W, y1 = fromY * H, x2 = toX * W, y2 = toY * H;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const nx = -(y2 - y1), ny = x2 - x1;
  const cx = mx + nx * curve, cy = my + ny * curve;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.25;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const head = width * 4.2;
  const h1 = `${x2 - head * Math.cos(ang - 0.5)},${y2 - head * Math.sin(ang - 0.5)}`;
  const h2 = `${x2 - head * Math.cos(ang + 0.5)},${y2 - head * Math.sin(ang + 0.5)}`;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
        {p >= 1 && <polyline points={`${h1} ${x2},${y2} ${h2}`} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ col: string }> = ({ col }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 4], [1, 0.9, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: col, opacity: o }} />;
};

const Cursor: React.FC<{ x: number; y: number; toX?: number; toY?: number; click?: boolean; dur: number }> = ({ x, y, toX, toY, click, dur }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const moveEnd = Math.max(6, dur * 0.6);
  const p = interpolate(frame, [0, moveEnd], [0, 1], { extrapolateRight: "clamp", easing: (v) => 1 - Math.pow(1 - v, 3) });
  const cx = (x + ((toX ?? x) - x) * p) * W;
  const cy = (y + ((toY ?? y) - y) * p) * H;
  const clickF = frame - moveEnd;
  const ring = click && clickF >= 0 ? interpolate(clickF, [0, 8], [0, 1], { extrapolateRight: "clamp" }) : -1;
  const press = click && clickF >= 0 && clickF < 4 ? 0.85 : 1;
  return (
    <AbsoluteFill>
      {ring >= 0 && (
        <div style={{ position: "absolute", left: cx, top: cy, width: 140, height: 140, marginLeft: -70, marginTop: -70, borderRadius: 70, border: `8px solid ${color.orange}`, transform: `scale(${0.3 + ring})`, opacity: 1 - ring }} />
      )}
      <svg width={70} height={90} viewBox="0 0 24 30" style={{ position: "absolute", left: cx - 6, top: cy - 4, transform: `scale(${press})`, transformOrigin: "0 0" }}>
        <path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill={color.white} stroke={color.ink} strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const Progress: React.FC<{ label?: string; from: number; to: number; col: string; dur: number }> = ({ label, from, to, col, dur }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [0, Math.max(1, dur * 0.8)], [from, to], { extrapolateRight: "clamp" });
  return (
    <div style={{ width: 760, fontFamily: font.mono, color: color.ink }}>
      {label && <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 14, background: color.paper, display: "inline-block", padding: "4px 14px" }}>{label}</div>}
      <div style={{ height: 64, border: `6px solid ${color.ink}`, background: color.paper, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, width: `${v}%`, background: col }} />
        <div style={{ position: "absolute", right: 16, top: 0, lineHeight: "52px", fontSize: 36, fontWeight: 700 }}>{Math.round(v)}%</div>
      </div>
    </div>
  );
};

export const OverlayView: React.FC<{ o: Overlay; durationFrames: number }> = ({ o, durationFrames }) => {
  switch (o.type) {
    case "title":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate} enter={o.enter === "type" ? "none" : (o.enter ?? "slam")}>
          <div style={{ width: o.width ?? 900, background: o.bg ? c(o.bg) : undefined, padding: o.bg ? "18px 30px" : 0 }}>
            <KineticText
              lines={o.text.split("\n")}
              animate={o.enter === "type" ? "type" : "none"}
              size={o.size ?? typeSize.l}
              color={c(o.color, color.ink)}
              font={o.font}
              align={o.align ?? "center"}
              maxWidth={(o.width ?? 900) - (o.bg ? 60 : 0)}
            />
          </div>
        </Positioned>
      );
    case "label":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate ?? -3} enter={o.enter ?? "pop"}>
          <div
            style={{
              background: c(o.bg, color.orange),
              color: c(o.color, color.ink),
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: o.size ?? typeSize.s,
              letterSpacing: "-0.02em",
              padding: "10px 26px",
              border: `5px solid ${color.ink}`,
              boxShadow: hardShadow(8),
              whiteSpace: "nowrap",
            }}
          >
            <Markup text={o.text} accent={color.paper} />
          </div>
        </Positioned>
      );
    case "stamp":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate ?? -12} enter={o.enter ?? "slam"}>
          <div
            style={{
              color: c(o.color, color.alert),
              border: `14px solid ${c(o.color, color.alert)}`,
              background: "rgba(244,240,232,0.92)",
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: o.size ?? typeSize.huge,
              lineHeight: 1,
              padding: "14px 40px 20px",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              borderRadius: radius.s,
              whiteSpace: "nowrap",
            }}
          >
            {o.text}
          </div>
        </Positioned>
      );
    case "hand":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate ?? -6} enter={o.enter ?? "pop"}>
          <div style={{ fontFamily: font.hand, fontWeight: 700, fontSize: o.size ?? 96, color: c(o.color, color.orange), lineHeight: 0.95, whiteSpace: "pre", textAlign: "center" }}>{o.text}</div>
        </Positioned>
      );
    case "arrow":
      return <Arrow fromX={o.x ?? 0.3} fromY={o.y ?? 0.3} toX={o.toX} toY={o.toY} stroke={c(o.color, color.orange)} width={o.width ?? 14} curve={o.curve ?? 0.18} />;
    case "circle":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate} enter="none">
          <Circle w={o.w} h={o.h} stroke={c(o.color, color.orange)} width={o.width ?? 14} />
        </Positioned>
      );
    case "highlight": {
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate ?? -1.5} enter="none" blend="multiply">
          <HighlightBar w={o.w} h={o.h} col={c(o.color, color.marker)} />
        </Positioned>
      );
    }
    case "box":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate} enter={o.enter ?? "pop"}>
          <div style={{ width: o.w, height: o.h, border: `${o.width ?? 12}px solid ${c(o.color, color.orange)}` }} />
        </Positioned>
      );
    case "counter":
      return (
        <Positioned x={o.x ?? 0.27} y={o.y ?? 0.135} rotate={o.rotate} enter={o.enter ?? "none"}>
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 42, color: c(o.color, color.paper), background: c(o.bg, color.ink), padding: "10px 22px", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
            {o.text}
          </div>
        </Positioned>
      );
    case "notification":
      return (
        <Positioned x={o.x ?? 0.5} y={o.y ?? 0.16} rotate={o.rotate} enter={o.enter ?? "slide-up"}>
          <div style={{ width: 900, background: "rgba(250,248,244,0.97)", borderRadius: 44, padding: "28px 34px", display: "flex", gap: 26, alignItems: "center", boxShadow: "0 18px 50px rgba(0,0,0,0.25)", fontFamily: font.display, color: color.ink }}>
            <div style={{ width: 96, height: 96, borderRadius: 24, background: color.orange, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, color: color.paper }}>
              {(o.app ?? "!").slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, opacity: 0.55, fontWeight: 600 }}>
                <span>{o.app ?? "Notification"}</span>
                <span>{o.time ?? "now"}</span>
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.01em" }}>{o.title}</div>
              {o.body && <div style={{ fontSize: 38, fontWeight: 600, opacity: 0.85 }}>{o.body}</div>}
            </div>
          </div>
        </Positioned>
      );
    case "error":
      return (
        <Positioned x={o.x} y={o.y ?? 0.45} rotate={o.rotate} enter={o.enter ?? "pop"}>
          <div style={{ width: 860, background: color.paper, border: `6px solid ${color.ink}`, boxShadow: hardShadow(14), fontFamily: font.mono, color: color.ink }}>
            <div style={{ background: color.alert, color: color.white, padding: "14px 24px", fontSize: 38, fontWeight: 700, display: "flex", justifyContent: "space-between", borderBottom: `6px solid ${color.ink}` }}>
              <span>{o.title ?? "Error"}</span>
              <span>✕</span>
            </div>
            <div style={{ padding: "34px 30px", fontSize: 44, fontWeight: 700, lineHeight: 1.2 }}>
              <Markup text={o.body} accent={color.alert} />
            </div>
            <div style={{ display: "flex", gap: 20, padding: "0 30px 30px", justifyContent: "flex-end" }}>
              {(o.buttons ?? ["OK"]).map((b, i) => (
                <div key={i} style={{ border: `5px solid ${color.ink}`, padding: "8px 30px", fontSize: 36, fontWeight: 700, background: i === 0 ? color.ink : color.paper, color: i === 0 ? color.paper : color.ink }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </Positioned>
      );
    case "sticker":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate ?? 4} enter={o.enter ?? "pop"}>
          <Img src={resolveSrc(o.src)} style={{ width: o.w ?? 420, height: o.h, objectFit: "contain", filter: `drop-shadow(8px 8px 0 ${color.ink})` }} />
        </Positioned>
      );
    case "emoji":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate} enter={o.enter ?? "pop"}>
          <div style={{ fontSize: o.size ?? 220, lineHeight: 1 }}>{o.char}</div>
        </Positioned>
      );
    case "flash":
      return <Flash col={c(o.color, color.white)} />;
    case "cursor":
      return <Cursor x={o.x ?? 0.5} y={o.y ?? 0.5} toX={o.toX} toY={o.toY} click={o.click} dur={durationFrames} />;
    case "progress":
      return (
        <Positioned x={o.x} y={o.y} rotate={o.rotate} enter={o.enter ?? "none"}>
          <Progress label={o.label} from={o.from ?? 0} to={o.to ?? 100} col={c(o.color, color.orange)} dur={durationFrames} />
        </Positioned>
      );
  }
};

const HighlightBar: React.FC<{ w: number; h: number; col: string }> = ({ w, h, col }) => {
  const p = useDraw(5);
  return <div style={{ width: w, height: h, display: "flex" }}><div style={{ width: `${p * 100}%`, height: "100%", background: col, opacity: 0.9 }} /></div>;
};

/** Render a list of overlays; `at`/`duration` relative to the enclosing sequence. */
export const OverlayLayer: React.FC<{ overlays?: Overlay[]; totalFrames: number }> = ({ overlays, totalFrames }) => {
  const { fps } = useVideoConfig();
  if (!overlays?.length) return null;
  return (
    <>
      {overlays.map((o, i) => {
        const from = Math.round((o.at ?? 0) * fps);
        const defaultDur = o.type === "flash" ? 0.2 : undefined;
        const dur = o.duration ?? defaultDur;
        const frames = dur !== undefined ? Math.max(1, Math.round(dur * fps)) : Math.max(1, totalFrames - from);
        return (
          <Sequence key={i} from={from} durationInFrames={frames} layout="none" name={`overlay:${o.type}`}>
            <OverlayView o={o} durationFrames={frames} />
          </Sequence>
        );
      })}
    </>
  );
};
