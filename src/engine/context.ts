import React from "react";
import type { AudioCut } from "../spec/types";

/** Absolute start (frames) of the scene currently rendering. */
export const SceneStartContext = React.createContext(0);

export const AudioCutsContext = React.createContext<AudioCut[]>([]);

export type CutTrack = "music" | "footage" | "voiceover";

/** Is this track silenced at absolute second t? */
export const isCut = (cuts: AudioCut[], track: CutTrack, t: number) =>
  cuts.some((c) => t >= c.from && t < c.to && (c.tracks ?? ["music", "footage"]).includes(track));
