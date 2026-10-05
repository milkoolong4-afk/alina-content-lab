import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color as palette, size as typeSize } from "../../theme/tokens";
import { font as fonts, type FontName } from "../../theme/fonts";
import { markupWords, parseMarkup, plainText, tokenStyle } from "./Markup";

// Rough average glyph width as a fraction of font size (heavy grotesk, caps-ish worst case).
const GLYPH: Record<FontName, number> = { display: 0.62, serif: 0.55, hand: 0.42, mono: 0.62 };

/** Largest size ≤ requested at which the longest word fits in maxWidth. */
export const fitSize = (lines: string[], size: number, maxWidth: number, font: FontName = "display") => {
  const longest = Math.max(1, ...lines.flatMap((l) => plainText(l).split(/\s+/)).map((w) => w.length));
  return Math.min(size, Math.floor(maxWidth / (longest * GLYPH[font])));
};

export type KineticMode = "slam" | "words" | "lines" | "type" | "none";

type Props = {
  lines: string[];
  animate?: KineticMode;
  size?: number;
  color?: string;
  accent?: string;
  boxBg?: string;
  boxFg?: string;
  align?: "left" | "center" | "right";
  font?: FontName;
  /** Seconds per word for "words" mode. */
  wordRate?: number;
  /** Seconds per line for "lines" mode. */
  lineRate?: number;
  /** Characters per second for "type" mode. */
  cps?: number;
  /** Shrink font so the longest word fits this width (px). */
  maxWidth?: number;
  style?: React.CSSProperties;
};

/**
 * Big, short, heavy statements. The workhorse of on-screen typography.
 * Animations are deliberately snappy (2–4 frames): cuts, not fades.
 */
export const KineticText: React.FC<Props> = ({
  lines,
  animate = "slam",
  size = typeSize.xl,
  color = palette.ink,
  accent,
  boxBg,
  boxFg,
  align = "center",
  font = "display",
  wordRate = 0.13,
  lineRate = 0.4,
  cps = 26,
  maxWidth,
  style,
}) => {
  if (maxWidth) size = fitSize(lines, size, maxWidth, font);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opts = { accent, boxBg, boxFg };

  const base: React.CSSProperties = {
    fontFamily: fonts[font],
    fontWeight: font === "display" ? 900 : font === "mono" ? 700 : 700,
    fontSize: size,
    lineHeight: font === "hand" ? 1 : 0.98,
    letterSpacing: font === "display" ? "-0.035em" : font === "mono" ? "-0.02em" : 0,
    color,
    textAlign: align,
    textWrap: "balance",
    ...style,
  } as React.CSSProperties;

  if (animate === "slam") {
    const s = interpolate(frame, [0, 4], [1.35, 1], { extrapolateRight: "clamp" });
    const rot = interpolate(frame, [0, 4], [-2.5, 0], { extrapolateRight: "clamp" });
    return (
      <div style={{ ...base, transform: `scale(${s}) rotate(${rot}deg)` }}>
        {lines.map((l, i) => (
          <div key={i}>
            {parseMarkup(l).map((tok, j) => (
              <span key={j} style={tokenStyle(tok.kind, opts)}>
                {tok.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (animate === "words") {
    let idx = 0;
    return (
      <div style={base}>
        {lines.map((l, i) => (
          <div key={i}>
            {markupWords(l).map((w, j) => {
              const start = idx++ * wordRate * fps;
              const local = frame - start;
              const visible = local >= 0;
              const s = interpolate(local, [0, 3], [1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span
                  key={j}
                  style={{
                    ...tokenStyle(w.kind, opts),
                    display: "inline-block",
                    marginRight: "0.22em",
                    opacity: visible ? 1 : 0,
                    transform: `scale(${s})`,
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  if (animate === "lines") {
    return (
      <div style={base}>
        {lines.map((l, i) => (
          <div key={i} style={{ opacity: t >= i * lineRate ? 1 : 0 }}>
            {parseMarkup(l).map((tok, j) => (
              <span key={j} style={tokenStyle(tok.kind, opts)}>
                {tok.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (animate === "type") {
    let budget = Math.floor(t * cps);
    const cursorOn = Math.floor(frame / (fps * 0.35)) % 2 === 0;
    let cursorPlaced = false;
    return (
      <div style={base}>
        {lines.map((l, i) => {
          const toks = parseMarkup(l);
          const lineLen = toks.reduce((n, tk) => n + tk.text.length, 0);
          const shown = Math.max(0, Math.min(lineLen, budget));
          const lineDone = budget >= lineLen;
          budget -= lineLen + 1; // +1 = pause for line break
          let left = shown;
          const showCursor = !cursorPlaced && (!lineDone || i === lines.length - 1);
          if (showCursor) cursorPlaced = true;
          if (shown === 0 && !showCursor) return <div key={i}>&nbsp;</div>;
          return (
            <div key={i}>
              {toks.map((tk, j) => {
                const part = tk.text.slice(0, Math.max(0, left));
                left -= tk.text.length;
                return part ? (
                  <span key={j} style={tokenStyle(tk.kind, opts)}>
                    {part}
                  </span>
                ) : null;
              })}
              {showCursor && (
                <span style={{ display: "inline-block", width: "0.08em", height: "0.9em", marginLeft: "0.04em", background: cursorOn ? palette.orange : "transparent", verticalAlign: "-0.08em" }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={base}>
      {lines.map((l, i) => (
        <div key={i}>
          {parseMarkup(l).map((tok, j) => (
            <span key={j} style={tokenStyle(tok.kind, opts)}>
              {tok.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
