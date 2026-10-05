import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { BeatScene, ImageScene, MemeScene, ScreenScene, SplitScene, TextScene, VideoScene } from "../../spec/types";
import { c, color, hardShadow, safe, size as typeSize } from "../../theme/tokens";
import { font } from "../../theme/fonts";
import { Camera } from "../media/Camera";
import { MediaFill } from "../media/MediaFill";
import { LaptopFrame, PhoneFrame } from "../media/Devices";
import { KineticText } from "../type/KineticText";
import { Markup } from "../type/Markup";

/**
 * Scene bodies. Each fills the frame; transitions, overlays and SFX are
 * handled by the engine around them.
 */

// ───────────────────────────── video ─────────────────────────────

export const VideoSceneView: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fz = scene.freeze;
  const freezeFrame = fz ? Math.round(fz.at * fps) : Infinity;
  const frozen = frame >= freezeFrame;
  const sinceFreeze = frame - freezeFrame;
  const style = fz?.style ?? "flash";

  const media = (
    <MediaFill src={scene.src} trimStart={scene.trimStart} playbackRate={scene.playbackRate} volume={scene.volume} fit={scene.fit} focus={scene.focus} mirror={scene.mirror} />
  );

  // Freeze push-in: quick 4-frame punch to the freeze zoom.
  const freezeZoom = frozen ? interpolate(sinceFreeze, [0, 4], [1, fz?.zoom ?? 1.12], { extrapolateRight: "clamp" }) : 1;
  const filter = frozen && style === "mono" ? "grayscale(1) contrast(1.35)" : frozen && style === "orange" ? "grayscale(1) contrast(1.25) brightness(1.1)" : undefined;

  const footage = (
    <>
      <Camera zooms={scene.zooms} shakes={scene.shakes} extraScale={freezeZoom}>
        <AbsoluteFill style={{ filter }}>
          {fz ? (
            <Freeze frame={freezeFrame} active={(f) => f >= freezeFrame}>
              {media}
            </Freeze>
          ) : (
            media
          )}
        </AbsoluteFill>
        {frozen && style === "orange" && <AbsoluteFill style={{ background: color.orange, mixBlendMode: "multiply" }} />}
      </Camera>
      {frozen && (style === "flash" || style === "orange") && sinceFreeze < 5 && (
        <AbsoluteFill style={{ background: color.white, opacity: interpolate(sinceFreeze, [0, 4], [0.9, 0], { extrapolateRight: "clamp" }) }} />
      )}
    </>
  );

  return (
    <AbsoluteFill style={{ background: c(scene.bg, scene.window ? color.paper : color.black) }}>
      {scene.window ? <WindowFrame win={scene.window}>{footage}</WindowFrame> : footage}
      {frozen && fz?.label && (
        <AbsoluteFill style={{ justifyContent: "flex-end", padding: `${safe.top}px ${safe.right}px ${safe.bottom + 40}px ${safe.left}px` }}>
          <div style={{ alignSelf: "flex-start", background: color.paper, padding: "14px 26px", boxShadow: hardShadow(10, color.orange), transform: "rotate(-2deg)" }}>
            <KineticText lines={fz.label.split("\n")} animate="slam" size={typeSize.m} align="left" />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * Footage in a window on the background. Grows to the full frame at `growAt`:
 * the frame border and shadow melt away as it fills the screen.
 */
const WindowFrame: React.FC<{ win: NonNullable<VideoScene["window"]>; children: React.ReactNode }> = ({ win, children }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const ww = (win.width ?? 0.84) * W;
  const wh = ww / (win.aspect ?? 1.25);
  const cx = (win.x ?? 0.5) * W;
  const cy = (win.y ?? 0.45) * H;
  let p = 0;
  if (win.growAt !== undefined) {
    const start = win.growAt * fps;
    const dur = Math.max(0, (win.growDuration ?? 0.25) * fps);
    p = dur === 0 ? (frame >= start ? 1 : 0) : interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.9, 0.1, 1) });
  }
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const left = lerp(cx - ww / 2, 0);
  const top = lerp(cy - wh / 2, 0);
  const width = lerp(ww, W);
  const height = lerp(wh, H);
  const border = lerp(10, 0);
  const shadowOff = lerp(16, 0);
  const shadow = win.shadow === "none" ? undefined : `${shadowOff}px ${shadowOff}px 0 ${c(win.shadow, color.orange)}`;
  return (
    <div style={{ position: "absolute", left, top, width, height, overflow: "hidden", border: border > 0.5 ? `${border}px solid ${c(win.border, color.ink)}` : undefined, boxShadow: shadow, boxSizing: "border-box" }}>
      <AbsoluteFill>{children}</AbsoluteFill>
    </div>
  );
};

