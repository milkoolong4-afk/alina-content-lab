import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { ReelSpec } from "../spec/types";
import { layoutScenes } from "../spec/timeline";
import { color } from "../theme/tokens";
import { SceneView } from "./SceneView";
import { AudioLayer } from "./AudioLayer";
import { AudioCutsContext, SceneStartContext } from "./context";
import { OverlayLayer } from "../components/overlays/Overlays";
import { Subtitles } from "../components/type/Subtitles";
import { Grain } from "../components/fx/Grain";
import { SafeGuides } from "../components/fx/SafeGuides";
import "../theme/fonts";

export type ReelProps = { spec: ReelSpec };

/**
 * Renders any ReelSpec. This is the only composition component you need —
 * every reel is just data.
 */
export const Reel: React.FC<ReelProps> = ({ spec }) => {
  const { fps } = useVideoConfig();
  const { slots, total } = layoutScenes(spec, fps);

  return (
    <AudioCutsContext.Provider value={spec.audioCuts ?? []}>
      <AbsoluteFill style={{ background: color.ink }}>
        {slots.map((slot) => (
          <Sequence key={slot.index} from={slot.from} durationInFrames={slot.frames} name={`${slot.index + 1}. ${spec.scenes[slot.index].type}${spec.scenes[slot.index].note ? ` — ${spec.scenes[slot.index].note}` : ""}`}>
            <SceneStartContext.Provider value={slot.from}>
              <SceneView scene={spec.scenes[slot.index]} totalFrames={slot.frames} />
            </SceneStartContext.Provider>
          </Sequence>
        ))}

        <OverlayLayer overlays={spec.overlays} totalFrames={total} />
        {spec.captions && <Subtitles {...spec.captions} />}
        {spec.look?.grain !== false && <Grain />}
        {spec.look?.guides && <SafeGuides />}

        <AudioLayer spec={spec} slots={slots} />
      </AbsoluteFill>
    </AudioCutsContext.Provider>
  );
};
