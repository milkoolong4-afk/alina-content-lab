import React from "react";
import { Audio, Sequence, useVideoConfig } from "remotion";
import type { AudioCut, AudioTrack, ReelSpec, SfxCue } from "../spec/types";
import type { SceneSlot } from "../spec/timeline";
import { resolveSrc } from "../lib/assets";
import { resolveSfx } from "../sfx/library";
import { isCut, type CutTrack } from "./context";

const Track: React.FC<{ track: AudioTrack; kind: CutTrack; cuts: AudioCut[]; defaultVolume: number }> = ({ track, kind, cuts, defaultVolume }) => {
  const { fps } = useVideoConfig();
  const at = Math.round((track.at ?? 0) * fps);
  const vol = track.volume ?? defaultVolume;
  return (
    <Sequence from={at} name={kind} layout="none">
      <Audio
        src={resolveSrc(track.src)}
        trimBefore={track.trimStart ? Math.round(track.trimStart * fps) : undefined}
        volume={(f) => (isCut(cuts, kind, (at + f) / fps) ? 0 : vol)}
      />
    </Sequence>
  );
};

/**
 * Voice-over, optional music, footage cuts and SFX cues.
 * SFX are never affected by audio cuts — the silence is FOR them.
 */
export const AudioLayer: React.FC<{ spec: ReelSpec; slots: SceneSlot[] }> = ({ spec, slots }) => {
  const { fps } = useVideoConfig();
  const cuts = spec.audioCuts ?? [];

  const cues: SfxCue[] = [...(spec.sfx ?? [])];
  for (const slot of slots) {
    for (const cue of spec.scenes[slot.index].sfx ?? []) cues.push({ ...cue, at: slot.from / fps + cue.at });
  }

  return (
    <>
      {spec.voiceover && <Track track={spec.voiceover} kind="voiceover" cuts={cuts} defaultVolume={1} />}
      {spec.music && <Track track={spec.music} kind="music" cuts={cuts} defaultVolume={0.12} />}
      {cues.map((cue, i) => (
        <Sequence
          key={i}
          from={Math.max(0, Math.round(cue.at * fps))}
          durationInFrames={cue.duration ? Math.max(1, Math.round(cue.duration * fps)) : undefined}
          name={`sfx:${cue.sfx}`}
          layout="none"
        >
          <Audio src={resolveSrc(resolveSfx(cue.sfx))} volume={cue.volume ?? 0.8} playbackRate={cue.playbackRate} />
        </Sequence>
      ))}
    </>
  );
};
