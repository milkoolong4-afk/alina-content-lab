/**
 * Sound library. Name → file in /public/sfx.
 *
 * The repo ships with synthesized placeholder sounds (npm run sfx) so every
 * reel renders out of the box. Replace any file with a better recording of
 * the same name — specs don't change.
 *
 * Rule of thumb: a sound must SERVE a joke or a cut. Not every cut gets one.
 */
export const SFX = {
  click: "sfx/click.wav", // mouse / UI tap
  keyboard: "sfx/keyboard.wav", // a few key presses
  typing: "sfx/typing.wav", // ~1.5 s of busy typing
  notification: "sfx/notification.wav", // phone ping
  error: "sfx/error.wav", // system error buzz
  pop: "sfx/pop.wav", // sticker / label appears
  whoosh: "sfx/whoosh.wav", // whip transition
  impact: "sfx/impact.wav", // heavy hit — reveal, stamp, punchline
  scratch: "sfx/scratch.wav", // record scratch — "wait, what?"
  shutter: "sfx/shutter.wav", // freeze frame / screenshot
  bonk: "sfx/bonk.wav", // comedic hit
  boing: "sfx/boing.wav", // cartoon spring
  glitch: "sfx/glitch.wav", // digital glitch burst
  ding: "sfx/ding.wav", // success / "it works"
  tick: "sfx/tick.wav", // tiny tick for counters / list items
  thud: "sfx/thud.wav", // soft drop, text slam
} as const;

export type SfxName = keyof typeof SFX;

export const resolveSfx = (name: string): string => (name in SFX ? SFX[name as SfxName] : name);
