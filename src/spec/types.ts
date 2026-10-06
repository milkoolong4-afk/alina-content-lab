/**
 * Reel spec — the single source of truth for a video.
 *
 * A reel is a list of scenes played back-to-back (hard cuts by default).
 * All times are in SECONDS. Times inside a scene (overlays, sfx, zooms) are
 * relative to the start of that scene.
 *
 * Asset paths (`src`) are relative to /public, e.g. "reels/my-reel/video/01.mp4".
 * Also allowed: full https:// URLs and "demo:<label>" placeholders.
 */

import type { ColorName } from "../theme/tokens";
import type { FontName } from "../theme/fonts";
import type { SfxName } from "../sfx/library";

export type Colorish = ColorName | (string & {});

// ───────────────────────────── Audio ─────────────────────────────

export type SfxCue = {
  /** Seconds (relative to scene start when used inside a scene). */
  at: number;
  /** Library name (see src/sfx/library.ts) or a path to a file in /public. */
  sfx: SfxName | (string & {});
  volume?: number;
  /** Trim the sound (seconds). */
  duration?: number;
  playbackRate?: number;
};

export type AudioTrack = {
  src: string;
  volume?: number;
  /** Where the track starts in the reel (seconds). */
  at?: number;
  /** Skip the first N seconds of the file. */
  trimStart?: number;
  /** Play only N seconds of the file (after trimStart). Omit = to the end. */
  duration?: number;
};

/**
 * Hard audio cut: everything except SFX goes silent for [from, to).
 * Use it to make silence part of the joke.
 */
export type AudioCut = {
  from: number;
  to: number;
  /** What to silence. Default: ["music", "footage"]. VO only if you really mean it. */
  tracks?: Array<"music" | "footage" | "voiceover">;
};

// ─────────────────────────── Captions ────────────────────────────

export type CaptionLine = {
  /** Markup allowed: *orange*, [boxed], ~strike~, _serif italic_ */
  text: string;
  start: number;
  end: number;
  /**
   * Word start times (seconds, absolute), one per word of `text` — for mode "words".
   * Omit to spread words evenly across [start, end] (by word length).
   * Whisper output can fill this automatically (see src/lib/captions.ts).
   */
  words?: number[];
};

export type CaptionsConfig = {
  lines: CaptionLine[];
  /**
   * "lines" (default): the whole line appears at once.
   * "words": words pop in one by one as spoken; the line is a chunk that
   * replaces the previous one. Key words (*word*) are scaled up.
   */
  mode?: "lines" | "words";
  /** "box": ink text on paper box. "outline": white with ink stroke. "orange": ink on orange. */
  style?: "box" | "outline" | "orange";
  /** Vertical position as fraction of height (0 top … 1 bottom). Default 0.68. */
  y?: number;
  /** Size multiplier for *key* words in mode "words". Default 2.2. */
  keyScale?: number;
};

// ─────────────────────────── Camera / FX ─────────────────────────

export type Zoom = {
  at: number;
  /** Target scale (1 = no zoom). */
  scale: number;
  /** Focus point, 0…1 of the frame. Default centre. */
  x?: number;
  y?: number;
  /** Seconds to reach the target. 0 = punch-in (hard cut zoom). Default 0. */
  duration?: number;
};

export type Shake = { at: number; duration?: number; intensity?: number };

export type Transition = "cut" | "flash" | "flash-orange" | "whip" | "glitch" | "zoom" | "drop";

export type Freeze = {
  /** Freeze the footage at this moment (seconds, relative to scene). */
  at: number;
  /** Text slapped on the freeze, markup allowed. */
  label?: string;
  /** Visual treatment of the frozen frame. Default "flash". */
  style?: "flash" | "mono" | "orange" | "plain";
  /** Extra zoom on freeze. Default 1.12. */
  zoom?: number;
};

// ─────────────────────────── Overlays ────────────────────────────

type OverlayBase = {
  at?: number;
  /** Seconds. Default: until end of scene. */
  duration?: number;
  /** Position as 0…1 fraction of the frame (anchor = centre of element). */
  x?: number;
  y?: number;
  rotate?: number;
  /** Entrance animation. Default depends on overlay. */
  enter?: "pop" | "slam" | "none" | "slide-up" | "drop" | "type";
};

