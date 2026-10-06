#!/usr/bin/env node
/**
 * npm run render -- <id> [--draft] [--no-loudnorm] [any extra remotion flags]
 *   final: 1080×1920, h264 CRF 18  → out/<id>.mp4
 *   draft: 540×960,  CRF 28, faster → out/<id>.draft.mp4
 *
 * After rendering, the audio is normalised for social platforms with ONE clean
 * gain change towards −14 LUFS, never above a −1.5 dBTP true-peak ceiling —
 * no compression or limiting, the voice isn't processed. Video is copied untouched.
 *
 * Set BROWSER_EXECUTABLE to use a pre-installed Chromium instead of the
 * one Remotion downloads.
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.error("Usage: npm run render -- <reel-id> [--draft] [--no-loudnorm]");
  process.exit(1);
}
const draft = args.includes("--draft");
const loudnorm = !args.includes("--no-loudnorm");
const extra = args.filter((a) => a !== id && a !== "--draft" && a !== "--no-loudnorm");
const out = `out/${id}${draft ? ".draft" : ""}.mp4`;
const raw = loudnorm ? out.replace(/\.mp4$/, ".raw.mp4") : out;

const cmd = ["remotion", "render", id, raw, "--codec=h264", ...(draft ? ["--scale=0.5", "--crf=28"] : ["--crf=18"]), ...extra];
if (process.env.BROWSER_EXECUTABLE) cmd.push(`--browser-executable=${process.env.BROWSER_EXECUTABLE}`);

const r = spawnSync("npx", cmd, { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);

if (loudnorm) {
  // One clean gain change, never compression: as close to −14 LUFS as the
  // true peaks allow (ceiling −1.5 dBTP). If a peak stops us short, the reel
  // ends up slightly quieter — platforms normalise anyway; the voice stays untouched.
  const TARGET_I = -14;
  const CEILING_TP = -1.5;
  const measure = spawnSync("ffmpeg", ["-hide_banner", "-i", raw, "-af", `loudnorm=I=${TARGET_I}:TP=${CEILING_TP}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const m = JSON.parse(measure.stderr.slice(measure.stderr.lastIndexOf("{"), measure.stderr.lastIndexOf("}") + 1));
  const inI = Number(m.input_i);
  const inTP = Number(m.input_tp);
  const gain = Math.min(TARGET_I - inI, CEILING_TP - inTP);
  const norm = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-c:v", "copy", "-af", `volume=${gain.toFixed(2)}dB`, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out],
    { stdio: "inherit" },
  );
  if (norm.status !== 0) process.exit(norm.status ?? 1);
  fs.rmSync(raw, { force: true });
  const limitedBy = gain < TARGET_I - inI - 0.05 ? ` (stopped by a peak at ${inTP} dBTP — lower loud SFX to get closer to ${TARGET_I})` : "";
  console.log(`audio: ${inI} LUFS ${gain >= 0 ? "+" : ""}${gain.toFixed(2)} dB → ${(inI + gain).toFixed(1)} LUFS, linear gain only${limitedBy}`);
}
console.log(`\n✓ ${out}`);
