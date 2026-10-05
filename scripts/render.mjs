#!/usr/bin/env node
/**
 * npm run render -- <id> [--draft] [any extra remotion flags]
 *   final: 1080×1920, h264 CRF 18  → out/<id>.mp4
 *   draft: 540×960,  CRF 28, faster → out/<id>.draft.mp4
 * Set BROWSER_EXECUTABLE to use a pre-installed Chromium instead of the
 * one Remotion downloads.
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.error("Usage: npm run render -- <reel-id> [--draft]");
  process.exit(1);
}
const draft = args.includes("--draft");
const extra = args.filter((a) => a !== id && a !== "--draft");
const out = `out/${id}${draft ? ".draft" : ""}.mp4`;

const cmd = ["remotion", "render", id, out, "--codec=h264", ...(draft ? ["--scale=0.5", "--crf=28"] : ["--crf=18"]), ...extra];
if (process.env.BROWSER_EXECUTABLE) cmd.push(`--browser-executable=${process.env.BROWSER_EXECUTABLE}`);

const r = spawnSync("npx", cmd, { stdio: "inherit" });
if (r.status === 0) console.log(`\n✓ ${out}`);
process.exit(r.status ?? 1);
