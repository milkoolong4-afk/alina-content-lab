import React from "react";
import { AbsoluteFill } from "remotion";
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

/** One scene = transition-in → body (with camera) → overlays on top. */
export const SceneView: React.FC<{ scene: Scene; totalFrames: number }> = ({ scene, totalFrames }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <TransitionIn kind={scene.transition}>
      <Body scene={scene} totalFrames={totalFrames} />
      <OverlayLayer overlays={scene.overlays} totalFrames={totalFrames} />
    </TransitionIn>
  </AbsoluteFill>
);