// ───────────────────────────── image ─────────────────────────────

export const ImageSceneView: React.FC<{ scene: ImageScene; totalFrames: number }> = ({ scene, totalFrames }) => {
  const frame = useCurrentFrame();
  const drift = scene.drift === false ? 1 : interpolate(frame, [0, totalFrames], [1, 1.06]);
  return (
    <AbsoluteFill style={{ background: c(scene.bg, color.paper) }}>
      <Camera zooms={scene.zooms} shakes={scene.shakes} extraScale={drift}>
        <MediaFill src={scene.src} fit={scene.fit} focus={scene.focus} />
      </Camera>
    </AbsoluteFill>
  );
};

// ───────────────────────────── screen ────────────────────────────

export const ScreenSceneView: React.FC<{ scene: ScreenScene }> = ({ scene }) => {
  const device = scene.device ?? "phone";
  const media = <MediaFill src={scene.src} trimStart={scene.trimStart} playbackRate={scene.playbackRate} volume={scene.volume} fit={device === "none" ? "contain" : "cover"} focus="50% 0%" />;
  const y = scene.y ?? 0.5;
  return (
    <AbsoluteFill style={{ background: c(scene.bg, color.orange) }}>
      <Camera zooms={scene.zooms} shakes={scene.shakes}>
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: `${y * 100}%`,
              transform: `translate(-50%, -50%) scale(${scene.scale ?? 1}) rotate(${scene.tilt ?? 0}deg)`,
            }}
          >
            {device === "phone" && <PhoneFrame width={720}>{media}</PhoneFrame>}
            {device === "laptop" && <LaptopFrame width={1000}>{media}</LaptopFrame>}
            {device === "none" && <div style={{ width: 1080, height: 1920 }}>{media}</div>}
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
};

// ───────────────────────────── meme ──────────────────────────────

const memeCaption: React.CSSProperties = {
  fontFamily: font.display,
  fontWeight: 900,
  fontSize: typeSize.l,
  lineHeight: 1,
  color: color.white,
  textTransform: "uppercase",
  textAlign: "center",
  WebkitTextStroke: `12px ${color.black}`,
  paintOrder: "stroke fill",
  letterSpacing: "-0.02em",
  position: "absolute",
  left: safe.left,
  right: safe.left,
};

export const MemeSceneView: React.FC<{ scene: MemeScene }> = ({ scene }) => {
  if ((scene.layout ?? "card") === "full") {
    return (
      <AbsoluteFill style={{ background: color.black }}>
        <Camera zooms={scene.zooms} shakes={scene.shakes}>
          <MediaFill src={scene.src} trimStart={scene.trimStart} volume={scene.volume} />
        </Camera>
        {scene.top && <div style={{ ...memeCaption, top: safe.top }}>{scene.top}</div>}
        {scene.bottom && <div style={{ ...memeCaption, bottom: safe.bottom }}>{scene.bottom}</div>}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: c(scene.bg, color.paper) }}>
      <Camera zooms={scene.zooms} shakes={scene.shakes}>
        <AbsoluteFill style={{ padding: `${safe.top}px ${safe.left}px ${safe.bottom - 80}px`, gap: 44, justifyContent: "center" }}>
          {scene.caption && <KineticText lines={scene.caption.split("\n")} animate="none" size={typeSize.l} align="left" maxWidth={1080 - 2 * safe.left} />}
          <div style={{ position: "relative", border: `8px solid ${color.ink}`, boxShadow: hardShadow(14, color.orange), aspectRatio: `${scene.aspect ?? 1}`, width: scene.aspect && scene.aspect < 1 ? "auto" : "100%", height: scene.aspect && scene.aspect < 1 ? 1100 : undefined, alignSelf: "center", background: color.black, overflow: "hidden" }}>
            <MediaFill src={scene.src} trimStart={scene.trimStart} volume={scene.volume} fit={scene.fit} />
            {scene.top && <div style={{ ...memeCaption, fontSize: typeSize.m, top: 24, left: 24, right: 24 }}>{scene.top}</div>}
            {scene.bottom && <div style={{ ...memeCaption, fontSize: typeSize.m, bottom: 24, left: 24, right: 24 }}>{scene.bottom}</div>}
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
};

