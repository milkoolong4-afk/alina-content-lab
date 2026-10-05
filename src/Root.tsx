import React from "react";
import { Composition, Folder } from "remotion";
import { Reel, type ReelProps } from "./engine/Reel";
import { layoutScenes } from "./spec/timeline";
import { format } from "./theme/tokens";
import { reels, lab } from "./reels";

const ReelComposition: React.FC<{ spec: ReelProps["spec"] }> = ({ spec }) => (
  <Composition
    id={spec.id}
    component={Reel}
    width={format.width}
    height={format.height}
    fps={format.fps}
    durationInFrames={layoutScenes(spec, format.fps).total}
    defaultProps={{ spec }}
  />
);

export const Root: React.FC = () => (
  <>
    <Folder name="Reels">
      {reels.map((spec) => (
        <ReelComposition key={spec.id} spec={spec} />
      ))}
    </Folder>
    <Folder name="Lab">
      {lab.map((spec) => (
        <ReelComposition key={spec.id} spec={spec} />
      ))}
    </Folder>
  </>
);
