import React, { useContext } from "react";
import { AnimatedImage, Img, OffthreadVideo, useVideoConfig } from "remotion";
import { isDemo, isGif, isVideo, resolveSrc } from "../../lib/assets";
import { AudioCutsContext, isCut, SceneStartContext } from "../../engine/context";
import { Placeholder } from "./Placeholder";

export type MediaFillProps = {
  src: string;
  fit?: "cover" | "contain";
  focus?: string;
  trimStart?: number;
  playbackRate?: number;
  /** Footage audio volume. Default 0 — our sound is designed, not inherited. */
  volume?: number;
  mirror?: boolean;
  style?: React.CSSProperties;
};

/**
 * Any visual source (video / image / gif / demo placeholder) filling its box.
 */
export const MediaFill: React.FC<MediaFillProps> = ({ src, fit = "cover", focus = "50% 50%", trimStart = 0, playbackRate = 1, volume = 0, mirror, style }) => {
  const { fps } = useVideoConfig();
  const cuts = useContext(AudioCutsContext);
  const sceneStart = useContext(SceneStartContext);

  const css: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: fit,
    objectPosition: focus,
    transform: mirror ? "scaleX(-1)" : undefined,
    display: "block",
    ...style,
  };

  if (isDemo(src)) return <Placeholder label={src.slice(5)} />;

  if (isVideo(src)) {
    return (
      <OffthreadVideo
        src={resolveSrc(src)}
        trimBefore={Math.round(trimStart * fps) || undefined}
        playbackRate={playbackRate}
        muted={volume <= 0}
        volume={(f) => (isCut(cuts, "footage", (sceneStart + f) / fps) ? 0 : volume)}
        style={css}
      />
    );
  }

  if (isGif(src)) {
    return <AnimatedImage src={resolveSrc(src)} fit={fit === "cover" ? "cover" : "contain"} style={{ width: "100%", height: "100%" }} />;
  }

  return <Img src={resolveSrc(src)} style={css} />;
};