// ───────────────────────────── text ──────────────────────────────

export const TextSceneView: React.FC<{ scene: TextScene }> = ({ scene }) => {
  const bg = c(scene.bg, color.paper);
  const onOrange = bg === color.orange;
  const onDark = bg === color.ink || bg === color.black;
  const fg = c(scene.color, onDark ? color.paper : color.ink);
  const align = scene.align ?? "left";
  return (
    <AbsoluteFill style={{ background: bg }}>
      <Camera zooms={scene.zooms} shakes={scene.shakes}>
        <AbsoluteFill
          style={{
            padding: align === "center" ? `${safe.top}px ${safe.right - 40}px ${safe.bottom}px` : `${safe.top}px ${safe.right - 40}px ${safe.bottom}px ${safe.left}px`,
            justifyContent: "center",
            alignItems: align === "center" ? "center" : "flex-start",
            gap: 30,
          }}
        >
          {scene.kicker && (
            <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 40, color: onOrange ? color.paper : color.orange, background: onOrange ? color.ink : "transparent", padding: onOrange ? "4px 14px" : 0, letterSpacing: "0.02em" }}>
              <Markup text={scene.kicker} />
            </div>
          )}
          <KineticText
            lines={scene.lines}
            animate={scene.animate ?? "slam"}
            size={scene.size ?? typeSize.xl}
            color={fg}
            accent={onOrange ? color.paper : color.orange}
            boxBg={onDark ? color.orange : color.ink}
            boxFg={onDark ? color.ink : onOrange ? color.orange : color.paper}
            align={align}
            font={scene.font}
            maxWidth={align === "center" ? 1080 - 2 * (safe.right - 40) : 1080 - safe.left - safe.right + 40}
          />
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
};

// ───────────────────────────── split ─────────────────────────────

const SplitLabel: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: safe.left, top: 40, background: color.orange, color: color.ink, fontFamily: font.display, fontWeight: 900, fontSize: typeSize.s, padding: "8px 22px", border: `5px solid ${color.ink}`, boxShadow: hardShadow(6), transform: "rotate(-2deg)" }}>
    <Markup text={text} accent={color.paper} />
  </div>
);

export const SplitSceneView: React.FC<{ scene: SplitScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showB = frame >= Math.round((scene.revealB ?? 0) * fps);
  const vertical = (scene.direction ?? "vertical") === "vertical";
  const half: React.CSSProperties = vertical ? { position: "absolute", left: 0, right: 0, height: "50%", overflow: "hidden" } : { position: "absolute", top: 0, bottom: 0, width: "50%", overflow: "hidden" };
  return (
    <AbsoluteFill style={{ background: c(scene.bg, color.ink) }}>
      <Camera zooms={scene.zooms} shakes={scene.shakes}>
        <div style={{ ...half, ...(vertical ? { top: 0 } : { left: 0 }) }}>
          <MediaFill src={scene.a.src} trimStart={scene.a.trimStart} focus={scene.a.focus} />
          {scene.a.label && <div style={{ position: "absolute", inset: 0, paddingTop: vertical ? safe.top - 60 : safe.top }}><SplitLabel text={scene.a.label} /></div>}
        </div>
        {showB && (
          <div style={{ ...half, ...(vertical ? { bottom: 0 } : { right: 0 }) }}>
            <MediaFill src={scene.b.src} trimStart={scene.b.trimStart} focus={scene.b.focus} />
            {scene.b.label && <div style={{ position: "absolute", inset: 0, paddingTop: vertical ? 0 : safe.top }}><SplitLabel text={scene.b.label} /></div>}
          </div>
        )}
        <div style={{ position: "absolute", background: color.ink, ...(vertical ? { left: 0, right: 0, top: "50%", height: 14, marginTop: -7 } : { top: 0, bottom: 0, left: "50%", width: 14, marginLeft: -7 }) }} />
      </Camera>
    </AbsoluteFill>
  );
};

// ───────────────────────────── beat ──────────────────────────────

export const BeatSceneView: React.FC<{ scene: BeatScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: c(scene.bg, color.ink), alignItems: "center", justifyContent: "center" }}>
    {scene.text && (
      <div style={{ fontFamily: font.mono, fontWeight: 500, fontSize: 48, color: c(scene.color, color.paper), opacity: 0.85, textAlign: "center", whiteSpace: "pre-line", padding: `0 ${safe.right}px` }}>
        <Markup text={scene.text} />
      </div>
    )}
  </AbsoluteFill>
);