export type Overlay = OverlayBase &
  (
    | { type: "title"; text: string; size?: number; color?: Colorish; bg?: Colorish; font?: FontName; width?: number; align?: "left" | "center" | "right" }
    | { type: "label"; text: string; color?: Colorish; bg?: Colorish; size?: number }
    | { type: "stamp"; text: string; color?: Colorish; size?: number }
    | { type: "hand"; text: string; color?: Colorish; size?: number }
    | { type: "arrow"; toX: number; toY: number; color?: Colorish; width?: number; curve?: number }
    | { type: "circle"; w: number; h: number; color?: Colorish; width?: number }
    | { type: "highlight"; w: number; h: number; color?: Colorish }
    | { type: "box"; w: number; h: number; color?: Colorish; width?: number }
    | { type: "counter"; text: string; color?: Colorish; bg?: Colorish }
    | { type: "notification"; app?: string; title: string; body?: string; time?: string }
    | { type: "error"; title?: string; body: string; buttons?: string[] }
    | {
        /** PNG cut-out (me, objects) or a screenshot. Feels like a physical paper cut-out. */
        type: "sticker";
        src: string;
        w?: number;
        h?: number;
        /** Hard drop shadow under the cut-out. Default ink; false = none. */
        shadow?: boolean | Colorish;
        /** "card": paper border + hard shadow — for screenshots. */
        frame?: "none" | "card";
        flip?: boolean;
        /** Slowly scale to this value over the overlay's duration (e.g. 1.08). */
        zoomTo?: number;
        /** Gentle hand-placed wobble (tiny bob + rotation). */
        float?: boolean;
      }
    | {
        /** Loading indicator: "dots" (…), "spinner" or "bar" (indeterminate). */
        type: "loading";
        variant?: "dots" | "spinner" | "bar";
        label?: string;
        color?: Colorish;
        size?: number;
      }
    | {
        /** Hand-drawn check mark in a circle — the "it works" moment. */
        type: "check";
        size?: number;
        color?: Colorish;
      }
    | { type: "emoji"; char: string; size?: number }
    | { type: "flash"; color?: Colorish }
    | { type: "cursor"; toX?: number; toY?: number; click?: boolean }
    | { type: "progress"; label?: string; from?: number; to?: number; color?: Colorish }
    | {
        /** Giant chapter numeral / word ("1.", "2.", "5"), allowed to overlap the frame and bleed off-edge. */
        type: "chapter";
        text: string;
        /** Font size px. Default 760. */
        size?: number;
        color?: Colorish;
        /** "italic" (default) — heavy italic grotesk; "serif" — editorial italic; "outline" — stroke only. */
        variant?: "italic" | "serif" | "outline";
        /** Small ironic aside next to the numeral, markup allowed: "(и самая главная)". */
        aside?: string;
        opacity?: number;
      }
  );

// ──────────────────────────── Scenes ─────────────────────────────

type SceneBase = {
  /** Seconds. */
  duration: number;
  /** Free-form note for yourself: what this beat does in the story. */
  note?: string;
  transition?: Transition;
  overlays?: Overlay[];
  sfx?: SfxCue[];
  zooms?: Zoom[];
  shakes?: Shake[];
  /** Background colour behind media / text. */
  bg?: Colorish;
  /**
   * Black & white. `true` = whole scene; `{ from, to }` = only that part (seconds in scene).
   * Applies to the scene body; overlays stay in colour.
   */
  mono?: boolean | { from?: number; to?: number };
};

/**
 * Footage in a framed window on a background (talking head "in a frame").
 * The window can grow to the full frame at `growAt` — emotion punch-in.
 */
export type VideoWindow = {
  /** Window width as fraction of frame width. Default 0.84. */
  width?: number;
  /** Window aspect ratio width/height. Default 1.25 (slightly landscape). */
  aspect?: number;
  /** Window centre, 0…1. Default x 0.5, y 0.45. */
  x?: number;
  y?: number;
  /** Seconds (in scene) when the window starts growing to full frame. Omit = never. */
  growAt?: number;
  /** Seconds the growth takes. 0 = instant jump. Default 0.25. */
  growDuration?: number;
  /** Frame border colour. Default ink. */
  border?: Colorish;
  /** Hard shadow colour. Default orange. "none" to disable. */
  shadow?: Colorish | "none";
};

