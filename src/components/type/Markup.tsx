import React from "react";
import { color } from "../../theme/tokens";
import { font } from "../../theme/fonts";

/**
 * Tiny inline markup for on-screen text:
 *   *word*   → orange
 *   [word]   → boxed (ink box, paper text)
 *   ~word~   → struck through (orange line)
 *   _word_   → editorial serif italic
 *
 * Markers can't be nested. Anything else is plain text.
 */

export type Token = { text: string; kind: "plain" | "accent" | "box" | "strike" | "serif" };

const PATTERN = /(\*[^*]+\*|\[[^\]]+\]|~[^~]+~|_[^_]+_)/g;

export const parseMarkup = (input: string): Token[] => {
  const out: Token[] = [];
  for (const part of input.split(PATTERN)) {
    if (!part) continue;
    const inner = part.slice(1, -1);
    if (part.startsWith("*") && part.endsWith("*")) out.push({ text: inner, kind: "accent" });
    else if (part.startsWith("[") && part.endsWith("]")) out.push({ text: inner, kind: "box" });
    else if (part.startsWith("~") && part.endsWith("~")) out.push({ text: inner, kind: "strike" });
    else if (part.startsWith("_") && part.endsWith("_")) out.push({ text: inner, kind: "serif" });
    else out.push({ text: part, kind: "plain" });
  }
  return out;
};

/** Strip markup — for measuring / typewriter counting. */
export const plainText = (input: string) => parseMarkup(input).map((t) => t.text).join("");

/** Split markup into word-level tokens, preserving style per word. */
export const markupWords = (input: string): Token[] => {
  const words: Token[] = [];
  for (const tok of parseMarkup(input)) {
    for (const w of tok.text.split(/\s+/)) if (w) words.push({ text: w, kind: tok.kind });
  }
  return words;
};

type StyleOpts = { accent?: string; boxBg?: string; boxFg?: string };

export const tokenStyle = (kind: Token["kind"], opts: StyleOpts = {}): React.CSSProperties => {
  switch (kind) {
    case "accent":
      return { color: opts.accent ?? color.orange };
    case "box":
      return {
        background: opts.boxBg ?? color.ink,
        color: opts.boxFg ?? color.paper,
        padding: "0 0.18em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      };
    case "strike":
      return {
        textDecoration: "line-through",
        textDecorationColor: color.orange,
        textDecorationThickness: "0.12em",
      };
    case "serif":
      return { fontFamily: font.serif, fontStyle: "italic", fontWeight: 900, letterSpacing: "-0.01em" };
    default:
      return {};
  }
};

export const Markup: React.FC<{ text: string } & StyleOpts> = ({ text, ...opts }) => (
  <>
    {parseMarkup(text).map((t, i) => (
      <span key={i} style={tokenStyle(t.kind, opts)}>
        {t.text}
      </span>
    ))}
  </>
);
