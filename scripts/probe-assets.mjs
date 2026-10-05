#!/usr/bin/env node
/**
 * npm run probe -- <slug>
 * Lists every asset in public/reels/<slug>/ with duration, resolution,
 * orientation and audio — what you need to write a spec without guessing.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npm run probe -- <slug>");
  process.exit(1);
}
const root = path.resolve("public/reels", slug);
if (!fs.existsSync(root)) {
  console.error(`No folder public/reels/${slug}`);
  process.exit(1);
}

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(root).filter((f) => !path.basename(f).startsWith("."));

const probe = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate:stream_tags=rotate:stream_side_data=rotation", "-of", "json", f], { encoding: "utf8" });
  if (r.error) return null;
  try {
    return JSON.parse(r.stdout);
  } catch {
    return null;
  }
};

for (const f of files) {
  const rel = path.relative(path.resolve("public"), f);
  const info = probe(f);
  if (!info) {
    console.log(`${rel}  (ffprobe unavailable)`);
    continue;
  }
  const v = info.streams?.find((s) => s.codec_type === "video");
  const a = info.streams?.find((s) => s.codec_type === "audio");
  const dur = info.format?.duration ? `${Number(info.format.duration).toFixed(2)}s` : "";
  const rot = Math.abs(Number(v?.side_data_list?.[0]?.rotation ?? v?.tags?.rotate ?? 0)) % 180 === 90;
  const w = rot ? v?.height : v?.width;
  const h = rot ? v?.width : v?.height;
  const orient = w && h ? (h > w ? "vertical" : w > h ? "horizontal" : "square") : "";
  const fps = v?.r_frame_rate && v.r_frame_rate !== "0/0" ? `${eval(v.r_frame_rate).toFixed(0)}fps` : "";
  const isStill = /\.(png|jpe?g|webp)$/i.test(f);
  console.log([rel.padEnd(48), isStill ? "" : dur.padStart(8), w ? `${w}×${h}` : "", orient, isStill ? "" : fps, a ? "audio" : ""].filter(Boolean).join("  "));
}
