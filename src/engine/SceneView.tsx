import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../spec/types";
import { BeatSceneView, ImageSceneView, MemeSceneView, ScreenSceneView, SplitSceneView, TextSceneView, VideoSceneView } from "../components/scenes/Scenes";
import { OverlayLayer } from "../components/overlays/Overlays";
import { TransitionIn } from "../components/fx/TransitionIn";

const Body: React.FC<{ scene: Scene; totalFrames: number }> = ({ scene, totalFrames }) => {
  switch (scene.type) {
    case "video":
      return <VideoSceneView scene={scene} />;
    case "image":
      return <ImageSceneView scene={scene} totalFrames={totalFrames} />;
    case "screen":
      return <ScreenSceneView scene={scene} />;
    case "meme":
      return <MemeSceneView scene={scene} />;
    case "text":
      return <TextSceneView scene={scene} />;
    case "split":
      return <SplitSceneView scene={scene} />;
    case "beat":
      return <BeatSceneView scene={scene} />;
  }
};

const MONO_FILTER = "grayscale(1) contrast(1.15)";

/** Is the scene black & white at this second? */
const isMono = (mono: Scene["mono"], t: number) => {
  if (!mono) return false;
  if (mono === true) return true;
  return t >= (mono.from ?? 0) && t < (mono.to ?? Infinity);
};

/** One scene = transition-in → body (with camera, optional B&W) → overlays on top (always colour). */
export const SceneView: React.FC<{ scene: Scene; totalFrames: number }> = ({ scene, totalFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mono = isMono(scene.mono, frame / fps);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <TransitionIn kind={scene.transition}>
        <AbsoluteFill style={{ filter: mono ? MONO_FILTER : undefined }}>
          <Body scene={scene} totalFrames={totalFrames} />
        </AbsoluteFill>
        <OverlayLayer overlays={scene.overlays} totalFrames={totalFrames} />
      </TransitionIn>
    </AbsoluteFill>
  );
};
