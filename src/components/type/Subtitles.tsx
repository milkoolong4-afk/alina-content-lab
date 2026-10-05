import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionLine, CaptionsConfig } from "../../spec/types";
import { color, safe, size } from "../../theme/tokens";
import { font } from "../../theme/fonts";
import { markupWords, parseMarkup, tokenStyle } from "./Markup";

/**
 * Burned-in subtitles for voice-over. Times are absolute (seconds from reel start).
 *
 * mode "lines" — the whole chunk appears at once (calm, readable).
 * mode "words" — words pop in as they're spoken; *key* words are scaled up
 *                (keyScale) and take their own line. Each caption line is a chunk.
 */
export const Subtitles: React.FC<CaptionsConfig> = ({ lines, mode = "lines", style = "box", y = 0.68, keyScale = 2.2 }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const line = lines.find((l) => t >= l.start && t < l.end);
  if (!line) return null;

  const top = Math.min(y * height, height - safe.bottom);
  const wrap: React.CSSProperties = {
    position: "absolute",
    left: safe.left,
    right: safe.right,
    top,
    textAlign: "center",
    fontFamily: font.display,
    fontWeight: 800,
    fontSize: size.caption,
    letterSpacing: "-0.02em",
  };

  if (mode === "words") return <WordChunk line={line} t={t} fps={fps} style={style} wrap={wrap} keyScale={keyScale} />;

  const local = frame - Math.round(line.start * fps);
  const s = interpolate(local, [0, 3], [1.12, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...wrap, lineHeight: 1.32, transform: `translateY(-50%) scale(${s})` }}>
        <span style={boxStyle(style)}>
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

const boxStyle = (style: NonNullable<CaptionsConfig["style"]>): React.CSSProperties =>
  style === "outline"
    ? { color: color.white, WebkitTextStroke: `10px ${color.ink}`, paintOrder: "stroke fill" }
    : {
        color: color.ink,
        background: style === "orange" ? color.orange : color.paper,
        padding: "6px 22px",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      };

/** Word start times for a line: explicit, or spread by word length across the line. */
export const wordTimes = (line: CaptionLine): number[] => {
  const words = markupWords(line.text);
  if (line.words && line.words.length === words.length) return line.words;
  const weights = words.map((w) => Math.max(2, w.text.length));
  const total = weights.reduce((a, b) => a + b, 0);
  // Leave the last 25% of the line for the full chunk to sit on screen.
  const span = (line.end - line.start) * 0.75;
  let acc = line.start;
  return weights.map((w) => {
    const at = acc;
    acc += (w / total) * span;
    return at;
  });
};

const WordChunk: React.FC<{
  line: CaptionLine;
  t: number;
  fps: number;
  style: NonNullable<CaptionsConfig["style"]>;
  wrap: React.CSSProperties;
  keyScale: number;
}> = ({ line, t, fps, style, wrap, keyScale }) => {
  const words = markupWords(line.text);
  const times = wordTimes(line);
  const plain = boxStyle(style);
  const accent = style === "orange" ? color.paper : color.orange;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...wrap, lineHeight: 1.12, transform: "translateY(-50%)" }}>
        {words.map((w, i) => {
          const since = (t - times[i]) * fps; // frames since this word started
          const shown = since >= 0;
          const isKey = w.kind === "accent";
          const pop = interpolate(since, [0, 3], [isKey ? 1.4 : 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const base: React.CSSProperties = {
            display: isKey ? "block" : "inline-block",
            // Hidden words keep their space, so the chunk never jumps around.
            visibility: shown ? "visible" : "hidden",
            transform: `scale(${pop})`,
            margin: isKey ? "0.06em 0" : "0.08em 0.12em",
          };
          if (isKey) {
            return (
              <span
                key={i}
                style={{
                  ...base,
                  fontSize: `${keyScale}em`,
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  // Key word has no box: a thick ink stroke keeps it readable over any footage.
                  color: accent,
                  WebkitTextStroke: `${22 / keyScale}px ${color.ink}`,
                  paintOrder: "stroke fill",
                  textShadow: `${10 / keyScale}px ${10 / keyScale}px 0 ${color.ink}`,
                }}
              >
                {w.text}
              </span>
            );
          }
          return (
            <span key={i} style={{ ...base, ...plain, ...tokenStyle(w.kind, { accent }), padding: style === "outline" ? 0 : "2px 14px" }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