export type MediaFit = "cover" | "contain";

export type VideoScene = SceneBase & {
  type: "video";
  src: string;
  /** Start reading the file at N seconds. */
  trimStart?: number;
  playbackRate?: number;
  /** Volume of footage's own audio. Default 0 (muted). */
  volume?: number;
  fit?: MediaFit;
  /** CSS object-position, e.g. "50% 30%". */
  focus?: string;
  freeze?: Freeze;
  mirror?: boolean;
  /** Show the footage in a framed window (see VideoWindow). Background = `bg` (default paper). */
  window?: VideoWindow;
};

export type ImageScene = SceneBase & {
  type: "image";
  src: string;
  fit?: MediaFit;
  focus?: string;
  /** Slow drift so a still doesn't feel dead. Default true. */
  drift?: boolean;
};

export type ScreenScene = SceneBase & {
  type: "screen";
  /** Screen recording (video) or screenshot (image). */
  src: string;
  device?: "phone" | "laptop" | "none";
  trimStart?: number;
  playbackRate?: number;
  volume?: number;
  /** Vertical position of the device, 0…1. Default 0.5. */
  y?: number;
  /** Device scale. Default 1. */
  scale?: number;
  tilt?: number;
};

export type MemeScene = SceneBase & {
  type: "meme";
  src: string;
  /** Classic meme captions (Impact-free — our display font, all caps). */
  top?: string;
  bottom?: string;
  /** "full" — media fills frame; "card" — media in a card on coloured bg with caption above. */
  layout?: "full" | "card";
  /** Caption above the card (layout "card"). Markup allowed. */
  caption?: string;
  /** Card aspect ratio width/height (layout "card"). Default: 1. Use the meme's own ratio to avoid cropping its text. */
  aspect?: number;
  fit?: MediaFit;
  trimStart?: number;
  volume?: number;
};

export type TextScene = SceneBase & {
  type: "text";
  /** One string per line. Markup allowed: *orange*, [boxed], ~strike~, _serif_. */
  lines: string[];
  /** Animation of the text. */
  animate?: "slam" | "words" | "lines" | "type" | "none";
  color?: Colorish;
  size?: number;
  align?: "left" | "center";
  font?: FontName;
  /** Small kicker above the statement (e.g. "день 47"). */
  kicker?: string;
};

export type SplitScene = SceneBase & {
  type: "split";
  a: { src: string; label?: string; trimStart?: number; focus?: string };
  b: { src: string; label?: string; trimStart?: number; focus?: string };
  direction?: "vertical" | "horizontal";
  /** When the second half appears (seconds). Default 0 (both at once). */
  revealB?: number;
};

/** A beat of (almost) nothing. Silence as punchline. */
export type BeatScene = SceneBase & {
  type: "beat";
  text?: string;
  color?: Colorish;
};

export type Scene = VideoScene | ImageScene | ScreenScene | MemeScene | TextScene | SplitScene | BeatScene;

// ───────────────────────────── Reel ──────────────────────────────

export type ReelSpec = {
  /** Composition id (letters, numbers, dashes). */
  id: string;
  title?: string;
  /** Global look. */
  look?: {
    grain?: boolean;
    /** Show safe-zone guides (only for checking, never for export). */
    guides?: boolean;
  };
  /**
   * Voice-over. An array = the same file in pieces, e.g. to stretch a pause
   * without touching the voice: [{ trimStart: 2.6, duration: 15 }, { at: 15.4, trimStart: 17.6 }].
   */
  voiceover?: AudioTrack | AudioTrack[];
  /** Optional, low priority. Never the backbone of a reel. Default volume 0.12. */
  music?: AudioTrack;
  audioCuts?: AudioCut[];
  captions?: CaptionsConfig;
  scenes: Scene[];
  /** Absolute-time SFX cues (seconds from reel start). */
  sfx?: SfxCue[];
  /** Absolute-time overlays (seconds from reel start) that span scenes. */
  overlays?: Overlay[];
};
